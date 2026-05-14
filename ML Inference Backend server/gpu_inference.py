#!/usr/bin/env python3
"""
CogniTrack MedGemma Inference Server (GPU via llama-cpp-python, in-process)
"""
from __future__ import annotations

import json
import os
import re
import time
import threading
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# ── Model config ──────────────────────────────────────────────────────────────
# Set MODEL_PATH to load from a local file, otherwise falls back to HF hub.
MODEL_PATH    = os.getenv("MODEL_PATH",   "")
HF_REPO       = os.getenv("HF_REPO",     "unsloth/medgemma-1.5-4b-it-GGUF")
HF_FILENAME   = os.getenv("HF_FILENAME", "medgemma-1.5-4b-it-Q4_K_M.gguf")
MODEL_ALIAS   = os.getenv("MODEL_ALIAS", "medgemma")
# ─────────────────────────────────────────────────────────────────────────────

_llm = None

# Inference is single-threaded for deterministic pipeline output.
# Remove this lock if you want parallel requests.
_inference_lock = threading.Lock()

FILLER_WORDS = {
    "um", "uh", "er", "ah", "like", "you know", "i mean",
    "sort of", "kind of", "basically", "literally", "actually",
    "right", "okay", "so", "well",
}


# ══════════════ STAGE 1 — Rule-based biomarker extraction (unchanged) ══════════════

def _parse_segments(transcript: str) -> list[dict]:
    pattern = re.compile(
        r"\[(\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}:\d{2}:\d{2})\]\s*(.*?)(?=\[\d{2}:\d{2}:\d{2}|$)",
        re.DOTALL,
    )

    def to_sec(ts: str) -> float:
        h, mn, s = ts.split(":")
        return int(h) * 3600 + int(mn) * 60 + float(s)

    segments = []
    for m in pattern.finditer(transcript):
        text = m.group(3).strip()
        if text:
            segments.append({"start": to_sec(m.group(1)), "end": to_sec(m.group(2)), "text": text})
    return segments


def _clean_text(text: str) -> str:
    text = re.sub(r"\[.*?\]", "", text)
    return re.sub(r"\s+", " ", text).strip()


def _tokenize_words(text: str) -> list[str]:
    return [w.lower() for w in re.findall(r"\b[a-zA-Z']+\b", text)]


def _compute_mlu(segments):
    lengths = [len(_tokenize_words(_clean_text(s["text"]))) for s in segments
               if _tokenize_words(_clean_text(s["text"]))]
    return round(sum(lengths) / len(lengths), 2) if lengths else 0.0


def _compute_pause_ratio(segments):
    if len(segments) < 2:
        return 0.0
    total = segments[-1]["end"] - segments[0]["start"]
    if total <= 0:
        return 0.0
    silence = sum(max(0.0, segments[i + 1]["start"] - segments[i]["end"])
                  for i in range(len(segments) - 1)
                  if segments[i + 1]["start"] - segments[i]["end"] > 0.3)
    return round(min(1.0, silence / total), 3)


def _compute_ttr(segments):
    words = [w for s in segments for w in _tokenize_words(_clean_text(s["text"]))]
    return round(len(set(words)) / len(words), 3) if words else 0.0


def _compute_fillers(segments):
    full = _clean_text(" ".join(s["text"] for s in segments)).lower()
    found, count = [], 0
    for filler in sorted(FILLER_WORDS, key=len, reverse=True):
        hits = re.findall(r"\b" + re.escape(filler) + r"\b", full)
        if hits:
            count += len(hits)
            found.append(f'"{filler}" ×{len(hits)}')
    return count, found


def extract_rule_based_biomarkers(transcript: str) -> dict[str, Any]:
    segments = _parse_segments(transcript)
    if not segments:
        words = _tokenize_words(_clean_text(transcript))
        fc, fe = _compute_fillers([{"start": 0, "end": 60, "text": transcript}])
        return {
            "mlu_score": float(len(words)), "pause_ratio": 0.0,
            "type_token_ratio": round(len(set(words)) / max(len(words), 1), 3),
            "filler_word_count": fc,
            "_evidence": {"segment_count": 1, "total_words": len(words),
                          "filler_instances": fe, "pause_gaps": [], "recording_duration_sec": 0},
        }
    fc, fe = _compute_fillers(segments)
    pause_gaps = [f"{round(segments[i+1]['start'] - segments[i]['end'], 1)}s gap at ~{segments[i]['end']:.0f}s"
                  for i in range(len(segments) - 1)
                  if segments[i + 1]["start"] - segments[i]["end"] > 0.5]
    total_words = sum(len(_tokenize_words(_clean_text(s["text"]))) for s in segments)
    return {
        "mlu_score": _compute_mlu(segments),
        "pause_ratio": _compute_pause_ratio(segments),
        "type_token_ratio": _compute_ttr(segments),
        "filler_word_count": fc,
        "_evidence": {
            "segment_count": len(segments), "total_words": total_words,
            "filler_instances": fe, "pause_gaps": pause_gaps[:5],
            "recording_duration_sec": round(segments[-1]["end"] - segments[0]["start"], 1),
        },
    }


# ══════════════ STAGE 2 — vLLM via OpenAI-compatible API ══════════════

def _build_user_prompt(transcript: str, rb: dict) -> str:
    """Returns just the user message text (no <start_of_turn> markers — vLLM applies the chat template)."""
    ev = rb["_evidence"]
    filler_str = ", ".join(ev["filler_instances"]) if ev["filler_instances"] else "none detected"
    pause_str  = ", ".join(ev["pause_gaps"])        if ev["pause_gaps"]        else "no significant pauses"

    return f"""You are a clinical AI assistant specialising in early dementia and mild cognitive impairment (MCI) detection from conversational speech transcripts.

You have been given a speech transcript with pre-computed numeric biomarkers. Your tasks are:
1. Estimate syntactic_complexity (1.0–5.0) based on sentence structure in the transcript.
2. Assign dementia_risk_level: "Low Risk", "Moderate Risk", or "High Risk".
3. Assign confidence_score (0.0–1.0) for your risk assessment.
4. Write a SHORT (1–2 sentence) XAI summary for EACH biomarker citing SPECIFIC evidence from the transcript.

Pre-computed biomarkers:
- mlu_score: {rb['mlu_score']} words/utterance (normal: 7–12; low = simplified speech)
- pause_ratio: {rb['pause_ratio']} ({round(rb['pause_ratio']*100)}% silence/gaps)
- type_token_ratio: {rb['type_token_ratio']} (lexical diversity; <0.4 = repetitive)
- filler_word_count: {rb['filler_word_count']} — {filler_str}

Evidence:
- {ev['total_words']} total words across {ev['segment_count']} segments
- Notable pauses: {pause_str}
- Recording duration: {ev.get('recording_duration_sec', 'unknown')}s

Transcript:
{transcript[:4000]}{"... [truncated]" if len(transcript) > 4000 else ""}

Return ONLY valid JSON, no markdown fences, no text outside the JSON:
{{
  "syntactic_complexity": <float 1.0-5.0>,
  "dementia_risk_level": "<Low Risk|Moderate Risk|High Risk>",
  "confidence_score": <float 0.0-1.0>,
  "biomarker_summaries": {{
    "mlu_score":            {{"value": {rb['mlu_score']},          "summary": "<evidence-based 1-2 sentences>"}},
    "pause_ratio":          {{"value": {rb['pause_ratio']},         "summary": "<evidence-based 1-2 sentences>"}},
    "type_token_ratio":     {{"value": {rb['type_token_ratio']},    "summary": "<evidence-based 1-2 sentences>"}},
    "filler_word_count":    {{"value": {rb['filler_word_count']},   "summary": "<evidence-based 1-2 sentences>"}},
    "syntactic_complexity": {{"value": <your estimate>,             "summary": "<evidence-based 1-2 sentences>"}},
    "overall_risk":         {{"value": "<your risk level>",         "summary": "<2-3 sentence clinical interpretation>"}}
  }}
}}"""


def _parse_response(raw: str, rb: dict) -> dict[str, Any]:
    clean = re.sub(r"```(?:json)?", "", raw).strip().rstrip("`")

    def _default_summaries():
        return {
            "mlu_score":            {"value": rb["mlu_score"],           "summary": "Unable to generate summary."},
            "pause_ratio":          {"value": rb["pause_ratio"],          "summary": "Unable to generate summary."},
            "type_token_ratio":     {"value": rb["type_token_ratio"],     "summary": "Unable to generate summary."},
            "filler_word_count":    {"value": rb["filler_word_count"],    "summary": "Unable to generate summary."},
            "syntactic_complexity": {"value": 2.5,                        "summary": "Unable to generate summary."},
            "overall_risk":         {"value": "Low Risk",                 "summary": "Unable to generate summary."},
        }

    defaults = {
        "syntactic_complexity": 2.5, "dementia_risk_level": "Low Risk",
        "confidence_score": 0.5, "biomarker_summaries": _default_summaries(),
    }

    def _clamp(value: float, lo: float, hi: float, ndigits: int) -> float:
        return round(min(hi, max(lo, value)), ndigits)

    def _extract_float(field: str, lo: float, hi: float, ndigits: int, default: float) -> float:
        m = re.search(rf'"{re.escape(field)}"\s*:\s*(-?\d+(?:\.\d+)?)', clean)
        if not m:
            return default
        try:
            return _clamp(float(m.group(1)), lo, hi, ndigits)
        except (ValueError, TypeError):
            return default

    def _extract_risk(default: str) -> str:
        m = re.search(r'"dementia_risk_level"\s*:\s*"([^"]+)"', clean)
        if not m:
            return default
        risk = m.group(1).strip()
        if risk in {"Low Risk", "Moderate Risk", "High Risk"}:
            return risk
        return default

    def _extract_summary(key: str) -> str | None:
        key_idx = clean.find(f'"{key}"')
        if key_idx < 0:
            return None
        summary_idx = clean.find('"summary"', key_idx)
        if summary_idx < 0:
            return None
        colon_idx = clean.find(":", summary_idx)
        if colon_idx < 0:
            return None
        quote_idx = clean.find('"', colon_idx + 1)
        if quote_idx < 0:
            return None

        i = quote_idx + 1
        buf: list[str] = []
        escaped = False
        while i < len(clean):
            ch = clean[i]
            if escaped:
                buf.append(ch)
                escaped = False
            elif ch == "\\":
                escaped = True
                buf.append(ch)
            elif ch == '"':
                raw_summary = "".join(buf)
                try:
                    return json.loads(f'"{raw_summary}"').strip()
                except json.JSONDecodeError:
                    return raw_summary.replace("\\n", " ").replace('\\"', '"').strip()
            else:
                buf.append(ch)
            i += 1

        raw_summary = "".join(buf).replace("\\n", " ").replace('\\"', '"').strip()
        if raw_summary:
            return f"{raw_summary} [truncated]"
        return None

    def _normalize_from_data(data: dict[str, Any]) -> dict[str, Any]:
        sums = data.get("biomarker_summaries", {})
        sc = _clamp(float(data.get("syntactic_complexity", defaults["syntactic_complexity"])), 1.0, 5.0, 2)
        risk = str(data.get("dementia_risk_level", defaults["dementia_risk_level"]))
        if risk not in {"Low Risk", "Moderate Risk", "High Risk"}:
            risk = defaults["dementia_risk_level"]
        confidence = _clamp(float(data.get("confidence_score", defaults["confidence_score"])), 0.0, 1.0, 3)

        def get(key: str, val: Any) -> dict[str, Any]:
            return {"value": val, "summary": str(sums.get(key, {}).get("summary", "No summary."))}

        return {
            "syntactic_complexity": sc,
            "dementia_risk_level": risk,
            "confidence_score": confidence,
            "biomarker_summaries": {
                "mlu_score":            get("mlu_score", rb["mlu_score"]),
                "pause_ratio":          get("pause_ratio", rb["pause_ratio"]),
                "type_token_ratio":     get("type_token_ratio", rb["type_token_ratio"]),
                "filler_word_count":    get("filler_word_count", rb["filler_word_count"]),
                "syntactic_complexity": {"value": sc, "summary": str(sums.get("syntactic_complexity", {}).get("summary", "No summary."))},
                "overall_risk":         {"value": risk, "summary": str(sums.get("overall_risk", {}).get("summary", "No summary."))},
            },
        }

    # Try strict JSON parse first.
    match = re.search(r"\{.*\}", clean, re.DOTALL)
    if match:
        try:
            return _normalize_from_data(json.loads(match.group()))
        except (json.JSONDecodeError, ValueError, TypeError):
            pass

    # If JSON appears truncated, attempt a minimal brace-repair parse.
    first_brace = clean.find("{")
    if first_brace >= 0:
        candidate = clean[first_brace:]
        open_count = candidate.count("{")
        close_count = candidate.count("}")
        if open_count > close_count:
            candidate = candidate + ("}" * (open_count - close_count))
        try:
            return _normalize_from_data(json.loads(candidate))
        except (json.JSONDecodeError, ValueError, TypeError):
            pass

    # Last-resort recovery from partial/truncated output.
    recovered = defaults.copy()
    sc = _extract_float("syntactic_complexity", 1.0, 5.0, 2, defaults["syntactic_complexity"])
    risk = _extract_risk(defaults["dementia_risk_level"])
    confidence = _extract_float("confidence_score", 0.0, 1.0, 3, defaults["confidence_score"])

    summaries = _default_summaries()
    for key in ("mlu_score", "pause_ratio", "type_token_ratio", "filler_word_count", "syntactic_complexity", "overall_risk"):
        parsed_summary = _extract_summary(key)
        if parsed_summary:
            summaries[key]["summary"] = parsed_summary

    summaries["syntactic_complexity"]["value"] = sc
    summaries["overall_risk"]["value"] = risk

    recovered["syntactic_complexity"] = sc
    recovered["dementia_risk_level"] = risk
    recovered["confidence_score"] = confidence
    recovered["biomarker_summaries"] = summaries
    return recovered


# ══════════════ FastAPI ══════════════

@asynccontextmanager
async def lifespan(app: FastAPI):
    global _llm
    from llama_cpp import Llama
    if os.path.isfile(MODEL_PATH):
        print(f"Loading model from local file: {MODEL_PATH}")
        _llm = Llama(
            model_path=MODEL_PATH,
            n_gpu_layers=-1,
            n_ctx=8192,
            chat_format="gemma",
            verbose=False,
        )
    else:
        print(f"Local file not found — pulling {HF_REPO}/{HF_FILENAME} via HF hub...")
        _llm = Llama.from_pretrained(
            repo_id=HF_REPO,
            filename=HF_FILENAME,
            n_gpu_layers=-1,
            n_ctx=8192,
            chat_format="gemma",
            verbose=False,
        )
    print(f"Model ready — {MODEL_ALIAS}")
    yield
    _llm = None


app = FastAPI(title="CogniTrack MedGemma GPU Inference Server", lifespan=lifespan)


class AnalysisRequest(BaseModel):
    prompt: str
    max_new_tokens: int = Field(default=600, ge=1, le=2048)


class BiomarkerDetail(BaseModel):
    value: Any
    summary: str


class BiomarkerSummaries(BaseModel):
    mlu_score: BiomarkerDetail
    pause_ratio: BiomarkerDetail
    type_token_ratio: BiomarkerDetail
    filler_word_count: BiomarkerDetail
    syntactic_complexity: BiomarkerDetail
    overall_risk: BiomarkerDetail


class AnalysisResponse(BaseModel):
    mlu_score: float
    pause_ratio: float
    type_token_ratio: float
    filler_word_count: int
    syntactic_complexity: float
    dementia_risk_level: str
    confidence_score: float
    biomarker_summaries: BiomarkerSummaries
    medgemma_latency_sec: float
    raw_response: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model": MODEL_ALIAS, "backend": "llama-cpp-gpu"}


@app.get("/v1/models")
def list_models() -> dict[str, Any]:
    return {"object": "list",
            "data": [{"id": MODEL_ALIAS, "object": "model",
                      "created": int(time.time()), "owned_by": "local"}]}


@app.post("/v1/chat/completions", response_model=AnalysisResponse)
@app.post("/chat", response_model=AnalysisResponse)
def chat(req: AnalysisRequest) -> AnalysisResponse:
    if not _inference_lock.acquire(blocking=False):
        raise HTTPException(status_code=503, detail="Server busy — inference already running, please retry")
    try:
        return _run_chat(req)
    finally:
        _inference_lock.release()


def _run_chat(req: AnalysisRequest) -> AnalysisResponse:
    if _llm is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")
    rb = extract_rule_based_biomarkers(req.prompt)
    user_text = _build_user_prompt(req.prompt, rb)

    t0 = time.time()
    try:
        data = _llm.create_chat_completion(
            messages=[{"role": "user", "content": user_text}],
            max_tokens=req.max_new_tokens,
            temperature=0.0,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"llama-cpp error: {e}")
    elapsed = round(time.time() - t0, 3)

    raw_text = data["choices"][0]["message"]["content"].strip()
    n_tokens = data.get("usage", {}).get("completion_tokens", 0)
    result = _parse_response(raw_text, rb)

    print(f"[{time.strftime('%H:%M:%S')}] latency={elapsed}s | tokens={n_tokens} | "
          f"risk={result['dementia_risk_level']} | mlu={rb['mlu_score']} | fillers={rb['filler_word_count']}")

    sums = result["biomarker_summaries"]
    return AnalysisResponse(
        mlu_score=rb["mlu_score"], pause_ratio=rb["pause_ratio"],
        type_token_ratio=rb["type_token_ratio"], filler_word_count=rb["filler_word_count"],
        syntactic_complexity=result["syntactic_complexity"],
        dementia_risk_level=result["dementia_risk_level"],
        confidence_score=result["confidence_score"],
        biomarker_summaries=BiomarkerSummaries(
            mlu_score=BiomarkerDetail(**sums["mlu_score"]),
            pause_ratio=BiomarkerDetail(**sums["pause_ratio"]),
            type_token_ratio=BiomarkerDetail(**sums["type_token_ratio"]),
            filler_word_count=BiomarkerDetail(**sums["filler_word_count"]),
            syntactic_complexity=BiomarkerDetail(**sums["syntactic_complexity"]),
            overall_risk=BiomarkerDetail(**sums["overall_risk"]),
        ),
        medgemma_latency_sec=elapsed, raw_response=raw_text,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
