import { Navigation } from "../components/Navigation";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

// --- Data extracted from SQL scripts (AIHW) ---

// dementia_prevalence.sql — persons (thousands), sampled every 5 years + 2024
const prevalenceData = [
  { year: 2010, persons: 278 },
  { year: 2015, persons: 325 },
  { year: 2020, persons: 378 },
  { year: 2024, persons: 425 },
  { year: 2025, persons: 443 },
  { year: 2030, persons: 531 },
  { year: 2035, persons: 629 },
  { year: 2040, persons: 726 },
  { year: 2045, persons: 806 },
  { year: 2050, persons: 878 },
  { year: 2055, persons: 940 },
  { year: 2060, persons: 993 },
  { year: 2065, persons: 1052 },
];

// neurological_burden.sql — DALYs (thousands), 2024, Persons, Total
const neurologicalBurdenData = [
  { disease: "Guillain-Barré Syndrome", dalys: 0.4 },
  { disease: "Multiple Sclerosis", dalys: 16 },
  { disease: "Motor Neurone Disease", dalys: 17 },
  { disease: "Parkinson Disease", dalys: 45 },
  { disease: "Epilepsy", dalys: 46 },
  { disease: "Migraine", dalys: 49 },
  { disease: "Other Neurological", dalys: 50 },
  { disease: "Dementia", dalys: 262 },
];

// dementia_mortality.sql — most recent year (2023)
const mortalityTotal2023 = 17409;

const biomarkers = [
  {
    name: "Mean Length of Utterance (MLU)",
    description:
      "Measures the average number of words per sentence. Cognitive decline often shortens sentence length as patients struggle to maintain complex grammar and thought structures.",
  },
  {
    name: "Pause Ratio",
    description:
      "Tracks the frequency and duration of pauses during speech. Increased hesitation can indicate slowed verbal processing and word-retrieval difficulties common in early dementia.",
  },
  {
    name: "Type-Token Ratio (TTR)",
    description:
      "Measures lexical diversity — the proportion of unique words used. A declining TTR reflects reduced vocabulary, a hallmark of early Alzheimer's and MCI.",
  },
  {
    name: "Filler Word Count",
    description:
      "Counts words like \"um\", \"uh\", and \"you know\". A rising filler rate signals word-finding difficulty, one of the earliest detectable signs of cognitive impairment.",
  },
];

const comparisonRows = [
  {
    feature: "Administration time",
    biomarker: "Passive — recorded during routine consultation",
    mmse: "5–10 minutes",
    moca: "10–15 minutes",
  },
  {
    feature: "Patient burden",
    biomarker: "None — no extra tests required",
    mmse: "Moderate",
    moca: "Moderate",
  },
  {
    feature: "Sensitivity to early MCI",
    biomarker: "High",
    mmse: "Low",
    moca: "Moderate",
  },
  {
    feature: "Objectivity",
    biomarker: "Algorithmic — no examiner bias",
    mmse: "Examiner-dependent",
    moca: "Examiner-dependent",
  },
  {
    feature: "Detects pre-symptomatic decline",
    biomarker: "Yes",
    mmse: "No",
    moca: "Limited",
  },
  {
    feature: "Repeatable over time",
    biomarker: "Yes — every consultation",
    mmse: "Practice effect limits reuse",
    moca: "Practice effect limits reuse",
  },
];

const CustomTooltipPrevalence = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-2 border-gray-400 px-4 py-3 text-sm">
        <p className="font-bold text-gray-900 mb-1">{label}</p>
        <p className="text-gray-700">{payload[0].value}k Australians</p>
        {Number(label) > 2024 && (
          <p className="text-xs text-gray-500 mt-1">Projected</p>
        )}
      </div>
    );
  }
  return null;
};

const CustomTooltipBurden = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-2 border-gray-400 px-4 py-3 text-sm">
        <p className="font-bold text-gray-900 mb-1">{label}</p>
        <p className="text-gray-700">{payload[0].value}k DALYs (2024)</p>
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <div className="max-w-[1440px] mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Statistics Dashboard
          </h1>
          <p className="text-gray-700">
            Australian dementia prevalence and neurological disease burden data
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 border-2 border-gray-400">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Current Prevalence
            </p>
            <div className="text-3xl font-bold text-gray-900 mb-1">425,000</div>
            <p className="text-sm text-gray-700">Australians living with dementia (2024)</p>
          </div>

          <div className="bg-white p-6 border-2 border-gray-400">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Annual Mortality
            </p>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {mortalityTotal2023.toLocaleString()}
            </div>
            <p className="text-sm text-gray-700">Dementia-related deaths (2023)</p>
          </div>

          <div className="bg-white p-6 border-2 border-gray-400">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              2065 Projection
            </p>
            <div className="text-3xl font-bold text-gray-900 mb-1">1.05M</div>
            <p className="text-sm text-gray-700">Expected cases by 2065 (+278%)</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-8 mb-12">
          {/* Chart 1: Prevalence Over Time */}
          <div className="bg-white p-8 border-2 border-gray-400">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Dementia Prevalence Over Time
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Number of Australians living with dementia (thousands) — historical and projected to 2065
            </p>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={prevalenceData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}k`}
                />
                <Tooltip content={<CustomTooltipPrevalence />} />
                <ReferenceLine
                  x={2024}
                  stroke="#9ca3af"
                  strokeDasharray="4 4"
                  label={{ value: "Today", position: "top", fontSize: 11, fill: "#6b7280" }}
                />
                <Line
                  type="monotone"
                  dataKey="persons"
                  stroke="#1f2937"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#1f2937", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2: Neurological Burden */}
          <div className="bg-white p-8 border-2 border-gray-400">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Neurological Conditions by Disease Burden
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Disability-Adjusted Life Years (DALYs) in thousands — Australia 2024
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={neurologicalBurdenData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}k`}
                />
                <YAxis
                  type="category"
                  dataKey="disease"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  width={135}
                />
                <Tooltip content={<CustomTooltipBurden />} />
                <Bar dataKey="dalys" radius={0}>
                  {neurologicalBurdenData.map((entry) => (
                    <Cell
                      key={entry.disease}
                      fill={entry.disease === "Dementia" ? "#1f2937" : "#9ca3af"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* US 1.2: Speech Biomarkers Section */}
        <div className="mb-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Understanding Speech Biomarkers
            </h2>
            <p className="text-gray-700 max-w-3xl">
              Conversational biomarkers are measurable linguistic and acoustic patterns extracted
              from natural speech. Unlike traditional assessments, they can be detected
              passively during routine consultations — with no additional patient burden.
            </p>
          </div>

          {/* Biomarker Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {biomarkers.map((b) => (
              <div key={b.name} className="bg-white border-2 border-gray-400 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-2">{b.name}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="bg-white border-2 border-gray-400">
            <div className="px-6 py-4 border-b-2 border-gray-300">
              <h3 className="text-lg font-bold text-gray-900">
                How Speech Biomarkers Enhance Traditional Cognitive Assessments
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Speech biomarkers work alongside MMSE and MoCA — adding an earlier, passive signal to your existing clinical workflow
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-50">
                    <th className="text-left px-6 py-3 font-bold text-gray-700 w-1/4">Feature</th>
                    <th className="text-left px-6 py-3 font-bold text-gray-900 w-1/4">
                      Speech Biomarkers
                    </th>
                    <th className="text-left px-6 py-3 font-bold text-gray-700 w-1/4">MMSE</th>
                    <th className="text-left px-6 py-3 font-bold text-gray-700 w-1/4">MoCA</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={`border-b border-gray-200 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">{row.feature}</td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{row.biomarker}</td>
                      <td className="px-6 py-4 text-gray-600">{row.mmse}</td>
                      <td className="px-6 py-4 text-gray-600">{row.moca}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Attribution */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Data source: Australian Institute of Health and Welfare (AIHW) — Dementia in Australia 2022 &amp; Australian Burden of Disease Study 2024
          </p>
        </div>
      </div>
    </div>
  );
}
