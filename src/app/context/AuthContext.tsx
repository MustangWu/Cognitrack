import { createContext, useContext, useState, type ReactNode } from "react";

const SESSION_KEY = "cognitrack_user_email";

interface AuthContextType {
  email: string | null;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  email: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(
    () => sessionStorage.getItem(SESSION_KEY)
  );

  const login = (userEmail: string) => {
    sessionStorage.setItem(SESSION_KEY, userEmail);
    setEmail(userEmail);
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setEmail(null);
  };

  return (
    <AuthContext.Provider value={{ email, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
