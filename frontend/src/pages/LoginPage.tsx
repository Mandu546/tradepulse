import { useState } from 'react';
import { initiateLogin } from '../services/api';
import './LoginPage.css';
export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const urlError = new URLSearchParams(window.location.search).get('error');
  const handleLogin = async () => {
    setLoading(true); setError('');
    try { await initiateLogin(); }
    catch (err: any) { setError(err.message || 'Failed to start login. Check your backend is running.'); setLoading(false); }
  };
  return (
    <div className="login-root">
      <div className="login-grid" />
      <div className="login-hero">
        <div className="login-badge"><span className="badge-dot" /> LIVE MARKETS</div>
        <div className="login-logo"><span className="d">D</span>TRADE<span className="pulse">PULSE</span></div>
        <p className="login-tagline">Your professional Deriv trading command center. Real-time data, smart proposals, one-click execution.</p>
        <div className="login-stats">
          {[{label:'Markets',value:'100+'},{label:'Uptime',value:'99.9%'},{label:'Latency',value:'<50ms'}].map(s => (
            <div key={s.label} className="stat-item">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="login-card animate-fade">
        <div className="card-logo"><span className="d">D</span>TRADE<span className="pulse">PULSE</span></div>
        <h2>Sign in to trade</h2>
        <p className="card-sub">Connect your Deriv account securely via OAuth2.</p>
        {(error || urlError) && <div className="login-error">⚠ {error || urlError}</div>}
        <button className="btn btn-primary login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? <><span className="animate-spin">↻</span> Connecting…</> : <>🔐 Login with Deriv</>}
        </button>
        <div className="login-divider"><span>Secure OAuth2 + PKCE</span></div>
        <div className="login-features">
          {['🔐 Tokens never exposed to frontend','📊 Real-time WebSocket data','⚡ One-click buy & sell','💼 Demo & real account support'].map(f => (
            <div key={f} className="feature-row">{f}</div>
          ))}
        </div>
        <p className="login-disclaimer">DtradePulse is a third-party app. Trading involves risk.</p>
      </div>
    </div>
  );
}
