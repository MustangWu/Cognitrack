import { createContext, useContext, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";

const lastAnalysisKey = (email: string) => `cognitrack_last_analysis_${email}`;

export interface AnalysisResult {
  analysisId: number;
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
  savedAnalysisId: number | null;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { email } = useAuth();
  const key = lastAnalysisKey(email!);

  const [sessionData, setSessionDataState] = useState<AnalysisResult | null>(null);
  const [savedAnalysisId, setSavedAnalysisId] = useState<number | null>(() => {
    // Clean up legacy keys from the old sessionStorage-based cache
    localStorage.removeItem("cognitrack_last_session");
    const stored = localStorage.getItem(key);
    return stored ? Number(stored) : null;
  });

  const setSessionData = (result: AnalysisResult) => {
    localStorage.setItem(key, String(result.analysisId));
    setSessionDataState(result);
    setSavedAnalysisId(result.analysisId);
  };

  const clearSession = () => {
    localStorage.removeItem(key);
    setSessionDataState(null);
    setSavedAnalysisId(null);
  };

  return (
    <SessionContext.Provider value={{ sessionData, setSessionData, clearSession, savedAnalysisId }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
