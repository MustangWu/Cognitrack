import { Navigation } from "../components/Navigation";
import { Download, FileText, UploadCloud, X, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";
import jsPDF from "jspdf";
import { useSession, type AnalysisResult } from "../context/SessionContext";

type BiomarkerKey = "mlu_score" | "pause_ratio" | "type_token_ratio" | "filler_word_count" | "syntactic_complexity" | "overall_risk";

const FOUR_METRICS = ["mlu_score", "pause_ratio", "type_token_ratio", "filler_word_count"] as const;
type MetricKey = (typeof FOUR_METRICS)[number];

const METRIC_LABEL: Record<MetricKey, string> = {
  mlu_score: "MLU Score",
  pause_ratio: "Pause Ratio",
  type_token_ratio: "Type-Token Ratio",
  filler_word_count: "Filler Word Count",
};

const EXPLAIN_TITLES: Record<BiomarkerKey, string> = {
  mlu_score: "MLU Score Analysis",
  pause_ratio: "Pause Ratio Analysis",
  type_token_ratio: "Type-Token Ratio Analysis",
  filler_word_count: "Filler Word Count Analysis",
  syntactic_complexity: "Syntactic Complexity",
  overall_risk: "Overall Risk",
};

const borderClass: Record<BiomarkerKey, string> = {
  mlu_score: "border-l-4 border-blue-500",
  pause_ratio: "border-l-4 border-amber-500",
  type_token_ratio: "border-l-4 border-green-500",
  filler_word_count: "border-l-4 border-purple-500",
  syntactic_complexity: "border-l-4 border-rose-500",
  overall_risk: "border-l-4 border-indigo-500",
};

const barColor: Record<MetricKey, string> = {
  mlu_score: "bg-blue-500",
  pause_ratio: "bg-amber-500",
  type_token_ratio: "bg-emerald-500",
  filler_word_count: "bg-purple-500",
};

const pdfColor: Record<BiomarkerKey, [number, number, number]> = {
  mlu_score: [59, 130, 246],
  pause_ratio: [245, 158, 11],
  type_token_ratio: [34, 197, 94],
  filler_word_count: [168, 85, 247],
  syntactic_complexity: [244, 63, 94],
  overall_risk: [99, 102, 241],
};

function formatMetricValue(k: MetricKey, v: number): { text: string; bar: number } {
  if (k === "pause_ratio") return { text: `${(v * 100).toFixed(1)}%`, bar: Math.min(1, v) };
  if (k === "type_token_ratio") return { text: v.toFixed(3), bar: Math.min(1, v) };
  if (k === "filler_word_count") return { text: String(v), bar: Math.min(1, v / 20) };
  return { text: v.toFixed(2), bar: Math.min(1, v / 15) };
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
}

function riskStyles(level: string): string {
  const l = level.toLowerCase();
  if (l.includes("high")) return "bg-red-50 text-red-800 border border-red-200";
  if (l.includes("moderate")) return "bg-amber-50 text-amber-800 border border-amber-200";
  return "bg-blue-50 text-[#2d5a8f] border border-blue-200";
}

function exportToPDF(s: AnalysisResult) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  doc.setFillColor(45, 90, 143);
  doc.rect(0, 0, pageWidth, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Cognitrack", margin, 9.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Analysis Report", pageWidth - margin, 9.5, { align: "right" });

  y = 26;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Analysis Results", margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`Person: ${s.personName} (${s.personId})`, margin, y);
  y += 5;
  doc.text(`Recording Date: ${formatDate(s.recordingDate)}`, margin, y);
  y += 5;
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}`,
    margin, y
  );
  y += 5;
  doc.text(
    `Risk: ${s.dementia_risk_level} · Confidence: ${(s.confidence_score * 100).toFixed(0)}%`,
    margin, y
  );
  y += 8;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Speech Biomarker Metrics", margin, y);
  y += 7;

  const metrics = FOUR_METRICS.map((key) => {
    const v = s[key] as number;
    const f = formatMetricValue(key, v);
    return { label: METRIC_LABEL[key], value: f.text, barValue: f.bar, color: pdfColor[key] };
  });

  const colW = (contentWidth - 6) / 2;
  let col = 0;
  let rowY = y;
  for (const m of metrics) {
    const x = margin + col * (colW + 6);
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(x, rowY, colW, 22, 2, 2, "F");
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(m.label, x + 4, rowY + 6);
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(m.value, x + 4, rowY + 14);
    doc.setFillColor(220, 220, 220);
    doc.roundedRect(x + 4, rowY + 17, colW - 8, 2.5, 1, 1, "F");
    doc.setFillColor(...m.color);
    doc.roundedRect(x + 4, rowY + 17, (colW - 8) * m.barValue, 2.5, 1, 1, "F");
    col++;
    if (col === 2) { col = 0; rowY += 26; }
  }
  if (col !== 0) rowY += 26;
  y = rowY + 4;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Explainable AI Biomarker Summaries", margin, y);
  y += 7;

  for (const key of FOUR_METRICS) {
    const entry = s.biomarker_summaries?.[key];
    if (!entry) continue;
    const lines = doc.splitTextToSize(entry.summary, contentWidth - 8) as string[];
    const blockH = 6 + lines.length * 4.5 + 4;
    if (y + blockH > doc.internal.pageSize.getHeight() - 20) { doc.addPage(); y = 20; }
    const color = pdfColor[key];
    doc.setFillColor(...color);
    doc.rect(margin, y, 3, blockH, "F");
    doc.setFillColor(250, 250, 250);
    doc.rect(margin + 3, y, contentWidth - 3, blockH, "F");
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(EXPLAIN_TITLES[key], margin + 7, y + 5.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(8.5);
    doc.text(lines, margin + 7, y + 10.5);
    y += blockH + 4;
  }

  if (y + 20 > doc.internal.pageSize.getHeight() - 20) { doc.addPage(); y = 20; }
  doc.setFillColor(235, 245, 255);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "F");
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Clinical Note:", margin + 4, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  const noteLines = doc.splitTextToSize(
    "These interpretations are based on established speech-language pathology research linking acoustic and linguistic features to cognitive health. Individual variations are normal, and clinical decisions should always be made in consultation with healthcare professionals.",
    contentWidth - 8
  ) as string[];
  doc.text(noteLines, margin + 4, y + 11);

  const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(240, 240, 240);
    doc.rect(0, doc.internal.pageSize.getHeight() - 10, pageWidth, 10, "F");
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Cognitrack — Confidential", margin, doc.internal.pageSize.getHeight() - 4);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 4, { align: "right" });
  }

  const safeName = s.personName.replace(/\s+/g, "_");
  doc.save(`NeuroTechCare_Report_${safeName}.pdf`);
}

function SessionExpiredBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 mb-6">
      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-amber-800">Your previous session has ended</p>
        <p className="text-sm text-amber-700 mt-0.5">
          Because CogniTrack doesn't require an account, recordings and results are only kept for the duration of your
          browser session. Close and reopen the browser to start fresh, or{" "}
          <a href="/upload" className="underline font-medium">upload a new recording</a> to begin.
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="text-amber-500 hover:text-amber-700 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <UploadCloud className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
      </div>
      <h2 className="text-lg text-gray-700 mb-2">No analysis results yet</h2>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        Upload a person recording to generate speech biomarker analysis and view results here.
      </p>
      <a
        href="/upload"
        className="bg-[#2d5a8f] text-white px-6 py-2.5 rounded-lg hover:bg-[#234a75] transition-colors text-sm"
      >
        Upload a Recording
      </a>
    </div>
  );
}

export function Results() {
  const { sessionData, wasExpired, dismissExpiry } = useSession();
  const navigate = useNavigate();
  const s = sessionData;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {wasExpired && <SessionExpiredBanner onDismiss={dismissExpiry} />}

        {!s ? (
          <EmptyState />
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl text-gray-900 mb-2">Analysis Results</h1>
              <p className="text-gray-600 leading-relaxed">
                Person: {s.personName} ({s.personId})
                <br />
                Recording Date: {formatDate(s.recordingDate)}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl text-gray-900 mb-4">Transcript</h2>
                  {s.transcript ? (
                    <div className="bg-gray-50 rounded-lg p-6 min-h-[24rem] border border-gray-100 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap overflow-auto">
                      {s.transcript}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 min-h-[24rem] flex flex-col items-center justify-center text-center border border-gray-100">
                      <FileText className="w-16 h-16 text-gray-300 mb-4" strokeWidth={1.25} />
                      <p className="text-gray-500 mb-2">Transcript not available</p>
                      <p className="text-sm text-gray-400 max-w-sm">
                        Transcription may not have been enabled for this recording.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4">
                  <div
                    className={`px-6 py-3 rounded-lg text-sm font-medium ${riskStyles(s.dementia_risk_level)}`}
                    role="status"
                  >
                    {s.dementia_risk_level}
                  </div>
                  <button
                    type="button"
                    onClick={() => exportToPDF(s)}
                    className="bg-[#2d5a8f] text-white px-6 py-3 rounded-lg hover:bg-[#234a75] transition-colors flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Export PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/upload")}
                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <UploadCloud className="w-5 h-5" />
                    New Recording
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {FOUR_METRICS.map((key) => {
                  const v = s[key] as number;
                  const f = formatMetricValue(key, v);
                  return (
                    <div key={key} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                      <div className="flex justify-between items-baseline gap-2 mb-3">
                        <h3 className="text-gray-900 text-base font-normal">{METRIC_LABEL[key]}</h3>
                        <span className="text-lg font-semibold text-gray-900 tabular-nums shrink-0">{f.text}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${barColor[key]}`}
                          style={{ width: `${f.bar * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {s.biomarker_summaries && (
              <div className="mt-10">
                <h2 className="text-2xl text-gray-900 mb-6">Explainable AI Biomarker Summaries</h2>
                <div className="bg-white rounded-lg p-6 space-y-8 shadow-sm border border-gray-100">
                  {FOUR_METRICS.map((key) => {
                    const entry = s.biomarker_summaries?.[key];
                    if (!entry) return null;
                    return (
                      <div key={key} className={`pl-4 ${borderClass[key]}`}>
                        <h3 className="text-gray-900 mb-2 font-medium">{EXPLAIN_TITLES[key]}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{entry.summary}</p>
                      </div>
                    );
                  })}

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100/80">
                    <p className="text-sm text-gray-700">
                      <strong>Clinical Note:</strong> These interpretations are based on established speech-language
                      pathology research linking acoustic and linguistic features to cognitive health. Individual
                      variations are normal, and clinical decisions should always be made in consultation with
                      healthcare professionals.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
