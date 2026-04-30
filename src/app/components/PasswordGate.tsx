import { useState } from "react";

const PASSWORD = "Cognitrack123";
const SESSION_KEY = "cognitrack_auth";

export function usePasswordGate() {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  if (authed) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
    } else {
      setError(true);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 w-full max-w-sm">
        <h1 className="text-2xl text-gray-900 mb-1">CogniTrack</h1>
        <p className="text-sm text-gray-500 mb-8">Enter the password to continue</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="Password"
            autoFocus
            className={`w-full px-4 py-3 border rounded-lg mb-3 outline-none focus:ring-2 focus:ring-blue-200 ${
              error ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
          />
          {error && <p className="text-xs text-red-600 mb-3">Incorrect password. Please try again.</p>}
          <button
            type="submit"
            className="w-full bg-[#2d5a8f] text-white py-3 rounded-lg hover:bg-[#234a75] transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
