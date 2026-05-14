import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

function decodeEmail(credential: string): string {
  try {
    const payload = JSON.parse(atob(credential.split(".")[1]));
    return payload.email ?? "";
  } catch {
    return "";
  }
}

export function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        className="hidden md:flex md:w-1/2 flex-col justify-between p-12"
        style={{ background: "linear-gradient(160deg, #1a3a5c 0%, #2d5a8f 100%)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4" strokeLinecap="round" />
              <path d="M9.5 15.5c.83.83 2.17.83 3 0" strokeLinecap="round" />
              <circle cx="9" cy="11" r="1" fill="white" stroke="none" />
              <circle cx="15" cy="11" r="1" fill="white" stroke="none" />
            </svg>
          </div>
          <span className="text-white text-xl font-semibold tracking-tight">Cognitrack</span>
        </div>

        {/* Main copy */}
        <div className="space-y-6">
          <h1 className="text-white text-4xl font-bold leading-tight">
            AI-Powered Speech Analysis for Early Dementia Detection
          </h1>
          <p className="text-blue-200 text-base leading-relaxed">
            Empower your clinical practice with cutting-edge speech biomarker
            analysis. Detect cognitive decline early and improve care recipient
            outcomes.
          </p>
        </div>

        <div />
      </div>

      {/* Right panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <span className="text-gray-900 text-lg font-semibold">Cognitrack</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-1 text-sm text-gray-500">Sign in to access your dashboard</p>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">Sign in with Google</p>
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                const email = decodeEmail(credentialResponse.credential ?? "");
                if (email) login(email);
              }}
              onError={() => {
                console.error("Google sign-in failed");
              }}
              useOneTap
              width="100%"
              text="signin_with"
              shape="rectangular"
              theme="outline"
              size="large"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
