import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './routes/AppRouter';
import ErrorBoundary from './components/system/ErrorBoundary';

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
      <Toaster
        position="top-center"
        containerStyle={{ top: '1.35rem' }}
        toastOptions={{
          duration: 3600,
          style: {
            background: '#0a1a36',
            color: '#f1f5f9',
            borderRadius: '16px',
            padding: '14px 18px',
            border: '1px solid rgba(198,169,106,0.32)',
            boxShadow: '0 24px 50px rgba(10,26,54,0.45)',
            fontSize: '13px',
            fontWeight: 600,
          },
          success: {
            iconTheme: { primary: '#c6a96a', secondary: '#0a1a36' },
          },
          error: {
            iconTheme: { primary: '#fda4af', secondary: '#0a1a36' },
          },
        }}
      />
    </AuthProvider>
  );
}
