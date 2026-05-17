import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
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
  person_id: string;
  name: string;
  age: number;
  gender: string;
  risk_level: string | null;
  last_visit: string | null;
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

function EditModal({ person, onClose, onSave }: {
  person: Person;
  onClose: () => void;
  onSave: (updated: Person) => void;
}) {
  const [name, setName] = useState(person.name);
  const [age, setAge] = useState(String(person.age));
  const [gender, setGender] = useState(person.gender);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/persons/${person.person_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, age: parseInt(age), gender }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      onSave(updated);
    } catch {
      setError("Failed to save changes. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Age</label>
            <input
              type="number"
              min={1}
              max={130}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ name, onClose, onConfirm, deleting }: {
  name: string;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Delete Profile</h2>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete <span className="font-medium text-gray-800">{name}</span>? This will permanently remove all their analysis records.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 bg-red-500 text-white rounded-lg py-2 text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PersonProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Person | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!person) return;
    setDeleting(true);
    try {
      await fetch(`/api/persons/${person.person_id}`, { method: "DELETE" });
      navigate("/persons");
    } catch {
      setDeleting(false);
    }
  };

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
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{person?.name}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Analysis History ({history.length} total {history.length === 1 ? "upload" : "uploads"})
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEdit(true)}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => setShowDelete(true)}
                  className="inline-flex items-center gap-1.5 text-sm text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-sm text-gray-400">
                No analysis records yet.
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((record) => {
                  const dateStr = record.recording_date.split("T")[0];
                  const timeStr = new Date(record.analysis_timestamp).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: false });

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

      {showEdit && person && (
        <EditModal
          person={person}
          onClose={() => setShowEdit(false)}
          onSave={(updated) => {
            setPerson(updated);
            setShowEdit(false);
          }}
        />
      )}

      {showDelete && person && (
        <DeleteConfirm
          name={person.name}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}
