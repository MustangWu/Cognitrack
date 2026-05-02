import { RouterProvider } from 'react-router';
import { router } from './routes';
import { SessionProvider } from './context/SessionContext';
import { PasswordGate } from './components/PasswordGate';

export default function App() {
  return (
    <PasswordGate>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </PasswordGate>
  );
}
