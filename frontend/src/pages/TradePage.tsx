import { useState, useEffect } from 'react';
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
  const { status:pubStatus, symbols, currentTick, tickHistory, subscribeSymbol, unsubscribeSymbol } = usePublicWS();
  const { status:authStatus, balance, portfolio, openContracts, proposal, isProposalLoading, requestProposal, buyContract, clearProposal, refreshPortfolio } = useAuthWS(authWsUrl);
  useEffect(() => { if (pubStatus==='connected' && selectedSymbol) { subscribeSymbol(selectedSymbol); } }, [pubStatus]);
  const handleSymbolSelect = (symbol: string, pip: number) => {
    setSelectedSymbol(symbol); setSelectedPip(pip);
    unsubscribeSymbol(); subscribeSymbol(symbol); clearProposal();
  };
  const currency = selectedAccount?.currency||'USD';
  const decimals = String(selectedPip).split('.')[1]?.length??2;
  const priceColor = tickHistory.length>=2
    ? (tickHistory[tickHistory.length-1].quote>=tickHistory[tickHistory.length-2].quote ? '#00d4a1' : '#ff4d6a')
    : '#7a8ba8';
  return (
    <div className="trade-root">
      <Navbar balance={balance} wsStatus={authStatus!=='disconnected'?authStatus:pubStatus} />
      <div className="trade-body">
        <aside className="trade-sidebar">
          <SymbolPicker symbols={symbols} selected={selectedSymbol} onSelect={handleSymbolSelect} />
        </aside>
        <main className="trade-main">
          <div className="main-top">
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
          </div>
          {openContracts.length>0 && <OpenContracts contracts={openContracts} />}
          <PortfolioTable contracts={portfolio} onRefresh={refreshPortfolio} />
        </main>
        <aside className="trade-right-panel">
          {balance && (
            <div className="balance-widget card">
              <div className="bw-label">Account Balance</div>
              <div className="bw-value mono">{balance.balance.toFixed(2)}</div>
              <div className="bw-currency">{balance.currency}</div>
              <div className={`bw-status ${authStatus}`}><span className="ws-dot" />{authStatus==='connected'?'Connected':authStatus}</div>
            </div>
          )}
          {!authWsUrl && <div className="auth-connecting card"><span>⚠</span><span>No authenticated WS. Go back to account select.</span></div>}
          <ProposalForm symbol={selectedSymbol} currency={currency} proposal={proposal} isLoading={isProposalLoading} onRequestProposal={requestProposal} onBuy={buyContract} onClearProposal={clearProposal} />
        </aside>
      </div>
    </div>
  );
}
