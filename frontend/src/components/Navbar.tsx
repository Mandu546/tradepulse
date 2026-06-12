import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
interface NavbarProps {
  balance?: { balance: number; currency: string } | null;
  wsStatus?: 'connecting' | 'connected' | 'disconnected' | 'error';
}
export default function Navbar({ balance, wsStatus }: NavbarProps) {
  const { selectedAccount, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate('/login'); };
  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="nav-logo"><span className="d">D</span>TRADE<span className="pulse">PULSE</span></div>
        <div className="nav-links">
          {['Dashboard','Markets','Trade','Portfolio','Charts'].map(link => (
            <span key={link} className={`nav-link ${link==='Trade'?'active':''}`}>{link}</span>
          ))}
        </div>
      </div>
      <div className="nav-right">
        {balance && (
          <div className="nav-balance">
            <span className="balance-label">Balance</span>
            <span className="balance-value mono">{balance.balance.toFixed(2)} {balance.currency}</span>
          </div>
        )}
        {selectedAccount && (
          <div className="account-badge">
            {selectedAccount.account_type==='demo'?'🎮':'💰'}
            <span>{selectedAccount.account_id}</span>
            <span className={`tag ${selectedAccount.account_type==='demo'?'tag-blue':'tag-green'}`}>{selectedAccount.account_type}</span>
          </div>
        )}
        <div className={`ws-status ws-${wsStatus}`}>
          <span className="ws-dot" />
          <span className="ws-label">{wsStatus==='connected'?'Live':wsStatus}</span>
        </div>
        <button className="btn btn-ghost nav-logout" onClick={handleLogout}>Sign out</button>
      </div>
    </nav>
  );
}
