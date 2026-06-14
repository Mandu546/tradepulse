import { useState, useEffect, useRef } from 'react';
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
  const [duration, setDuration] = useState('1');
  const [durationUnit, setDurationUnit] = useState('t');
  const [basis] = useState<'stake'|'payout'>('stake');
  const [selectedDigit, setSelectedDigit] = useState(5);
  const [isBuying, setIsBuying] = useState(false);
  const [buyMessage, setBuyMessage] = useState('');
  const [buySuccess, setBuySuccess] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentCat = CATEGORIES.find(c => c.id === activeCategory)!;
  const isDigits = contractType.startsWith('DIGIT');
  const needsDigitPicker = ['DIGITOVER','DIGITUNDER','DIGITMATCH','DIGITDIFF'].includes(contractType);

  const digitFreq = Array.from({length:10}, (_,i) => {
    if (digitHistory.length === 0) return 0;
    return Math.round((digitHistory.filter(d => d === i).length / digitHistory.length) * 100);
  });

  useEffect(() => {
    if (!symbol) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params: any = {
        amount: parseFloat(amount) || 10,
        basis,
        contract_type: contractType,
        currency,
        duration: parseInt(duration) || 1,
        duration_unit: durationUnit,
        underlying_symbol: symbol,
      };
      if (needsDigitPicker) params.barrier = String(selectedDigit);
      onRequestProposal(params);
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [symbol, amount, duration, durationUnit, basis, contractType, selectedDigit, currency]);

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    const cat = CATEGORIES.find(c => c.id === catId)!;
    setContractType(cat.types[0].id);
    onClearProposal();
    if (catId === 'digits') { setDurationUnit('t'); setDuration('1'); }
  };

  const handleBuy = async () => {
    if (!proposal || isBuying) return;
    setIsBuying(true);
    setBuyMessage('');
    try {
      await onBuy(proposal.id, proposal.ask_price);
      const payout = typeof proposal.payout === 'number' ? proposal.payout.toFixed(2) : proposal.payout;
      setBuyMessage(`Contract placed! Payout: ${payout} ${currency}`);
      setBuySuccess(true);
      onClearProposal();
      setTimeout(() => { setBuyMessage(''); setBuySuccess(false); }, 2500);
    } catch (err: any) {
      setBuyMessage(err.message || 'Buy failed');
      setBuySuccess(false);
    } finally {
      setIsBuying(false);
    }
  };

  const payout = typeof proposal?.payout === 'number' ? proposal.payout.toFixed(2) : proposal?.payout ?? '—';
  const askPrice = typeof proposal?.ask_price === 'number' ? proposal.ask_price.toFixed(2) : parseFloat(amount).toFixed(2);
  const pip = proposal?.spot ? String(proposal.spot).split('.')[1]?.length ?? 2 : 2;

  return (
    <div className="pf-root">
      <div className="pf-cat-tabs">
        {CATEGORIES.map(cat => (
          <button key={cat.id}
            className={`pf-cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat.id)}>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="pf-type-pills">
        {currentCat.types.map(t => (
          <button key={t.id}
            className={`pf-type-pill ${contractType === t.id ? 'active' : ''}`}
            onClick={() => { setContractType(t.id); onClearProposal(); }}>
            {t.label}
          </button>
        ))}
      </div>

      {isDigits && (
        <div className="pf-digits-section">
          <div className="pf-field-label">Last digit prediction</div>
          <div className="pf-digit-grid">
            {Array.from({length:10}, (_,i) => {
              const freq = digitFreq[i];
              const isLast = lastDigit === i;
              const isSelected = needsDigitPicker && selectedDigit === i;
              return (
                <button key={i}
                  className={`pf-digit-btn ${isLast ? 'last' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => { if (needsDigitPicker) { setSelectedDigit(i); onClearProposal(); }}}>
                  <span className="pf-digit-num">{i}</span>
                  <span className={`pf-digit-freq ${freq > 11 ? 'hot' : freq < 9 ? 'cold' : ''}`}>{freq}%</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isDigits && (
        <div className="pf-field">
          <div className="pf-field-label">Duration — {duration} tick{parseInt(duration) !== 1 ? 's' : ''}</div>
          <input type="range" min="1" max="10" value={duration}
            onChange={e => { setDuration(e.target.value); onClearProposal(); }}
            className="pf-range" />
        </div>
      )}

      {!isDigits && (
        <div className="pf-row">
          <div className="pf-field pf-flex1">
            <div className="pf-field-label">Duration</div>
            <div className="pf-stepper">
              <button onClick={() => { setDuration(v => String(Math.max(1,parseInt(v)-1))); onClearProposal(); }}>−</button>
              <input type="number" value={duration} min="1" onChange={e => { setDuration(e.target.value); onClearProposal(); }} />
              <button onClick={() => { setDuration(v => String(parseInt(v)+1)); onClearProposal(); }}>+</button>
            </div>
          </div>
          <div className="pf-field pf-flex1">
            <div className="pf-field-label">Unit</div>
            <select value={durationUnit} onChange={e => { setDurationUnit(e.target.value); onClearProposal(); }}>
              <option value="t">Ticks</option>
              <option value="s">Seconds</option>
              <option value="m">Minutes</option>
              <option value="h">Hours</option>
              <option value="d">Days</option>
            </select>
          </div>
        </div>
      )}

      <div className="pf-field">
        <div className="pf-field-label">Stake</div>
        <div className="pf-stake-wrap">
          <div className="pf-stepper pf-stake-stepper">
            <button onClick={() => { setAmount(v => String(Math.max(1, parseFloat(v)-1))); onClearProposal(); }}>−</button>
            <input type="number" value={amount} min="1" step="1"
              onChange={e => { setAmount(e.target.value); onClearProposal(); }} />
            <button onClick={() => { setAmount(v => String(parseFloat(v)+1)); onClearProposal(); }}>+</button>
          </div>
          <span className="pf-currency-label">{currency}</span>
        </div>
      </div>

      {buyMessage && (
        <div className={`pf-msg ${buySuccess ? 'pf-msg-success' : 'pf-msg-error'}`}>{buyMessage}</div>
      )}

      <button className="pf-buy-btn" onClick={handleBuy} disabled={!proposal || isBuying || isLoading}>
        {isBuying ? (
          <><span className="animate-spin" style={{fontSize:18}}>↻</span> Placing order…</>
        ) : (
          <div className="pf-buy-inner">
            <span className="pf-buy-label">
              {isLoading ? 'Getting price…' : contractType === 'DIGITEVEN' ? 'Even' : contractType === 'DIGITODD' ? 'Odd' : contractType.replace('DIGIT','') || 'Buy'}
            </span>
            <span className="pf-buy-payout">
              Payout &nbsp;{isLoading ? '…' : `${payout} ${currency}`}
            </span>
          </div>
        )}
      </button>

      {proposal && !isBuying && !buyMessage && (
        <div className="pf-spot-info">
          Spot: <span className="mono">{typeof proposal.spot === 'number' ? proposal.spot.toFixed(pip) : '—'}</span>
          &nbsp;·&nbsp; Ask: <span className="mono">{askPrice} {currency}</span>
        </div>
      )}
    </div>
  );
}
