import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import LoadingPage from './pages/LoadingPage';
import AccountsPage from './pages/AccountsPage';
import TradePage from './pages/TradePage';
import AuthCallback from './pages/AuthCallback';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingPage />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AccountRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, selectedAccount, isLoading } = useAuth();
  if (isLoading) return <LoadingPage />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!selectedAccount) return <Navigate to="/accounts" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/accounts" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
          <Route path="/trade" element={<AccountRoute><TradePage /></AccountRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
