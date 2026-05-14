import { RouterProvider } from 'react-router';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { router } from './routes';
import { SessionProvider } from './context/SessionContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Toaster } from 'sonner';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

function AuthGate() {
  const { email } = useAuth();
  if (!email) return <LoginPage />;
  return (
    <SessionProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </SessionProvider>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
