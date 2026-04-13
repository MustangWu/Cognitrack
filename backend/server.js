require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3001;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "NeuroTechCare API running" });
});

// GET /api/prevalence — dementia prevalence by year
app.get("/api/prevalence", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT year, men, women, persons, age_30_64, age_65_84, age_85_plus FROM dementia_prevalence ORDER BY year"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch prevalence data" });
  }
});

// GET /api/mortality — dementia mortality by year
app.get("/api/mortality", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT year, deaths_men, deaths_women, deaths_persons, asr_men, asr_women, asr_persons FROM dementia_mortality ORDER BY year"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch mortality data" });
  }
});

// GET /api/burden — neurological burden totals (2024, Persons, Total)
app.get("/api/burden", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT disease, daly, yll, yld
       FROM neurological_burden
       WHERE year = 2024 AND sex = 'Persons' AND age_group = 'Total'
       ORDER BY daly DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch burden data" });
  }
});

// GET /api/burden-of-disease — top diseases by DALY (2024, Persons, Total)
app.get("/api/burden-of-disease", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sex, age_group, rank, disease, daly
       FROM dementia_burden_of_disease
       WHERE sex = 'Persons'
       ORDER BY age_group, rank`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch burden of disease data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
