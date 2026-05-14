#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/home/ubuntu/ML Inference Backend server"
VENV_PATH="${VENV_PATH:-/home/ubuntu/ML Inference Backend server/venv-medgemma}"

# Optional overrides:
#   FASTAPI_PORT=8001
#   NGROK_AUTHTOKEN=<your-token>   (or pre-configure with: ngrok config add-authtoken <token>)
#   TMUX_SESSION=medgemma-stack
FASTAPI_PORT="${FASTAPI_PORT:-8001}"
TMUX_SESSION="${TMUX_SESSION:-medgemma-stack}"
NGROK_AUTHTOKEN="${NGROK_AUTHTOKEN:-3D45WoPcnqIDsa6yS6ig0E779fF_ronDX1YwFEC8iN7V3g2H}"
HF_TOKEN="${HF_TOKEN:-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}"
export HF_TOKEN
export HUGGING_FACE_HUB_TOKEN="$HF_TOKEN"

# Ensure NVIDIA device nodes exist (safe no-op if already present).
if command -v nvidia-modprobe >/dev/null 2>&1; then
  sudo nvidia-modprobe >/dev/null 2>&1 || true
fi

if ! command -v tmux >/dev/null 2>&1; then
  echo "tmux is required. Install it first (e.g. sudo apt install tmux)." >&2
  exit 1
fi

if [[ ! -d "$VENV_PATH" ]]; then
  if [[ -n "${VIRTUAL_ENV:-}" && -f "${VIRTUAL_ENV}/bin/activate" ]]; then
    echo "No venv at $VENV_PATH — using active venv: $VIRTUAL_ENV"
    VENV_PATH="$VIRTUAL_ENV"
  else
    echo "Missing virtual env at: $VENV_PATH" >&2
    echo "Either create it with: python3 -m venv \"$VENV_PATH\"" >&2
    echo "Or activate your venv before running this script." >&2
    exit 1
  fi
fi

VENV_ACTIVATE="${VENV_PATH}/bin/activate"
source "$VENV_ACTIVATE"

# Expose CUDA libraries bundled with torch/nvidia packages so llama-cpp can find them.
NVIDIA_LIB_BASE="${VENV_PATH}/lib/python3.10/site-packages/nvidia"
export LD_LIBRARY_PATH="${NVIDIA_LIB_BASE}/cublas/lib:${NVIDIA_LIB_BASE}/cuda_runtime/lib:${NVIDIA_LIB_BASE}/cuda_nvrtc/lib:${NVIDIA_LIB_BASE}/cudnn/lib:${NVIDIA_LIB_BASE}/cufft/lib:${NVIDIA_LIB_BASE}/curand/lib:${NVIDIA_LIB_BASE}/cusolver/lib:${NVIDIA_LIB_BASE}/cusparse/lib:${NVIDIA_LIB_BASE}/nvjitlink/lib:${LD_LIBRARY_PATH:-}"

if tmux has-session -t "$TMUX_SESSION" 2>/dev/null; then
  echo "tmux session '$TMUX_SESSION' already exists. Attaching..." >&2
  exec tmux attach -t "$TMUX_SESSION"
fi

# FastAPI loads the model in-process via Llama on startup.
# MODEL_PATH points to the local Q8_K_XL file if it exists; falls back to HF hub Q4_K_M.
LOCAL_GGUF="${PROJECT_DIR}/assets/medgemma-1.5-4b-it-UD-Q8_K_XL/medgemma-1.5-4b-it-UD-Q8_K_XL.gguf"
MODEL_PATH_ENV=""
if [[ -f "$LOCAL_GGUF" ]]; then
  MODEL_PATH_ENV="export MODEL_PATH=\"$LOCAL_GGUF\" &&"
fi

tmux new-session -d -s "$TMUX_SESSION" -n fastapi
tmux send-keys -t "${TMUX_SESSION}:fastapi" \
  "cd \"$PROJECT_DIR\" && source \"$VENV_ACTIVATE\" && export LD_LIBRARY_PATH=\"$LD_LIBRARY_PATH\" && export HF_TOKEN=\"$HF_TOKEN\" && export HUGGING_FACE_HUB_TOKEN=\"$HF_TOKEN\" && ${MODEL_PATH_ENV} uvicorn gpu_inference:app --host 0.0.0.0 --port \"$FASTAPI_PORT\"" C-m

# Wait for FastAPI/model to be ready (first run downloads the GGUF, allow up to 10 min).
echo "Waiting for FastAPI on :${FASTAPI_PORT} (first run may download the model)..."
for i in $(seq 1 300); do
  if curl -sS -m 2 "http://127.0.0.1:${FASTAPI_PORT}/health" >/dev/null 2>&1; then
    echo "FastAPI is ready."
    break
  fi
  sleep 2
  if [[ "$i" -eq 300 ]]; then
    echo "Timed out waiting for FastAPI on port ${FASTAPI_PORT}." >&2
    echo "Check logs with: tmux capture-pane -t ${TMUX_SESSION}:fastapi -p" >&2
    exit 1
  fi
done

NGROK_BIN="${PROJECT_DIR}/ngrok"

tmux new-window -t "$TMUX_SESSION" -n ngrok
if [[ -n "${NGROK_AUTHTOKEN:-}" ]]; then
  tmux send-keys -t "${TMUX_SESSION}:ngrok" \
    "\"$NGROK_BIN\" config add-authtoken \"$NGROK_AUTHTOKEN\" && \"$NGROK_BIN\" http \"$FASTAPI_PORT\"" C-m
else
  tmux send-keys -t "${TMUX_SESSION}:ngrok" \
    "\"$NGROK_BIN\" http \"$FASTAPI_PORT\"" C-m
fi

tmux select-window -t "${TMUX_SESSION}:fastapi"
echo "Started tmux session '$TMUX_SESSION' with windows: fastapi, ngrok"
echo "  fastapi → http://127.0.0.1:${FASTAPI_PORT}  (model loads on startup)"
echo "  ngrok   → check ngrok window for public URL"
echo "Attach with: tmux attach -t \"$TMUX_SESSION\""
if [[ -t 1 ]]; then
  exec tmux attach -t "$TMUX_SESSION"
fi
