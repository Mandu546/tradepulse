import { useState, useEffect } from 'react';
import { ProposalResponse } from '../types/deriv';
import './ProposalForm.css';
interface ProposalFormProps {
  symbol: string;
  currency: string;
  proposal: ProposalResponse | null;
  isLoading: boolean;
  onRequestProposal: (params: any) => void;
  onBuy: (proposalId: string, price: number) => Promise<any>;
  onClearProposal: () => void;
}
export default function ProposalForm({ symbol, currency, proposal, isLoading, onRequestProposal, onBuy, onClearProposal }: ProposalFormProps) {
  const [amount, setAmount] = useState('10');
  const [duration, setDuration] = useState('5');
  const [durationUnit, setDurationUnit] = useState('t');
  const [basis, setBasis] = useState<'stake'|'payout'>('stake');
  const [isBuying, setIsBuying] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [buySuccess, setBuySuccess] = useState('');
  useEffect(() => {
    if (!symbol) return;
    const t = setTimeout(() => {
      onRequestProposal({ amount:parseFloat(amount)||10, basis, contract_type:'CALL', currency, duration:parseInt(duration)||5, duration_unit:durationUnit, underlying_symbol:symbol });
    }, 600);
    return () => clearTimeout(t);
  }, [symbol, amount, duration, durationUnit, basis, currency]);
  const handleBuy = async () => {
    if (!proposal) return;
    setIsBuying(true); setBuyError(''); setBuySuccess('');
    try {
      await onBuy(proposal.id, proposal.ask_price);
      setBuySuccess(`✓ Contract purchased! Ask: ${proposal.ask_price} ${currency}`);
      onClearProposal();
    } catch (err: any) { setBuyError(err.message||'Buy failed'); }
    finally { setIsBuying(false); }
  };
  const pip = proposal?.spot ? String(proposal.spot).split('.')[1]?.length??2 : 2;
  return (
    <div className="proposal-form card">
      <div className="pf-title">Place Trade</div>
      <div className="pf-grid">
        <div className="form-group">
          <label>Amount ({currency})</label>
          <input type="number" value={amount} min="1" step="1" onChange={e=>{setAmount(e.target.value);onClearProposal();}}/>
        </div>
        <div className="form-group">
          <label>Basis</label>
          <select value={basis} onChange={e=>{setBasis(e.target.value as 'stake'|'payout');onClearProposal();}}>
            <option value="stake">Stake</option>
            <option value="payout">Payout</option>
          </select>
        </div>
        <div className="form-group">
          <label>Duration</label>
          <input type="number" value={duration} min="1" max="365" onChange={e=>{setDuration(e.target.value);onClearProposal();}}/>
        </div>
        <div className="form-group">
          <label>Unit</label>
          <select value={durationUnit} onChange={e=>{setDurationUnit(e.target.value);onClearProposal();}}>
            <option value="t">Ticks</option>
            <option value="s">Seconds</option>
            <option value="m">Minutes</option>
            <option value="h">Hours</option>
            <option value="d">Days</option>
          </select>
        </div>
      </div>
      <div className="proposal-preview">
        {isLoading ? (
          <div className="proposal-loading"><span className="animate-spin">↻</span> Getting best price…</div>
        ) : proposal ? (
          <>
            <div className="pp-row"><span className="pp-label">Ask Price</span><span className="pp-value mono">{proposal.ask_price} {currency}</span></div>
            <div className="pp-row"><span className="pp-label">Payout</span><span className="pp-value mono green">{proposal.payout} {currency}</span></div>
            <div className="pp-row"><span className="pp-label">Spot</span><span className="pp-value mono">{proposal.spot?.toFixed(pip)}</span></div>
            <div className="pp-longcode">{proposal.longcode}</div>
          </>
        ) : (
          <div className="proposal-placeholder">{symbol?'Set amount and duration to get a quote':'Select a market to start'}</div>
        )}
      </div>
      {buyError && <div className="trade-error">⚠ {buyError}</div>}
      {buySuccess && <div className="trade-success">{buySuccess}</div>}
      <div className="buy-buttons">
        <button className="btn buy-up" disabled={!proposal||isBuying||isLoading} onClick={()=>handleBuy()}>
          {isBuying?<span className="animate-spin">↻</span>:'▲'}
          <span><div>RISE</div><div className="buy-sub">{proposal?`${proposal.ask_price} ${currency}`:'—'}</div></span>
        </button>
        <button className="btn buy-down" disabled={!proposal||isBuying||isLoading} onClick={()=>handleBuy()}>
          {isBuying?<span className="animate-spin">↻</span>:'▼'}
          <span><div>FALL</div><div className="buy-sub">{proposal?`${proposal.ask_price} ${currency}`:'—'}</div></span>
        </button>
      </div>
      <p className="trade-disclaimer">⚠ Trading involves risk. Only trade what you can afford to lose.</p>
    </div>
  );
}
