import { PortfolioContract, OpenContract } from '../types/deriv';
import './Portfolio.css';

interface PortfolioTableProps {
  contracts: PortfolioContract[];
  onRefresh: () => void;
}

export function PortfolioTable({ contracts, onRefresh }: PortfolioTableProps) {
  return (
    <div className="portfolio-card card">
      <div className="portfolio-header">
        <span className="port-title">Portfolio</span>
        <button className="btn btn-ghost port-refresh" onClick={onRefresh}>↻ Refresh</button>
      </div>
      {contracts.length === 0 ? (
        <div className="port-empty">No open contracts</div>
      ) : (
        <div className="port-table-wrap">
          <table className="port-table">
            <thead><tr><th>ID</th><th>Symbol</th><th>Type</th><th>Buy</th><th>Payout</th></tr></thead>
            <tbody>
              {contracts.map(c => (
                <tr key={c.contract_id}>
                  <td className="mono" style={{fontSize:11}}>{c.contract_id}</td>
                  <td>{c.underlying}</td>
                  <td><span className={`tag ${c.contract_type.includes('CALL')||c.contract_type.includes('DIGIT')?'tag-green':'tag-red'}`}>{c.contract_type}</span></td>
                  <td className="mono">{safeFixed(c.buy_price)}</td>
                  <td className="mono green">{safeFixed(c.payout)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function safeFixed(val: any, decimals = 2): string {
  const n = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(n) ? '0.00' : n.toFixed(decimals);
}

interface OpenContractsProps { contracts: OpenContract[]; }

export function OpenContracts({ contracts }: OpenContractsProps) {
  if (contracts.length === 0) return null;
  return (
    <div className="open-contracts card">
      <div className="port-title" style={{marginBottom:12}}>Live Contracts</div>
      <div className="contracts-list">
        {contracts.map(c => {
          const profit = typeof c.profit === 'number' ? c.profit : parseFloat(String(c.profit || 0));
          const profitPct = typeof c.profit_percentage === 'number' ? c.profit_percentage : parseFloat(String(c.profit_percentage || 0));
          const isProfit = profit >= 0;
          return (
            <div key={c.contract_id} className="contract-row">
              <div className="contract-info">
                <span className={`tag ${c.contract_type.includes('CALL')||c.contract_type.includes('DIGIT')?'tag-green':'tag-red'}`}>
                  {c.contract_type}
                </span>
                <span className="contract-sym">{c.underlying}</span>
                <span className={`tag ${c.status==='open'?'tag-blue':c.status==='won'?'tag-green':'tag-red'}`}>{c.status}</span>
              </div>
              <div className="contract-pnl">
                <span className={`mono ${isProfit?'green':'red'}`} style={{fontWeight:700}}>
                  {isProfit?'+':''}{isNaN(profit)?'0.00':profit.toFixed(2)}
                </span>
                {!isNaN(profitPct) && (
                  <span className={`mono ${isProfit?'green':'red'}`} style={{fontSize:11}}>
                    ({isProfit?'+':''}{profitPct.toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
