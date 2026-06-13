import { useState, useEffect } from 'react';
import { ProposalResponse } from '../types/deriv';
import ContractSelector, { isDigitsType, needsBarrier } from './ContractSelector';
import DigitsUI from './DigitsUI';
import './ProposalForm.css';

interface ProposalFormProps {
  symbol: string;
  currency: string;
  proposal: ProposalResponse | null;
  isLoading: boolean;
  lastDigit: number | null;
  onRequestProposal: (params: any) => void;
  onBuy: (proposalId: string, price: number) => Promise<any>;
  onClearProposal: () => void;
}

export default function ProposalForm({
  symbol, currency, proposal, isLoading, lastDigit,
  onRequestProposal, onBuy, onClearProposal
}: ProposalFormProps) {
  const [contractType, setContractType] = useState('CALL');
  const [amount, setAmount] = useState('10');
  const [duration, setDuration] = useState('5');
  const [durationUnit, setDurationUnit] = useState('t');
  const [basis, setBasis] = useState<'stake'|'payout'>('stake');
  const [selectedDigit, setSelectedDigit] = useState(5);
  const [isBuying, setIsBuying] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [buySuccess, setBuySuccess] = useState('');

  const isDigits = isDigitsType(contractType);
  const hasBarrier = needsBarrier(contractType);

  useEffect(() => {
    if (!symbol) return;
    const t = setTimeout(() => {
      const params: any = {
        amount: parseFloat(amount) || 10,
        basis,
        contract_type: contractType,
        currency,
        duration: parseInt(duration) || 5,
        duration_unit: durationUnit,
        underlying_symbol: symbol,
      };
      if (hasBarrier) params.selected_tick = selectedDigit;
      if (contractType === 'DIGITMATCH' || contractType === 'DIGITDIFF') params.barrier = String(selectedDigit);
      if (contractType === 'DIGITOVER' || contractType === 'DIGITUNDER') params.barrier = String(selectedDigit);
      onRequestProposal(params);
    }, 600);
    return () => clearTimeout(t);
  }, [symbol, amount, duration, durationUnit, basis, contractType, selectedDigit, currency]);

  const handleTypeChange = (type: string) => {
    setContractType(type);
    onClearProposal();
    if (isDigitsType(type)) { setDurationUnit('t'); setDuration('5'); }
  };

  const handleBuy = async () => {
    if (!proposal) return;
    setIsBuying(true); setBuyError(''); setBuySuccess('');
    try {
      await onBuy(proposal.id, proposal.ask_price);
      setBuySuccess('Contract purchased!');
      onClearProposal();
    } catch (err: any) { setBuyError(err.message || 'Buy failed'); }
    finally { setIsBuying(false); }
  };

  const pip = proposal?.spot ? String(proposal.spot).split('.')[1]?.length ?? 2 : 2;

  const getButtonLabels = () => {
    if (isDigits) {
      return [{ label: contractType.replace('DIGIT',''), action: handleBuy, color: 'buy-up' }];
    }
    if (contractType === 'CALL' || contractType === 'CALLE') return [{ label: 'Rise ▲', action: handleBuy, color: 'buy-up' }];
    if (contractType === 'PUT' || contractType === 'PUTE') return [{ label: 'Fall ▼', action: handleBuy, color: 'buy-down' }];
    if (contractType === 'ONETOUCH') return [{ label: 'One Touch', action: handleBuy, color: 'buy-up' }];
    if (contractType === 'NOTOUCH') return [{ label: 'No Touch', action: handleBuy, color: 'buy-down' }];
    return [{ label: 'Buy', action: handleBuy, color: 'buy-up' }];
  };

  return (
    <div className="proposal-form card">
      <div className="pf-title">Place Trade</div>

      <ContractSelector selectedType={contractType} onTypeChange={handleTypeChange} />

      {isDigits && (
        <DigitsUI
          contractType={contractType}
          lastDigit={lastDigit}
          selectedDigit={selectedDigit}
          onDigitChange={(d) => { setSelectedDigit(d); onClearProposal(); }}
        />
      )}

      <div className="pf-grid">
        <div className="form-group">
          <label>Amount ({currency})</label>
          <div className="stepper-input">
            <button onClick={() => { setAmount(v => String(Math.max(1,parseFloat(v)-1))); onClearProposal(); }}>−</button>
            <input type="number" value={amount} min="1" step="1"
              onChange={e => { setAmount(e.target.value); onClearProposal(); }} />
            <button onClick={() => { setAmount(v => String(parseFloat(v)+1)); onClearProposal(); }}>+</button>
          </div>
        </div>
        <div className="form-group">
          <label>Basis</label>
          <select value={basis} onChange={e => { setBasis(e.target.value as any); onClearProposal(); }}>
            <option value="stake">Stake</option>
            <option value="payout">Payout</option>
          </select>
        </div>
        {!isDigits && (
          <>
            <div className="form-group">
              <label>Duration</label>
              <div className="stepper-input">
                <button onClick={() => { setDuration(v => String(Math.max(1,parseInt(v)-1))); onClearProposal(); }}>−</button>
                <input type="number" value={duration} min="1"
                  onChange={e => { setDuration(e.target.value); onClearProposal(); }} />
                <button onClick={() => { setDuration(v => String(parseInt(v)+1)); onClearProposal(); }}>+</button>
              </div>
            </div>
            <div className="form-group">
              <label>Unit</label>
              <select value={durationUnit} onChange={e => { setDurationUnit(e.target.value); onClearProposal(); }}>
                <option value="t">Ticks</option>
                <option value="s">Seconds</option>
                <option value="m">Minutes</option>
                <option value="h">Hours</option>
                <option value="d">Days</option>
              </select>
            </div>
          </>
        )}
        {isDigits && (
          <div className="form-group">
            <label>Ticks</label>
            <div className="stepper-input">
              <button onClick={() => { setDuration(v => String(Math.max(1,parseInt(v)-1))); onClearProposal(); }}>−</button>
              <input type="number" value={duration} min="1" max="10"
                onChange={e => { setDuration(e.target.value); onClearProposal(); }} />
              <button onClick={() => { setDuration(v => String(Math.min(10,parseInt(v)+1))); onClearProposal(); }}>+</button>
            </div>
          </div>
        )}
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
          <div className="proposal-placeholder">{symbol ? 'Set parameters to get a quote' : 'Select a market to start'}</div>
        )}
      </div>

      {buyError && <div className="trade-error">⚠ {buyError}</div>}
      {buySuccess && <div className="trade-success">✓ {buySuccess}</div>}

      <div className="buy-buttons">
        {getButtonLabels().map(btn => (
          <button key={btn.label} className={`btn ${btn.color}`}
            disabled={!proposal || isBuying || isLoading}
            onClick={btn.action} style={{minHeight:48}}>
            {isBuying ? <span className="animate-spin">↻</span> : btn.label}
            {proposal && <span className="buy-sub">{proposal.ask_price} {currency}</span>}
          </button>
        ))}
        {contractType === 'CALL' && (
          <button className="btn buy-down"
            disabled={!proposal || isBuying || isLoading}
            onClick={handleBuy} style={{minHeight:48}}>
            {isBuying ? <span className="animate-spin">↻</span> : 'Fall ▼'}
            {proposal && <span className="buy-sub">{proposal.ask_price} {currency}</span>}
          </button>
        )}
      </div>

      <p className="trade-disclaimer">⚠ Trading involves risk. Only trade what you can afford to lose.</p>
    </div>
  );
}
