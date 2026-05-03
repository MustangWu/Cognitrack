import { RouterProvider } from 'react-router';
import { router } from './routes';
import { SessionProvider } from './context/SessionContext';
import { PasswordGate } from './components/PasswordGate';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <PasswordGate>
      <SessionProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors />
      </SessionProvider>
    </PasswordGate>
  );
}
