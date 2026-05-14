import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { Navigation } from "../components/Navigation";

interface HistoryRecord {
  analysis_id: number;
  analysis_timestamp: string;
  recording_date: string;
  mlu_score: number;
  pause_ratio: number;
  type_token_ratio: number;
  filler_word_count: number;
  dementia_risk_level: string;
  trend_direction: string;
}

interface Person {
  name: string;
  age: number;
}

function RiskBadge({ level }: { level: string }) {
  const colours: Record<string, string> = {
    "Low Risk": "bg-green-50 text-green-700 border-green-200",
    "Moderate Risk": "bg-yellow-50 text-yellow-700 border-yellow-200",
    "High Risk": "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${colours[level] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {level}
    </span>
  );
}

export function PersonProfile() {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<Person | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/persons/${id}`).then((r) => r.json()),
      fetch(`/api/persons/${id}/history`).then((r) => r.json()),
    ])
      .then(([personData, historyData]) => {
        setPerson(personData);
        setHistory(historyData);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile.");
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link to="/persons" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Care Recipient List
        </Link>

        {loading ? (
          <div className="text-sm text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900">{person?.name}</h1>
            <p className="text-sm text-gray-500 mt-1 mb-8">
              Analysis History ({history.length} total {history.length === 1 ? "upload" : "uploads"})
            </p>

            {history.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-sm text-gray-400">
                No analysis records yet.
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((record) => {
                  const dt = new Date(record.analysis_timestamp);
                  const dateStr = dt.toISOString().split("T")[0];
                  const timeStr = dt.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: false });

                  return (
                    <div key={record.analysis_id} className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
                            </svg>
                            {dateStr}
                            <svg className="w-3.5 h-3.5 text-gray-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {timeStr}
                          </div>
                          <div className="mt-1">
                            <RiskBadge level={record.dementia_risk_level} />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">MLU Score</p>
                          <p className="text-sm font-semibold text-gray-900">{Number(record.mlu_score).toFixed(1)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Pause Ratio</p>
                          <p className="text-sm font-semibold text-gray-900">{Number(record.pause_ratio).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Type-Token Ratio</p>
                          <p className="text-sm font-semibold text-gray-900">{Number(record.type_token_ratio).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Filler Words</p>
                          <p className="text-sm font-semibold text-gray-900">{record.filler_word_count}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
