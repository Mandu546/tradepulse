import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DerivAccount } from '../types/deriv';
import { checkAuthStatus, fetchAccounts, logout as apiLogout, setToken, getToken } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  accounts: DerivAccount[];
  selectedAccount: DerivAccount | null;
  authWsUrl: string | null;
  setSelectedAccount: (account: DerivAccount, wsUrl: string) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<DerivAccount[]>([]);
  const [selectedAccount, setSelectedAccountState] = useState<DerivAccount | null>(null);
  const [authWsUrl, setAuthWsUrl] = useState<string | null>(null);

  const refreshAuth = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      if (urlToken) {
        setToken(urlToken);
        window.history.replaceState({}, '', window.location.pathname);
      }
      const authenticated = await checkAuthStatus();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        try {
          const accs = await fetchAccounts();
          setAccounts(accs);
        } catch {}
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { refreshAuth(); }, []);

  const setSelectedAccount = (account: DerivAccount, wsUrl: string) => {
    setSelectedAccountState(account);
    setAuthWsUrl(wsUrl);
  };

  const logout = async () => {
    await apiLogout();
    setIsAuthenticated(false);
    setAccounts([]);
    setSelectedAccountState(null);
    setAuthWsUrl(null);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated, isLoading, accounts, selectedAccount,
      authWsUrl, setSelectedAccount, logout, refreshAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
