import { Navigation } from "../components/Navigation";
import { FileText, Download } from "lucide-react";
import jsPDF from "jspdf";

function exportToPDF() {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Header
  doc.setFillColor(45, 90, 143);
  doc.rect(0, 0, pageWidth, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("NeuroTechCare Clinical Platform", margin, 9.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Analysis Report", pageWidth - margin, 9.5, { align: "right" });

  y = 26;

  // Title
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Analysis Results", margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Patient: Margaret Thompson", margin, y);
  y += 5;
  doc.text("Recording Date: March 15, 2026", margin, y);
  y += 5;
  doc.text(`Generated: ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}`, margin, y);
  y += 10;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Metrics section
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Speech Biomarker Metrics", margin, y);
  y += 7;

  const metrics = [
    { label: "MLU Score", value: "4.2", unit: "", barValue: 0.42, color: [59, 130, 246] as [number, number, number] },
    { label: "Pause Ratio", value: "68", unit: "%", barValue: 0.68, color: [245, 158, 11] as [number, number, number] },
    { label: "Type-Token Ratio", value: "0.42", unit: "", barValue: 0.42, color: [34, 197, 94] as [number, number, number] },
    { label: "Filler Word Count", value: "47", unit: "/min", barValue: 0.78, color: [168, 85, 247] as [number, number, number] },
  ];

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
    doc.text(`${m.value}${m.unit}`, x + 4, rowY + 14);
    // Progress bar background
    doc.setFillColor(220, 220, 220);
    doc.roundedRect(x + 4, rowY + 17, colW - 8, 2.5, 1, 1, "F");
    // Progress bar fill
    doc.setFillColor(...m.color);
    doc.roundedRect(x + 4, rowY + 17, (colW - 8) * m.barValue, 2.5, 1, 1, "F");

    col++;
    if (col === 2) {
      col = 0;
      rowY += 26;
    }
  }
  if (col !== 0) rowY += 26;
  y = rowY + 4;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Biomarker Summaries
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Explainable AI Biomarker Summaries", margin, y);
  y += 7;

  const summaries = [
    {
      title: "MLU Score Analysis",
      color: [59, 130, 246] as [number, number, number],
      body: "The Mean Length of Utterance (MLU) measures the average number of words per sentence. A low MLU score may indicate potential word-finding difficulty or simplified sentence structure, which is commonly seen in early cognitive decline or language processing challenges.",
    },
    {
      title: "Pause Ratio Analysis",
      color: [245, 158, 11] as [number, number, number],
      body: "The pause ratio reflects the frequency and duration of pauses during speech. An elevated pause ratio can suggest hesitation, word retrieval difficulties, or processing delays, which may be associated with cognitive impairment or speech planning challenges.",
    },
    {
      title: "Type-Token Ratio Analysis",
      color: [34, 197, 94] as [number, number, number],
      body: "The Type-Token Ratio (TTR) measures vocabulary diversity by comparing unique words to total words. A lower TTR indicates repetitive language or reduced vocabulary range, which can be an early marker of lexical access difficulties or cognitive decline.",
    },
    {
      title: "Filler Word Count Analysis",
      color: [168, 85, 247] as [number, number, number],
      body: 'Filler words (e.g., "um," "uh," "like") are tracked to assess speech fluency. A high filler word count may indicate uncertainty, word-finding struggles, or processing difficulties, which can be relevant for assessing communication effectiveness and potential cognitive changes.',
    },
  ];

  for (const s of summaries) {
    const lines = doc.splitTextToSize(s.body, contentWidth - 8) as string[];
    const blockH = 6 + lines.length * 4.5 + 4;

    if (y + blockH > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(...s.color);
    doc.rect(margin, y, 3, blockH, "F");
    doc.setFillColor(250, 250, 250);
    doc.rect(margin + 3, y, contentWidth - 3, blockH, "F");

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(s.title, margin + 7, y + 5.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(8.5);
    doc.text(lines, margin + 7, y + 10.5);

    y += blockH + 4;
  }

  // Clinical note box
  if (y + 20 > doc.internal.pageSize.getHeight() - 20) {
    doc.addPage();
    y = 20;
  }
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

  // Footer
  const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(240, 240, 240);
    doc.rect(0, doc.internal.pageSize.getHeight() - 10, pageWidth, 10, "F");
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("NeuroTechCare Clinical Platform — Confidential", margin, doc.internal.pageSize.getHeight() - 4);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 4, { align: "right" });
  }

  doc.save("NeuroTechCare_Report_Margaret_Thompson.pdf");
}

export function Results() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">Analysis Results</h1>
          <p className="text-gray-600">
            Patient: Margaret Thompson<br />
            Recording Date: March 15, 2026
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Transcript */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl text-gray-900 mb-4">
                Transcript (Doctor / Patient speech separated)
              </h2>
              <div className="bg-gray-50 rounded-lg p-8 h-96 flex flex-col items-center justify-center">
                <FileText className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">Transcript will appear here</p>
                <p className="text-sm text-gray-400">
                  Upload a recording to view the separated speech transcript
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="bg-blue-50 text-[#2d5a8f] px-6 py-3 rounded-lg hover:bg-blue-100 transition-colors">
                Overall Risk Badge
              </button>
              <button
                onClick={exportToPDF}
                className="bg-[#2d5a8f] text-white px-6 py-3 rounded-lg hover:bg-[#234a75] transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export PDF
              </button>
            </div>
          </div>

          {/* Right Column - Metrics */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-gray-900 mb-4">MLU Score</h3>
              <div className="h-2 bg-gray-200 rounded-full mb-2">
                <div className="h-2 bg-blue-500 rounded-full w-0"></div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-gray-900 mb-4">Pause Ratio</h3>
              <div className="h-2 bg-gray-200 rounded-full mb-2">
                <div className="h-2 bg-blue-500 rounded-full w-0"></div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-gray-900 mb-4">Type-Token Ratio</h3>
              <div className="h-2 bg-gray-200 rounded-full mb-2">
                <div className="h-2 bg-blue-500 rounded-full w-0"></div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-gray-900 mb-4">Filler Word Count</h3>
              <div className="h-2 bg-gray-200 rounded-full mb-2">
                <div className="h-2 bg-blue-500 rounded-full w-0"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Explainable AI Biomarker Summaries */}
        <div className="mt-8">
          <h2 className="text-2xl text-gray-900 mb-6">Explainable AI Biomarker Summaries</h2>
          <div className="bg-white rounded-lg p-6 space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-gray-900 mb-2">MLU Score Analysis</h3>
              <p className="text-gray-600">
                The Mean Length of Utterance (MLU) measures the average number of words per sentence.
                A low MLU score may indicate potential word-finding difficulty or simplified sentence structure,
                which is commonly seen in early cognitive decline or language processing challenges.
              </p>
            </div>

            <div className="border-l-4 border-amber-500 pl-4">
              <h3 className="text-gray-900 mb-2">Pause Ratio Analysis</h3>
              <p className="text-gray-600">
                The pause ratio reflects the frequency and duration of pauses during speech.
                An elevated pause ratio can suggest hesitation, word retrieval difficulties, or processing delays,
                which may be associated with cognitive impairment or speech planning challenges.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-gray-900 mb-2">Type-Token Ratio Analysis</h3>
              <p className="text-gray-600">
                The Type-Token Ratio (TTR) measures vocabulary diversity by comparing unique words to total words.
                A lower TTR indicates repetitive language or reduced vocabulary range, which can be an early marker
                of lexical access difficulties or cognitive decline.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-gray-900 mb-2">Filler Word Count Analysis</h3>
              <p className="text-gray-600">
                Filler words (e.g., "um," "uh," "like") are tracked to assess speech fluency.
                A high filler word count may indicate uncertainty, word-finding struggles, or processing difficulties,
                which can be relevant for assessing communication effectiveness and potential cognitive changes.
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Clinical Note:</strong> These interpretations are based on established speech-language pathology
                research linking acoustic and linguistic features to cognitive health. Individual variations are normal,
                and clinical decisions should always be made in consultation with healthcare professionals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
