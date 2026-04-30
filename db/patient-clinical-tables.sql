-- Clinical patient tables for speech biomarker analysis
-- PATIENT_BIOMARKER_HISTORY table is intentionally omitted.
-- To get that data, join biomarker_analysis + risk_assessment:
--   SELECT BA.analysis_timestamp, BA.mlu_score, BA.pause_ratio, BA.type_token_ratio,
--          BA.filler_word_count, RA.dementia_risk_level, RA.trend_direction
--   FROM biomarker_analysis BA
--   JOIN risk_assessment RA ON BA.analysis_id = RA.analysis_id
--   WHERE BA.patient_id = :patient_id
--   ORDER BY BA.analysis_timestamp DESC;

CREATE TABLE IF NOT EXISTS patient (
  patient_id   VARCHAR(50) PRIMARY KEY,        -- clinician-assigned ID e.g. PT2024001
  name         VARCHAR(200) NOT NULL,
  age          INTEGER NOT NULL CHECK (age > 0 AND age < 131),
  gender       VARCHAR(50) NOT NULL,
  risk_level   VARCHAR(50),                    -- current risk; updated after each analysis
  created_by   VARCHAR(200),                   -- clinician who registered the patient
  last_visit   DATE,                           -- date of most recent recording
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recording (
  recording_id      SERIAL PRIMARY KEY,
  upload_timestamp  TIMESTAMPTZ DEFAULT NOW(),
  recording_date    DATE,
  text_transcript   TEXT,
  patient_id        VARCHAR(50) NOT NULL REFERENCES patient(patient_id)
);

CREATE TABLE IF NOT EXISTS biomarker_analysis (
  analysis_id          SERIAL PRIMARY KEY,
  mlu_score            NUMERIC(8,4),
  pause_ratio          NUMERIC(8,4),
  type_token_ratio     NUMERIC(8,4),
  filler_word_count    INTEGER,
  syntactic_complexity NUMERIC(8,4),
  biomarker_summaries  JSONB,
  analysis_timestamp   TIMESTAMPTZ DEFAULT NOW(),
  recording_id         INTEGER NOT NULL REFERENCES recording(recording_id),
  patient_id           VARCHAR(50) NOT NULL REFERENCES patient(patient_id)
);

CREATE TABLE IF NOT EXISTS risk_assessment (
  risk_id              SERIAL PRIMARY KEY,
  dementia_risk_level  VARCHAR(50),
  confidence_score     NUMERIC(5,4),
  trend_direction      VARCHAR(20),
  analysis_id          INTEGER NOT NULL REFERENCES biomarker_analysis(analysis_id)
);
