import { useEffect, useState } from 'react';
import './LoadingPage.css';
const steps = ['Initializing DtradePulse…','Connecting to Deriv markets…','Loading volatility indices…','Fetching live prices…','Almost ready…'];
export default function LoadingPage() {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setProgress(p => p >= 100 ? 100 : p + 2), 60);
    const sv = setInterval(() => setStepIndex(i => Math.min(i+1, steps.length-1)), 600);
    return () => { clearInterval(iv); clearInterval(sv); };
  }, []);
  return (
    <div className="loading-root">
      <div className="loading-bg">
        {Array.from({length:22}).map((_,i) => (
          <div key={i} className="candle" style={{left:`${(i/22)*100}%`,height:`${40+Math.sin(i*1.3)*30}px`,background:i%3===0?'#ff4d6a':'#00d4a1',animationDelay:`${i*0.1}s`}} />
        ))}
      </div>
      <div className="ticker-bar">
        <div className="ticker-track">
          {['BTC/USD 67,234','ETH/USD 3,456','EUR/USD 1.0876','GBP/USD 1.2654','GOLD 2,345','V10 1,204','V25 5,328','BTC/USD 67,234','ETH/USD 3,456','EUR/USD 1.0876','GBP/USD 1.2654','GOLD 2,345'].map((item,i) => (
            <span key={i} className="ticker-item">{item} <span className={i%2===0?'up':'down'}>{i%2===0?'▲ +1.2%':'▼ -0.8%'}</span></span>
          ))}
        </div>
      </div>
      <div className="loading-card animate-fade">
        <div className="loading-logo">
          <span className="logo-d">D</span><span className="logo-trade">TRADE</span><span className="logo-pulse">PULSE</span>
        </div>
        <div className="loading-sub">TRADING HUB &nbsp;<span className="live-dot">● LIVE</span></div>
        <h2 className="loading-welcome">Welcome to DtradePulse</h2>
        <p className="loading-tagline">Your real-time Deriv trading command center.</p>
        <div className="progress-wrap">
          <div className="progress-bar"><div className="progress-fill" style={{width:`${progress}%`}} /></div>
          <span className="progress-pct">{progress}%</span>
        </div>
        <div className="loading-step"><span className="step-spinner" /> {steps[stepIndex]}</div>
        <div className="loading-features">
          {['📊 Advanced Charts','🤖 Smart Trading','📋 Copy Trading'].map(f => (
            <div key={f} className="feature-pill">{f}</div>
          ))}
        </div>
        <p className="loading-footer">Preparing a seamless trading experience for you.</p>
      </div>
    </div>
  );
}
