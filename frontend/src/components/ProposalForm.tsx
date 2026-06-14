import { useState, useEffect, useRef, useCallback } from 'react';
import { ProposalResponse } from '../types/deriv';
import './ProposalForm.css';

const CATEGORIES = [
  { id: 'digits', label: 'Digits', types: [
    { id: 'DIGITEVEN', label: 'Even' },
    { id: 'DIGITODD', label: 'Odd' },
    { id: 'DIGITOVER', label: 'Over', needsDigit: true },
    { id: 'DIGITUNDER', label: 'Under', needsDigit: true },
    { id: 'DIGITMATCH', label: 'Match', needsDigit: true },
    { id: 'DIGITDIFF', label: 'Differs', needsDigit: true },
  ]},
  { id: 'callput', label: 'Up/Down', types: [
    { id: 'CALL', label: 'Rise' },
    { id: 'PUT', label: 'Fall' },
  ]},
  { id: 'touch', label: 'Touch', types: [
    { id: 'ONETOUCH', label: 'One Touch' },
    { id: 'NOTOUCH', label: 'No Touch' },
  ]},
  { id: 'accumulator', label: 'Accumulators', types: [
    { id: 'ACCU', label: 'Accumulator' },
  ]},
  { id: 'multiplier', label: 'Multipliers', types: [
    { id: 'MULTUP', label: 'Up' },
    { id: 'MULTDOWN', label: 'Down' },
  ]},
];

interface ProposalFormProps {
  symbol: string;
  currency: string;
  proposal: ProposalResponse | null;
  isLoading: boolean;
  lastDigit: number | null;
  digitHistory: number[];
  onRequestProposal: (params: any) => void;
  onBuy: (proposalId: string, price: number) => Promise<any>;
  onClearProposal: () => void;
}

export default function ProposalForm({
  symbol, currency, proposal, isLoading, lastDigit, digitHistory,
  onRequestProposal, onBuy, onClearProposal
}: ProposalFormProps) {
  const [activeCategory, setActiveCategory] = useState('digits');
  const [contractType, setContractType] = useState('DIGITEVEN');
  const [amount, setAmount] = useState('10');
  const [duration, setDuration] = useState('5');
  const [durationUnit, setDurationUnit] = useState('t');
  const [selectedDigit, setSelectedDigit] = useState(5);
  const [isBuying, setIsBuying] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusOk, setStatusOk] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buyCountRef = useRef(0);

  const currentCat = CATEGORIES.find(c => c.id === activeCategory)!;
  const isDigits = contractType.startsWith('DIGIT');
  const needsDigitPicker = ['DIGITOVER','DIGITUNDER','DIGITMATCH','DIGITDIFF'].includes(contractType);

  const digitFreq = Array.from({length: 10}, (_, i) => {
    if (digitHistory.length < 10) return null;
    const count = digitHistory.filter(d => d === i).length;
    return (count / digitHistory.length * 100).toFixed(1);
  });

  const triggerProposal = useCallback(() => {
    if (!symbol) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params: any = {
        amount: parseFloat(amount) || 10,
        basis: 'stake',
        contract_type: contractType,
        currency,
        duration: parseInt(duration) || 1,
        duration_unit: durationUnit,
        underlying_symbol: symbol,
      };
      if (needsDigitPicker) params.barrier = String(selectedDigit);
      onRequestProposal(params);
    }, 400);
  }, [symbol, amount, duration, durationUnit, contractType, selectedDigit, currency, needsDigitPicker]);

  useEffect(() => {
    triggerProposal();
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [triggerProposal]);

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    const cat = CATEGORIES.find(c => c.id === catId)!;
    setContractType(cat.types[0].id);
    onClearProposal();
    if (catId === 'digits') { setDurationUnit('t'); setDuration('5'); }
  };

  const handleBuy = async () => {
    if (!proposal || isBuying) return;
    const buyId = ++buyCountRef.current;
    setIsBuying(true);
    setStatusMsg('');
    const saved = { ...proposal };
    try {
      await onBuy(saved.id, saved.ask_price);
      if (buyId === buyCountRef.current) {
        const p = typeof saved.payout === 'number' ? saved.payout.toFixed(2) : saved.payout;
        setStatusMsg(`Contract bought! Payout: ${p} ${currency}`);
        setStatusOk(true);
        setTimeout(() => { if (buyId === buyCountRef.current) setStatusMsg(''); }, 3000);
      }
    } catch (err: any) {
      if (buyId === buyCountRef.current) {
        setStatusMsg(err.message || 'Buy failed');
        setStatusOk(false);
      }
    } finally {
      if (buyId === buyCountRef.current) setIsBuying(false);
    }
  };

  const payoutStr = typeof proposal?.payout === 'number' ? proposal.payout.toFixed(2) : null;
  const pip = proposal?.spot ? String(proposal.spot).split('.')[1]?.length ?? 2 : 2;
  const durLabel = `${duration} ${durationUnit === 't' ? `tick${parseInt(duration) !== 1 ? 's' : ''}` : durationUnit === 's' ? 'sec' : durationUnit === 'm' ? 'min' : durationUnit === 'h' ? 'hr' : 'day'}`;
  const stakeNum = parseFloat(amount) || 10;

  const buyLabel =
    contractType === 'DIGITEVEN' ? 'EVEN' :
    contractType === 'DIGITODD' ? 'ODD' :
    contractType === 'DIGITOVER' ? 'OVER' :
    contractType === 'DIGITUNDER' ? 'UNDER' :
    contractType === 'DIGITMATCH' ? 'MATCH' :
    contractType === 'DIGITDIFF' ? 'DIFFERS' :
    contractType === 'CALL' ? 'RISE' :
    contractType === 'PUT' ? 'FALL' :
    contractType === 'ONETOUCH' ? 'ONE TOUCH' :
    contractType === 'NOTOUCH' ? 'NO TOUCH' :
    'BUY';

  return (
    <div className="pf-root">
      {/* Category tabs */}
      <div className="pf-cat-tabs">
        {CATEGORIES.map(cat => (
          <button key={cat.id}
            className={`pf-cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat.id)}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Type pills */}
      <div className="pf-type-pills">
        {currentCat.types.map(t => (
          <button key={t.id}
            className={`pf-type-pill ${contractType === t.id ? 'active' : ''}`}
            onClick={() => { setContractType(t.id); onClearProposal(); }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Digit grid */}
      {isDigits && (
        <div className="pf-digits-section">
          <div className="pf-field-label">Last digit prediction</div>
          <div className="pf-digit-grid">
            {Array.from({length: 10}, (_, i) => {
              const freq = digitFreq[i];
              const isLast = lastDigit === i;
              const isSelected = needsDigitPicker && selectedDigit === i;
              const freqNum = freq !== null ? parseFloat(freq) : null;
              return (
                <button key={i}
                  className={['pf-digit-btn', isLast ? 'last' : '', isSelected ? 'selected' : ''].join(' ').trim()}
                  onClick={() => { if (needsDigitPicker) { setSelectedDigit(i); onClearProposal(); } }}>
                  <span className="pf-digit-num">{i}</span>
                  <span className={['pf-digit-freq', freqNum !== null && freqNum > 11 ? 'hot' : freqNum !== null && freqNum < 9 ? 'cold' : ''].join(' ').trim()}>
                    {freq !== null ? `${freq}%` : '·'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Duration — clean display like reference */}
      <div className="pf-duration-row">
        <span className="pf-duration-label">Duration</span>
        <div className="pf-duration-controls">
          <button className="pf-dur-btn"
            onClick={() => { setDuration(v => String(Math.max(1, parseInt(v)-1))); onClearProposal(); }}>−</button>
          <span className="pf-duration-val">{durLabel}</span>
          <button className="pf-dur-btn"
            onClick={() => { setDuration(v => String(parseInt(v)+1)); onClearProposal(); }}>+</button>
        </div>
      </div>

      {/* Duration unit for non-digits */}
      {!isDigits && (
        <div className="pf-field">
          <div className="pf-field-label">Duration unit</div>
          <select value={durationUnit}
            onChange={e => { setDurationUnit(e.target.value); onClearProposal(); }}>
            <option value="t">Ticks</option>
            <option value="s">Seconds</option>
            <option value="m">Minutes</option>
            <option value="h">Hours</option>
            <option value="d">Days</option>
          </select>
        </div>
      )}

      {/* Stake — clean layout */}
      <div className="pf-stake-row">
        <span className="pf-stake-label">Stake</span>
        <div className="pf-stake-controls">
          <button className="pf-stake-btn"
            onClick={() => { setAmount(v => String(Math.max(1, parseFloat(v)-1))); onClearProposal(); }}>−</button>
          <input
            className="pf-stake-amount"
            type="number"
            value={amount}
            min="1"
            step="1"
            onChange={e => { setAmount(e.target.value); onClearProposal(); }}
          />
          <button className="pf-stake-btn"
            onClick={() => { setAmount(v => String(parseFloat(v)+1)); onClearProposal(); }}>+</button>
          <span className="pf-stake-currency">{currency}</span>
        </div>
      </div>

      {/* Status */}
      {statusMsg && (
        <div className={`pf-msg ${statusOk ? 'pf-msg-success' : 'pf-msg-error'}`}>{statusMsg}</div>
      )}

      {/* Buy button */}
      <button className="pf-buy-btn" onClick={handleBuy}
        disabled={!proposal || isBuying || isLoading}>
        {isBuying ? (
          <div className="pf-buy-inner">
            <span className="pf-buy-label"><span className="animate-spin">↻</span> Placing…</span>
          </div>
        ) : (
          <div className="pf-buy-inner">
            <span className="pf-buy-label">{buyLabel}</span>
            <span className="pf-buy-payout">
              Payout &nbsp; {isLoading ? '…' : payoutStr ? `${payoutStr} ${currency}` : `— ${currency}`}
            </span>
          </div>
        )}
      </button>

      {proposal && !isBuying && (
        <div className="pf-spot-info">
          Spot: <span className="mono">{typeof proposal.spot === 'number' ? proposal.spot.toFixed(pip) : '—'}</span>
          &nbsp;·&nbsp;
          Ask: <span className="mono">{typeof proposal.ask_price === 'number' ? proposal.ask_price.toFixed(2) : '—'} {currency}</span>
        </div>
      )}
    </div>
  );
}
