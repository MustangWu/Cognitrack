import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { ElevenLabsClient } from "elevenlabs";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME || "neurotechcare",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "",
    });

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) cb(null, true);
    else cb(new Error("Invalid file type. Only audio files are accepted."));
  },
});

// EC2_ENDPOINT should point to the /chat route, e.g.:
// EC2_ENDPOINT=http://ec2-52-206-128-95.compute-1.amazonaws.com:8000/chat
const EC2_ENDPOINT = process.env.EC2_ENDPOINT || null;

const elevenlabs = process.env.ELEVENLABS_API_KEY
  ? new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY })
  : null;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTimestamp(seconds) {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function buildTimestampedTranscript(words) {
  const segments = [];
  let current = null;
  for (const word of words) {
    if (word.type !== "word") continue;
    if (!current) {
      current = { start: word.start, end: word.end, words: [word.text] };
    } else if (word.start - current.end > 1.5) {
      segments.push(current);
      current = { start: word.start, end: word.end, words: [word.text] };
    } else {
      current.end = word.end;
      current.words.push(word.text);
    }
  }
  if (current) segments.push(current);
  return segments
    .map(
      (s) =>
        `[${formatTimestamp(s.start)} - ${formatTimestamp(s.end)}] ${s.words.join(" ")}`,
    )
    .join("\n");
}

async function transcribeAudio(audioBuffer) {
  if (!elevenlabs) return "[Transcript — ELEVENLABS_API_KEY not set]";
  const result = await elevenlabs.speechToText.convert({
    file: new Blob([audioBuffer], { type: "audio/wav" }),
    model_id: "scribe_v1",
  });
  return result.words?.length
    ? buildTimestampedTranscript(result.words)
    : result.text;
}

/**
 * Compute trend_direction by comparing the new confidence_score against the
 * person's most recent previous assessment.
 * Returns "stable" | "improving" | "declining"
 */
async function computeTrendDirection(
  client,
  personId,
  newConfidenceScore,
  newRiskLevel,
) {
  const { rows } = await client.query(
    `SELECT RA.confidence_score, RA.dementia_risk_level
     FROM risk_assessment RA
     JOIN biomarker_analysis BA ON RA.analysis_id = BA.analysis_id
     WHERE BA.person_id = $1
     ORDER BY BA.analysis_timestamp DESC
     LIMIT 1`,
    [personId],
  );

  if (rows.length === 0) return "stable"; // first recording — no history to compare

  const prev = rows[0];
  const scoreDelta = newConfidenceScore - parseFloat(prev.confidence_score);

  const riskOrder = { "Low Risk": 0, "Moderate Risk": 1, "High Risk": 2 };
  const riskDelta =
    (riskOrder[newRiskLevel] ?? 1) - (riskOrder[prev.dementia_risk_level] ?? 1);

  if (riskDelta > 0 || scoreDelta > 0.05) return "declining";
  if (riskDelta < 0 || scoreDelta < -0.05) return "improving";
  return "stable";
}

/**
 * Call the EC2 MedGemma inference server.
 * Returns flat biomarkers + biomarker_summaries from a single /chat call.
 * trend_direction is computed here in the backend from DB history.
 */
async function callMLInference(audioBuffer) {
  const text_transcript = await transcribeAudio(audioBuffer);

  if (EC2_ENDPOINT) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 900_000); // 15 min timeout for CPU inference

    let mlResult;
    try {
      const response = await fetch(EC2_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ prompt: text_transcript, max_new_tokens: 900 }),
        signal: controller.signal,
      });
      if (response.status === 503)
        throw new Error("The analysis server is currently busy. Please wait a moment and try again.");
      if (!response.ok)
        throw new Error(`ML inference failed: ${response.statusText}`);
      mlResult = await response.json();
    } finally {
      clearTimeout(timeout);
    }

    return { ...mlResult, text_transcript };
  }

  // Stub — used when EC2_ENDPOINT is not set (local dev / testing)
  return {
    text_transcript,
    mlu_score: 8.5,
    pause_ratio: 0.12,
    type_token_ratio: 0.65,
    filler_word_count: 3,
    syntactic_complexity: 2.1,
    dementia_risk_level: "Low Risk",
    confidence_score: 0.82,
    trend_direction: "stable",
    biomarker_summaries: {
      mlu_score: {
        value: 8.5,
        summary: "Stub summary — EC2 endpoint not configured.",
      },
      pause_ratio: {
        value: 0.12,
        summary: "Stub summary — EC2 endpoint not configured.",
      },
      type_token_ratio: {
        value: 0.65,
        summary: "Stub summary — EC2 endpoint not configured.",
      },
      filler_word_count: {
        value: 3,
        summary: "Stub summary — EC2 endpoint not configured.",
      },
      syntactic_complexity: {
        value: 2.1,
        summary: "Stub summary — EC2 endpoint not configured.",
      },
      overall_risk: {
        value: "Low Risk",
        summary: "Stub summary — EC2 endpoint not configured.",
      },
    },
  };
}

// ── Routes ────────────────────────────────────────────────────────────────────

// Lookup: distinct neurological conditions for the dropdown
app.get("/api/neurological-conditions", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT disease FROM neurological_burden ORDER BY disease`,
    );
    res.json(result.rows.map((r) => r.disease));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Graph 1: Burden of disease by age group
app.get("/api/neurological-burden-by-age", async (_req, res) => {
  try {
    const year = parseInt(_req.query.year) || 2024;
    const sex = _req.query.sex || "Persons";
    const measure = _req.query.measure || "daly";
    const disease = _req.query.disease || "";

    const rateCol =
      measure === "yll"
        ? "crude_yll_rate"
        : measure === "yld"
          ? "crude_yld_rate"
          : "crude_daly_rate";
    const valCol =
      measure === "yll" ? "yll" : measure === "yld" ? "yld" : "daly";

    const ageDiseaseFilter = disease ? `AND disease = $3` : "";
    const ageParams = disease ? [year, sex, disease] : [year, sex];
    const kpiDiseaseFilter = disease ? `AND disease = $2` : "";
    const kpiParams = disease ? [year, disease] : [year];

    const ageResult = await pool.query(
      `SELECT age_group,
              SUM(${valCol}) AS value,
              SUM(${rateCol}) AS crude_rate
       FROM neurological_burden
       WHERE year = $1 AND sex = $2 AND age_group != 'Total'
       ${ageDiseaseFilter}
       GROUP BY age_group
       ORDER BY CASE age_group
         WHEN '0' THEN 0 WHEN '1–4' THEN 1 WHEN '5–9' THEN 2
         WHEN '10–14' THEN 3 WHEN '15–19' THEN 4 WHEN '20–24' THEN 5
         WHEN '25–29' THEN 6 WHEN '30–34' THEN 7 WHEN '35–39' THEN 8
         WHEN '40–44' THEN 9 WHEN '45–49' THEN 10 WHEN '50–54' THEN 11
         WHEN '55–59' THEN 12 WHEN '60–64' THEN 13 WHEN '65–69' THEN 14
         WHEN '70–74' THEN 15 WHEN '75–79' THEN 16 WHEN '80–84' THEN 17
         WHEN '85–89' THEN 18 WHEN '90–94' THEN 19 WHEN '95–99' THEN 20
         WHEN '100+' THEN 21 ELSE 99 END`,
      ageParams,
    );

    const kpiResult = await pool.query(
      `SELECT sex, SUM(${valCol}) AS total
       FROM neurological_burden
       WHERE year = $1 AND age_group = 'Total'
       ${kpiDiseaseFilter}
       GROUP BY sex`,
      kpiParams,
    );

    res.json({ ageGroups: ageResult.rows, kpis: kpiResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Graph 2: Leading 10 causes of disease burden
const AGE_GROUPS = [
  "Under 30",
  "30–64",
  "65–69",
  "70–74",
  "75–79",
  "80–84",
  "85+",
];

app.get("/api/burden-top10", async (_req, res) => {
  try {
    const sex = _req.query.sex || "Persons";
    const ageFrom = Math.max(
      0,
      Math.min(6, parseInt(_req.query.age_from) || 0),
    );
    const ageTo = Math.max(0, Math.min(6, parseInt(_req.query.age_to) || 6));

    const selectedGroups = AGE_GROUPS.slice(
      Math.min(ageFrom, ageTo),
      Math.max(ageFrom, ageTo) + 1,
    );
    const useTotal = selectedGroups.length === AGE_GROUPS.length;
    const filterGroups = useTotal ? ["Total"] : selectedGroups;

    const result = await pool.query(
      `SELECT disease, SUM(daly) AS daly
       FROM dementia_burden_of_disease
       WHERE sex = $1 AND age_group = ANY($2::text[])
       GROUP BY disease
       ORDER BY SUM(daly) DESC
       LIMIT 10`,
      [sex, filterGroups],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Graph 3: Australians living with dementia 2025–2065
app.get("/api/dementia-prevalence", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT year, men, women, persons, age_30_64, age_65_84, age_85_plus
      FROM dementia_prevalence WHERE year >= 2025 ORDER BY year
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Graph 4: Deaths due to dementia
app.get("/api/dementia-mortality", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT year,
        deaths_men, deaths_women, deaths_persons,
        asr_men, asr_women, asr_persons,
        crude_men, crude_women, crude_persons
      FROM dementia_mortality ORDER BY year
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Upload audio → transcribe → ML inference → store results
app.post("/api/recordings", upload.single("audio"), async (req, res) => {
  const { person_id, recording_date } = req.body;
  const audioFile = req.file;

  if (!person_id || !audioFile) {
    return res
      .status(400)
      .json({ error: "person_id and audio file are required" });
  }

  // Run ElevenLabs + EC2 inference before acquiring a DB connection —
  // inference takes 2–15 min and would exhaust the connection's idle timeout.
  const mlResult = await callMLInference(audioFile.buffer).catch((err) => {
    res.status(500).json({ error: "Inference failed: " + err.message });
    return null;
  });
  if (!mlResult) return;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const trend_direction = await computeTrendDirection(
      client,
      person_id,
      mlResult.confidence_score,
      mlResult.dementia_risk_level,
    );
    mlResult.trend_direction = trend_direction;

    // Insert recording
    const {
      rows: [rec],
    } = await client.query(
      `INSERT INTO recording (recording_date, text_transcript, person_id)
       VALUES ($1, $2, $3) RETURNING recording_id`,
      [
        recording_date || new Date().toISOString().split("T")[0],
        mlResult.text_transcript,
        person_id,
      ],
    );

    // Insert biomarker analysis — include biomarker_summaries as JSONB
    const {
      rows: [analysis],
    } = await client.query(
      `INSERT INTO biomarker_analysis
         (mlu_score, pause_ratio, type_token_ratio, filler_word_count,
          syntactic_complexity, biomarker_summaries, recording_id, person_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING analysis_id`,
      [
        mlResult.mlu_score,
        mlResult.pause_ratio,
        mlResult.type_token_ratio,
        mlResult.filler_word_count,
        mlResult.syntactic_complexity,
        JSON.stringify(mlResult.biomarker_summaries ?? null),
        rec.recording_id,
        person_id,
      ],
    );

    // Insert risk assessment — trend_direction computed from DB history
    await client.query(
      `INSERT INTO risk_assessment
         (dementia_risk_level, confidence_score, trend_direction, analysis_id)
       VALUES ($1, $2, $3, $4)`,
      [
        mlResult.dementia_risk_level,
        mlResult.confidence_score,
        mlResult.trend_direction,
        analysis.analysis_id,
      ],
    );

    // Keep person's risk_level and last_visit current
    await client.query(
      `UPDATE person SET risk_level = $1, last_visit = $2 WHERE person_id = $3`,
      [
        mlResult.dementia_risk_level,
        recording_date || new Date().toISOString().split("T")[0],
        person_id,
      ],
    );

    await client.query("COMMIT");

    res.status(201).json({
      recording_id: rec.recording_id,
      analysis_id: analysis.analysis_id,
      transcript: mlResult.text_transcript,
      biomarkers: {
        mlu_score: mlResult.mlu_score,
        pause_ratio: mlResult.pause_ratio,
        type_token_ratio: mlResult.type_token_ratio,
        filler_word_count: mlResult.filler_word_count,
        syntactic_complexity: mlResult.syntactic_complexity,
        biomarker_summaries: mlResult.biomarker_summaries ?? null,
      },
      risk: {
        dementia_risk_level: mlResult.dementia_risk_level,
        confidence_score: mlResult.confidence_score,
        trend_direction: mlResult.trend_direction,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to process recording", debug: err?.message ?? String(err) });
  } finally {
    client.release();
  }
});

// Fetch a single analysis by ID
app.get("/api/analyses/:analysisId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         BA.analysis_id,
         BA.mlu_score,
         BA.pause_ratio,
         BA.type_token_ratio,
         BA.filler_word_count,
         BA.syntactic_complexity,
         BA.biomarker_summaries,
         BA.person_id,
         RA.dementia_risk_level,
         RA.confidence_score,
         RA.trend_direction,
         R.recording_date,
         R.text_transcript,
         P.name AS person_name
       FROM biomarker_analysis BA
       JOIN risk_assessment RA ON BA.analysis_id = RA.analysis_id
       JOIN recording R        ON BA.recording_id = R.recording_id
       JOIN person P           ON BA.person_id = P.person_id
       WHERE BA.analysis_id = $1`,
      [req.params.analysisId],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Analysis not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Person biomarker history — includes biomarker_summaries
app.get("/api/persons/:personId/history", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         BA.analysis_id,
         BA.analysis_timestamp,
         BA.mlu_score,
         BA.pause_ratio,
         BA.type_token_ratio,
         BA.filler_word_count,
         BA.syntactic_complexity,
         BA.biomarker_summaries,
         RA.dementia_risk_level,
         RA.confidence_score,
         RA.trend_direction,
         R.recording_date,
         R.text_transcript
       FROM biomarker_analysis BA
       JOIN risk_assessment RA ON BA.analysis_id = RA.analysis_id
       JOIN recording R        ON BA.recording_id = R.recording_id
       WHERE BA.person_id = $1
       ORDER BY BA.analysis_timestamp DESC`,
      [req.params.personId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// List all persons
app.get("/api/persons", async (req, res) => {
  const userEmail = req.headers["x-user-email"];
  if (!userEmail) return res.status(401).json({ error: "Unauthorized" });
  try {
    const result = await pool.query(
      `SELECT
         p.person_id,
         p.name,
         p.age,
         p.gender,
         p.risk_level,
         p.last_visit,
         COUNT(DISTINCT r.recording_id)::int AS total_uploads,
         (SELECT ra.trend_direction
          FROM risk_assessment ra
          JOIN biomarker_analysis ba ON ra.analysis_id = ba.analysis_id
          WHERE ba.person_id = p.person_id
          ORDER BY ba.analysis_timestamp DESC
          LIMIT 1) AS risk_trend
       FROM person p
       LEFT JOIN recording r ON p.person_id = r.person_id
       WHERE p.created_by = $1
       GROUP BY p.person_id, p.name, p.age, p.gender, p.risk_level, p.last_visit
       ORDER BY p.name ASC`,
      [userEmail],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Person lookup
app.get("/api/persons/:personId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT person_id, name, age, gender, risk_level, last_visit
       FROM person WHERE person_id = $1`,
      [req.params.personId],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Person not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Update person
app.put("/api/persons/:personId", async (req, res) => {
  try {
    const { name, age, gender } = req.body;
    if (!name || !age || !gender) {
      return res.status(400).json({ error: "name, age, and gender are required" });
    }
    const result = await pool.query(
      `UPDATE person SET name = $1, age = $2, gender = $3
       WHERE person_id = $4
       RETURNING person_id, name, age, gender, risk_level, last_visit`,
      [name, parseInt(age), gender, req.params.personId],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Person not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Delete person and all associated data
app.delete("/api/persons/:personId", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `DELETE FROM risk_assessment
       WHERE analysis_id IN (
         SELECT analysis_id FROM biomarker_analysis WHERE person_id = $1
       )`,
      [req.params.personId],
    );
    await client.query(`DELETE FROM biomarker_analysis WHERE person_id = $1`, [req.params.personId]);
    await client.query(`DELETE FROM recording WHERE person_id = $1`, [req.params.personId]);
    const result = await client.query(`DELETE FROM person WHERE person_id = $1 RETURNING person_id`, [req.params.personId]);
    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Person not found" });
    }
    await client.query("COMMIT");
    res.json({ deleted: req.params.personId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  } finally {
    client.release();
  }
});

// Create person
app.post("/api/persons", async (req, res) => {
  try {
    const { person_id, name, age, gender } = req.body;
    const created_by = req.headers["x-user-email"] || null;
    if (!person_id || !name || !age || !gender) {
      return res
        .status(400)
        .json({ error: "person_id, name, age, and gender are required" });
    }
    const result = await pool.query(
      `INSERT INTO person (person_id, name, age, gender, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING person_id, name, age, gender, risk_level, last_visit`,
      [person_id, name, parseInt(age), gender, created_by],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res
        .status(409)
        .json({ error: "A person with this ID already exists" });
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Serve Vite build in production
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
}

const PORT = process.env.PORT || process.env.API_PORT || 3001;
app.listen(PORT, () =>
  console.log(`API server running on http://localhost:${PORT}`),
);
