import { createContext, useContext, useState, type ReactNode } from "react";

const SESSION_DATA_KEY = "cognitrack_session_data";
const SESSION_ID_KEY = "cognitrack_session_id";
const LAST_SESSION_KEY = "cognitrack_last_session";

export interface AnalysisResult {
  personId: string;
  personName: string;
  recordingDate: string;
  transcript: string | null;
  mlu_score: number;
  pause_ratio: number;
  type_token_ratio: number;
  filler_word_count: number;
  syntactic_complexity: number;
  biomarker_summaries: Record<string, { summary: string }> | null;
  dementia_risk_level: string;
  confidence_score: number;
  trend_direction: string;
}

interface SessionContextValue {
  sessionData: AnalysisResult | null;
  setSessionData: (data: AnalysisResult) => void;
  clearSession: () => void;
  wasExpired: boolean;
  dismissExpiry: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function initSession(): { data: AnalysisResult | null; wasExpired: boolean } {
  const sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  const lastSession = localStorage.getItem(LAST_SESSION_KEY);

  // Had a previous session but current tab session is fresh → expired
  const wasExpired = !sessionId && !!lastSession;

  if (!sessionId) {
    const newId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, newId);
    localStorage.setItem(LAST_SESSION_KEY, newId);
    return { data: null, wasExpired };
  }

  const raw = sessionStorage.getItem(SESSION_DATA_KEY);
  const data = raw ? (JSON.parse(raw) as AnalysisResult) : null;
  return { data, wasExpired: false };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [{ data, wasExpired: initialExpired }] = useState(initSession);
  const [sessionData, setSessionDataState] = useState<AnalysisResult | null>(data);
  const [wasExpired, setWasExpired] = useState(initialExpired);

  const setSessionData = (result: AnalysisResult) => {
    sessionStorage.setItem(SESSION_DATA_KEY, JSON.stringify(result));
    setSessionDataState(result);
    setWasExpired(false);
  };

  const clearSession = () => {
    sessionStorage.removeItem(SESSION_DATA_KEY);
    sessionStorage.removeItem(SESSION_ID_KEY);
    localStorage.removeItem(LAST_SESSION_KEY);
    const newId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, newId);
    localStorage.setItem(LAST_SESSION_KEY, newId);
    setSessionDataState(null);
    setWasExpired(false);
  };

  const dismissExpiry = () => setWasExpired(false);

  return (
    <SessionContext.Provider value={{ sessionData, setSessionData, clearSession, wasExpired, dismissExpiry }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
