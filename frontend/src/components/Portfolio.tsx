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
      {contracts.length===0 ? (
        <div className="port-empty">No open contracts</div>
      ) : (
        <div className="port-table-wrap">
          <table className="port-table">
            <thead><tr><th>Contract</th><th>Symbol</th><th>Type</th><th>Buy Price</th><th>Payout</th></tr></thead>
            <tbody>
              {contracts.map(c => (
                <tr key={c.contract_id}>
                  <td className="mono" style={{fontSize:11}}>{c.contract_id}</td>
                  <td>{c.underlying}</td>
                  <td><span className={`tag ${c.contract_type.includes('CALL')?'tag-green':'tag-red'}`}>{c.contract_type}</span></td>
                  <td className="mono">{c.buy_price}</td>
                  <td className="mono green">{c.payout}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
interface OpenContractsProps { contracts: OpenContract[]; }
export function OpenContracts({ contracts }: OpenContractsProps) {
  if (contracts.length===0) return null;
  return (
    <div className="open-contracts card">
      <div className="port-title" style={{marginBottom:12}}>Live Contracts</div>
      <div className="contracts-list">
        {contracts.map(c => {
          const profit = c.profit??0;
          const isProfit = profit>=0;
          return (
            <div key={c.contract_id} className="contract-row">
              <div className="contract-info">
                <span className={`tag ${c.contract_type.includes('CALL')?'tag-green':'tag-red'}`}>{c.contract_type.includes('CALL')?'▲ RISE':'▼ FALL'}</span>
                <span className="contract-sym">{c.underlying}</span>
                <span className={`tag ${c.status==='open'?'tag-blue':c.status==='won'?'tag-green':'tag-red'}`}>{c.status}</span>
              </div>
              <div className="contract-pnl">
                <span className={`mono ${isProfit?'green':'red'}`} style={{fontWeight:700}}>{isProfit?'+':''}{profit.toFixed(2)}</span>
                {c.profit_percentage!==undefined && <span className={`mono ${isProfit?'green':'red'}`} style={{fontSize:11}}>({isProfit?'+':''}{c.profit_percentage.toFixed(1)}%)</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
