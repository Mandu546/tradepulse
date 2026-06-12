import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchOTP } from '../services/api';
import { DerivAccount } from '../types/deriv';
import './AccountsPage.css';
export default function AccountsPage() {
  const { accounts, logout, setSelectedAccount } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const handleSelect = async (account: DerivAccount) => {
    setLoading(account.account_id); setError('');
    try {
      const wsUrl = await fetchOTP(account.account_id);
      setSelectedAccount(account, wsUrl);
      navigate('/trade');
    } catch (err: any) { setError(err.message || 'Failed to connect to account'); setLoading(null); }
  };
  const demoAccounts = accounts.filter(a => a.account_type === 'demo');
  const realAccounts = accounts.filter(a => a.account_type === 'real');
  return (
    <div className="accounts-root">
      <div className="accounts-header">
        <div className="accounts-logo"><span className="d">D</span>TRADE<span className="pulse">PULSE</span></div>
        <button className="btn btn-ghost" onClick={logout}>Sign out</button>
      </div>
      <div className="accounts-body animate-fade">
        <h1>Choose your account</h1>
        <p className="accounts-sub">Select a demo or real account to start trading.</p>
        {error && <div className="accounts-error">⚠ {error}</div>}
        {accounts.length === 0 ? (
          <div className="no-accounts"><span>🔍</span><p>No accounts found.</p></div>
        ) : (
          <>
            {demoAccounts.length > 0 && (
              <div className="account-section">
                <div className="section-label"><span className="tag tag-blue">Demo</span><span>Practice with virtual funds</span></div>
                <div className="account-grid">
                  {demoAccounts.map(acc => <AccountCard key={acc.account_id} account={acc} onSelect={handleSelect} isLoading={loading===acc.account_id} />)}
                </div>
              </div>
            )}
            {realAccounts.length > 0 && (
              <div className="account-section">
                <div className="section-label"><span className="tag tag-green">Real</span><span>Trade with real funds</span></div>
                <div className="account-grid">
                  {realAccounts.map(acc => <AccountCard key={acc.account_id} account={acc} onSelect={handleSelect} isLoading={loading===acc.account_id} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
function AccountCard({ account, onSelect, isLoading }: { account: DerivAccount; onSelect: (a: DerivAccount) => void; isLoading: boolean }) {
  return (
    <div className={`account-card ${isLoading?'loading':''}`} onClick={() => !isLoading && onSelect(account)}>
      <div className="acc-top">
        <div className="acc-type-icon">{account.account_type==='demo'?'🎮':'💰'}</div>
        <span className={`tag ${account.account_type==='demo'?'tag-blue':'tag-green'}`}>{account.account_type}</span>
      </div>
      <div className="acc-id mono">{account.account_id}</div>
      <div className="acc-currency">{account.currency||'USD'}</div>
      {account.balance!==undefined && <div className="acc-balance mono">{account.balance.toFixed(2)} {account.currency}</div>}
      <button className="btn btn-primary acc-btn" disabled={isLoading}>
        {isLoading?<><span className="animate-spin">↻</span> Connecting…</>:'Trade Now →'}
      </button>
    </div>
  );
}
