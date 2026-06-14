import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePublicWS } from '../hooks/usePublicWS';
import { useAuthWS } from '../hooks/useAuthWS';
import Navbar from '../components/Navbar';
import LiveChart from '../components/LiveChart';
import SymbolPicker from '../components/SymbolPicker';
import ProposalForm from '../components/ProposalForm';
import { PortfolioTable, OpenContracts } from '../components/Portfolio';
import './TradePage.css';

export default function TradePage() {
  const { selectedAccount, authWsUrl } = useAuth();
  const [selectedSymbol, setSelectedSymbol] = useState('1HZ100V');
  const [selectedPip, setSelectedPip] = useState(0.01);
  const [lastDigit, setLastDigit] = useState<number | null>(null);
  const [digitHistory, setDigitHistory] = useState<number[]>([]);
  const [showMobilePanel, setShowMobilePanel] = useState<'chart'|'trade'>('chart');

  const {
    status: pubStatus, symbols, currentTick, tickHistory,
    subscribeSymbol, unsubscribeSymbol,
  } = usePublicWS();

  const {
    status: authStatus, balance, portfolio, openContracts,
    proposal, isProposalLoading, requestProposal, buyContract,
    clearProposal, refreshPortfolio, resetBalance,
  } = useAuthWS(authWsUrl);

  useEffect(() => {
    if (pubStatus === 'connected' && selectedSymbol) {
      subscribeSymbol(selectedSymbol);
    }
  }, [pubStatus]);

  useEffect(() => {
    if (currentTick?.quote !== undefined) {
      const q = currentTick.quote;
      const str = q.toFixed(selectedPip <= 0.001 ? 4 : selectedPip <= 0.01 ? 3 : 2);
      const digit = parseInt(str[str.length - 1]);
      if (!isNaN(digit)) {
        setLastDigit(digit);
        setDigitHistory(prev => [...prev.slice(-499), digit]);
      }
    }
  }, [currentTick]);

  const handleSymbolSelect = (symbol: string, pip: number) => {
    setSelectedSymbol(symbol);
    setSelectedPip(pip);
    unsubscribeSymbol();
    subscribeSymbol(symbol);
    clearProposal();
    setLastDigit(null);
    setDigitHistory([]);
  };

  const currency = selectedAccount?.currency || 'USD';
  const decimals = String(selectedPip).split('.')[1]?.length ?? 2;
  const priceColor = tickHistory.length >= 2
    ? (tickHistory[tickHistory.length-1].quote >= tickHistory[tickHistory.length-2].quote ? '#00d4a1' : '#ff4d6a')
    : '#7a8ba8';
  const isDemo = selectedAccount?.account_type === 'demo';

  return (
    <div className="trade-root">
      <Navbar balance={balance} wsStatus={authStatus !== 'disconnected' ? authStatus : pubStatus} />

      <div className="trade-body">
        <aside className="trade-sidebar">
          <SymbolPicker symbols={symbols} selected={selectedSymbol} onSelect={handleSymbolSelect} />
        </aside>

        <main className="trade-main">
          <div className="mobile-tabs">
            <button className={showMobilePanel==='chart'?'active':''} onClick={()=>setShowMobilePanel('chart')}>Chart</button>
            <button className={showMobilePanel==='trade'?'active':''} onClick={()=>setShowMobilePanel('trade')}>Trade</button>
          </div>

          <div className={`trade-panels ${showMobilePanel}`}>
            <div className="panel-chart">
              <div className="symbol-header">
                <div>
                  <h2 className="sym-title">{symbols.find(s=>s.symbol===selectedSymbol)?.display_name||selectedSymbol}</h2>
                  <span className="sym-market mono">{symbols.find(s=>s.symbol===selectedSymbol)?.market_display_name||''}</span>
                </div>
                <div className="sym-live-price">
                  <span className="live-price-val mono" style={{color:priceColor}}>
                    {currentTick ? currentTick.quote.toFixed(decimals) : '—'}
                  </span>
                  <span className={`tag ${pubStatus==='connected'?'tag-green':'tag-muted'}`}>{pubStatus}</span>
                </div>
              </div>
              <LiveChart symbol={selectedSymbol} data={tickHistory} currentPrice={currentTick?.quote} pipSize={selectedPip} />
              {openContracts.length > 0 && <OpenContracts contracts={openContracts} />}
              <PortfolioTable contracts={portfolio} onRefresh={refreshPortfolio} />
            </div>

            <div className="panel-trade">
              <div className="balance-widget card">
                <div className="bw-top">
                  <div>
                    <div className="bw-label">Account Balance</div>
                    <div className="bw-value mono">{balance ? balance.balance.toFixed(2) : '—'}</div>
                    <div className="bw-currency">{balance?.currency || currency}</div>
                  </div>
                  <div className="bw-right">
                    <div className={`bw-status ${authStatus}`}>
                      <span className="ws-dot"/>
                      {authStatus === 'connected' ? 'Live' : authStatus}
                    </div>
                    {isDemo && (
                      <button className="btn btn-ghost bw-reset" onClick={resetBalance}>
                        ↺ Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {!authWsUrl && (
                <div className="auth-connecting card">
                  <span>⚠</span><span>Not connected. Go back and select an account.</span>
                </div>
              )}

              {authWsUrl && authStatus !== 'connected' && (
                <div className="auth-connecting card">
                  <span className="animate-spin">↻</span><span>Connecting to trading server…</span>
                </div>
              )}

              <ProposalForm
                symbol={selectedSymbol}
                currency={currency}
                proposal={proposal}
                isLoading={isProposalLoading}
                lastDigit={lastDigit}
                digitHistory={digitHistory}
                onRequestProposal={requestProposal}
                onBuy={buyContract}
                onClearProposal={clearProposal}
              />
            </div>
          </div>
        </main>
      </div>

      <div className="mobile-sticky-bar">
        <div className="sticky-symbol">{symbols.find(s=>s.symbol===selectedSymbol)?.display_name||selectedSymbol}</div>
        <div className="sticky-price mono" style={{color:priceColor}}>{currentTick?currentTick.quote.toFixed(decimals):'—'}</div>
        <button className="sticky-trade-btn" onClick={()=>setShowMobilePanel('trade')}>Trade →</button>
      </div>
    </div>
  );
}
