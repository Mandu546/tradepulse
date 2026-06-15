import { useState, useEffect, useRef, useCallback } from 'react';
import { ProposalResponse } from '../types/deriv';
import './ProposalForm.css';

const CATEGORIES = [
  {
    id: 'digits', label: 'Digits', color: '#2563eb',
    types: [
      { id: 'DIGITEVEN',  label: 'Even',    needsDigit: false },
      { id: 'DIGITODD',   label: 'Odd',     needsDigit: false },
      { id: 'DIGITOVER',  label: 'Over',    needsDigit: true  },
      { id: 'DIGITUNDER', label: 'Under',   needsDigit: true  },
      { id: 'DIGITMATCH', label: 'Matches', needsDigit: true  },
      { id: 'DIGITDIFF',  label: 'Differs', needsDigit: true  },
    ],
  },
  {
    id: 'callput', label: 'Up / Down', color: '#22c55e',
    types: [
      { id: 'CALL', label: 'Rise', needsDigit: false },
      { id: 'PUT',  label: 'Fall', needsDigit: false },
    ],
  },
  {
    id: 'touch', label: 'Touch', color: '#f59e0b',
    types: [
      { id: 'ONETOUCH', label: 'Touch',    needsDigit: false },
      { id: 'NOTOUCH',  label: 'No Touch', needsDigit: false },
    ],
  },
  {
    id: 'accumulator', label: 'Accumulators', color: '#8b5cf6',
    types: [
      { id: 'ACCU', label: 'Accumulator', needsDigit: false },
    ],
  },
  {
    id: 'multiplier', label: 'Multipliers', color: '#ec4899',
    types: [
      { id: 'MULTUP',   label: 'Up',   needsDigit: false },
      { id: 'MULTDOWN', label: 'Down', needsDigit: false },
    ],
  },
] as const;

type CatId = typeof CATEGORIES[number]['id'];

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

function fmt2(v: any): string {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return isNaN(n) ? '—' : n.toFixed(2);
}

function buyColor(ct: string): string {
  if (ct.startsWith('DIGIT'))  return '#2563eb';
  if (ct === 'CALL')           return '#22c55e';
  if (ct === 'PUT')            return '#ef4444';
  if (ct === 'ONETOUCH' || ct === 'NOTOUCH') return '#f59e0b';
  if (ct === 'ACCU')           return '#8b5cf6';
  if (ct === 'MULTUP')         return '#22c55e';
  if (ct === 'MULTDOWN')       return '#ef4444';
  return '#2563eb';
}

function buyText(ct: string): string {
  const map: Record<string, string> = {
    DIGITEVEN: 'BUY EVEN', DIGITODD: 'BUY ODD',
    DIGITOVER: 'BUY OVER', DIGITUNDER: 'BUY UNDER',
    DIGITMATCH: 'BUY MATCH', DIGITDIFF: 'BUY DIFFERS',
    CALL: 'BUY RISE', PUT: 'BUY FALL',
    ONETOUCH: 'BUY TOUCH', NOTOUCH: 'BUY NO TOUCH',
    ACCU: 'BUY ACCUMULATOR', MULTUP: 'BUY UP', MULTDOWN: 'BUY DOWN',
  };
  return map[ct] ?? 'BUY';
}

// Build correct proposal params per contract type
function buildParams(ct: string, amount: string, duration: string, durationUnit: string,
                     selectedDigit: number, currency: string, symbol: string, growthRate: string, multiplier: string): any {
  const stake = parseFloat(amount) || 10;
  const dur   = parseInt(duration) || 1;
  const base: any = { amount: stake, basis: 'stake', contract_type: ct, currency, underlying_symbol: symbol };

  if (ct.startsWith('DIGIT')) {
    base.duration = dur;
    base.duration_unit = 't';
    if (['DIGITOVER','DIGITUNDER','DIGITMATCH','DIGITDIFF'].includes(ct)) {
      base.barrier = String(selectedDigit);
    }
    return base;
  }
  if (ct === 'CALL' || ct === 'PUT') {
    base.duration = dur;
    base.duration_unit = durationUnit;
    return base;
  }
  if (ct === 'ONETOUCH' || ct === 'NOTOUCH') {
    base.duration = dur;
    base.duration_unit = durationUnit;
    return base;
  }
  if (ct === 'ACCU') {
    base.growth_rate = parseFloat(growthRate) / 100 || 0.03;
    return base;
  }
  if (ct === 'MULTUP' || ct === 'MULTDOWN') {
    base.multiplier = parseInt(multiplier) || 10;
    return base;
  }
  base.duration = dur;
  base.duration_unit = durationUnit;
  return base;
}

export default function ProposalForm({
  symbol, currency, proposal, isLoading,
  lastDigit, digitHistory,
  onRequestProposal, onBuy, onClearProposal,
}: ProposalFormProps) {
  const [activeCatId, setActiveCatId]     = useState<CatId>('digits');
  const [contractType, setContractType]   = useState('DIGITEVEN');
  const [amount, setAmount]               = useState('10');
  const [duration, setDuration]           = useState('5');
  const [durationUnit, setDurationUnit]   = useState('t');
  const [selectedDigit, setSelectedDigit] = useState(5);
  const [growthRate, setGrowthRate]       = useState('3');
  const [multiplier, setMultiplier]       = useState('10');
  const [showCatMenu, setShowCatMenu]     = useState(false);
  const [isBuying, setIsBuying]           = useState(false);
  const [msg, setMsg]                     = useState('');
  const [msgOk, setMsgOk]                = useState(false);
  const [prevLastDigit, setPrevLastDigit] = useState<number | null>(null);
  const debRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buyCount = useRef(0);

  const activeCat  = CATEGORIES.find(c => c.id === activeCatId)!;
  const activeType = activeCat.types.find(t => t.id === contractType);
  const isDigits   = contractType.startsWith('DIGIT');
  const needsDigit = activeType?.needsDigit ?? false;
  const isAccu     = contractType === 'ACCU';
  const isMult     = contractType === 'MULTUP' || contractType === 'MULTDOWN';

  // Track previous last digit for animation
  useEffect(() => {
    if (lastDigit !== null && lastDigit !== prevLastDigit) {
      setPrevLastDigit(lastDigit);
    }
  }, [lastDigit]);

  // Compute digit frequencies — updates every tick automatically
  const total = digitHistory.length;
  const digitFreq = Array.from({ length: 10 }, (_, i) => {
    if (total < 5) return null;
    const count = digitHistory.filter(d => d === i).length;
    return (count / total * 100);
  });
  const maxFreq = digitFreq.reduce((m, v) => v !== null && v > (m ?? 0) ? v : m, null as number | null);
  const minFreq = digitFreq.reduce((m, v) => v !== null && v < (m ?? 100) ? v : m, null as number | null);

  // Fire proposal whenever params change
  const fireProposal = useCallback(() => {
    if (!symbol) return;
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => {
      const params = buildParams(contractType, amount, duration, durationUnit,
                                  selectedDigit, currency, symbol, growthRate, multiplier);
      onRequestProposal(params);
    }, 400);
  }, [symbol, amount, contractType, currency, duration, durationUnit,
      needsDigit, selectedDigit, growthRate, multiplier]);

  useEffect(() => {
    fireProposal();
    return () => { if (debRef.current) clearTimeout(debRef.current); };
  }, [fireProposal]);

  const selectCategory = (catId: CatId) => {
    const cat = CATEGORIES.find(c => c.id === catId)!;
    setActiveCatId(catId);
    setContractType(cat.types[0].id);
    setShowCatMenu(false);
    onClearProposal();
    if (catId === 'digits') { setDurationUnit('t'); setDuration('5'); }
    else if (catId === 'accumulator') { setDuration('5'); setDurationUnit('m'); }
    else if (catId === 'multiplier') { setDuration('5'); setDurationUnit('m'); }
  };

  const handleBuy = async () => {
    if (!proposal || isBuying) return;
    const id = ++buyCount.current;
    setIsBuying(true); setMsg('');
    const snap = { ...proposal };
    try {
      await onBuy(snap.id, snap.ask_price);
      if (id === buyCount.current) {
        setMsg(`✓ Bought! Payout: ${fmt2(snap.payout)} ${currency}`);
        setMsgOk(true);
        setTimeout(() => { if (id === buyCount.current) setMsg(''); }, 3000);
      }
    } catch (err: any) {
      if (id === buyCount.current) { setMsg(err.message || 'Buy failed'); setMsgOk(false); }
    } finally {
      if (id === buyCount.current) setIsBuying(false);
    }
  };

  const payout  = proposal ? fmt2(proposal.payout)    : null;
  const askStr  = proposal ? fmt2(proposal.ask_price)  : null;
  const stake   = parseFloat(amount) || 10;
  const profit  = proposal && typeof proposal.payout === 'number' && typeof proposal.ask_price === 'number'
    ? (proposal.payout - proposal.ask_price).toFixed(2) : null;
  const pip     = proposal?.spot ? (String(proposal.spot).split('.')[1]?.length ?? 2) : 2;
  const durLabel = (() => {
    const n = parseInt(duration) || 1;
    const u: Record<string, string> = { t: 'tick', s: 'second', m: 'minute', h: 'hour', d: 'day' };
    return `${n} ${u[durationUnit] || 'tick'}${n !== 1 ? 's' : ''}`;
  })();
  const bColor = buyColor(contractType);
  const bText  = buyText(contractType);

  return (
    <div className="pf">

      {/* 1. Contract type dropdown */}
      <div className="pf-section">
        <div className="pf-label">Contract type</div>
        <button className="pf-dropdown" onClick={() => setShowCatMenu(v => !v)}>
          <span className="pf-dropdown-value">{activeCat.label}</span>
          <span className="pf-dropdown-arrow">{showCatMenu ? '▲' : '▼'}</span>
        </button>
        {showCatMenu && (
          <div className="pf-cat-menu">
            {CATEGORIES.map(cat => (
              <button key={cat.id}
                className={`pf-cat-item ${cat.id === activeCatId ? 'active' : ''}`}
                style={{ '--cat-color': cat.color } as React.CSSProperties}
                onClick={() => selectCategory(cat.id as CatId)}>
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Trade type cards */}
      <div className="pf-section">
        <div className="pf-label">Trade type</div>
        <div className="pf-type-grid">
          {activeCat.types.map(t => (
            <button key={t.id}
              className={`pf-type-card ${contractType === t.id ? 'active' : ''}`}
              style={{ '--type-color': bColor } as React.CSSProperties}
              onClick={() => { setContractType(t.id); onClearProposal(); }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Digit grid — with live frequency indicators */}
      {isDigits && (
        <div className="pf-section">
          <div className="pf-label">Last digit prediction</div>
          <div className="pf-digit-grid">
            {Array.from({ length: 10 }, (_, i) => {
              const freq   = digitFreq[i];
              const isLast = lastDigit === i;
              const isSel  = needsDigit && selectedDigit === i;
              const isHot  = freq !== null && maxFreq !== null && freq === maxFreq && freq > 10;
              const isCold = freq !== null && minFreq !== null && freq === minFreq && freq < 10;
              return (
                <button key={i}
                  className={[
                    'pf-digit',
                    isLast ? 'pf-digit--last' : '',
                    isSel  ? 'pf-digit--sel'  : '',
                    isHot  ? 'pf-digit--hot'  : '',
                    isCold ? 'pf-digit--cold' : '',
                  ].join(' ').trim()}
                  onClick={() => { if (needsDigit) { setSelectedDigit(i); onClearProposal(); } }}>
                  {isLast && <span className="pf-digit-pulse"/>}
                  <span className="pf-digit-n">{i}</span>
                  <span className="pf-digit-p">
                    {freq !== null ? `${freq.toFixed(1)}%` : '·'}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="pf-digit-legend">
            <span className="pf-legend-hot">● Most frequent</span>
            <span className="pf-legend-cold">● Least frequent</span>
          </div>
        </div>
      )}

      {/* 4. Accumulator growth rate */}
      {isAccu && (
        <div className="pf-section">
          <div className="pf-label">Growth rate</div>
          <div className="pf-growth-grid">
            {['1','2','3','4','5'].map(r => (
              <button key={r}
                className={`pf-growth-btn ${growthRate === r ? 'active' : ''}`}
                onClick={() => { setGrowthRate(r); onClearProposal(); }}>
                {r}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Multiplier value */}
      {isMult && (
        <div className="pf-section">
          <div className="pf-label">Multiplier</div>
          <div className="pf-growth-grid">
            {['5','10','20','50','100'].map(m => (
              <button key={m}
                className={`pf-growth-btn ${multiplier === m ? 'active' : ''}`}
                onClick={() => { setMultiplier(m); onClearProposal(); }}>
                ×{m}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. Duration */}
      {!isAccu && (
        <div className={`pf-section ${!isDigits ? 'pf-row2' : ''}`}>
          <div className="pf-half">
            <div className="pf-label">Duration</div>
            <div className="pf-spinner">
              <button className="pf-spin-btn"
                onClick={() => { setDuration(v => String(Math.max(1, parseInt(v)-1))); onClearProposal(); }}>−</button>
              <span className="pf-spin-val">{durLabel}</span>
              <button className="pf-spin-btn"
                onClick={() => { setDuration(v => String(parseInt(v)+1)); onClearProposal(); }}>+</button>
            </div>
          </div>
          {!isDigits && (
            <div className="pf-half">
              <div className="pf-label">Unit</div>
              <select className="pf-select" value={durationUnit}
                onChange={e => { setDurationUnit(e.target.value); onClearProposal(); }}>
                <option value="t">Ticks</option>
                <option value="s">Seconds</option>
                <option value="m">Minutes</option>
                <option value="h">Hours</option>
                <option value="d">Days</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* 7. Stake */}
      <div className="pf-section">
        <div className="pf-label">Stake</div>
        <div className="pf-stake">
          <button className="pf-stake-btn"
            onClick={() => { setAmount(v => String(Math.max(1, parseFloat(v)-1))); onClearProposal(); }}>−</button>
          <input className="pf-stake-input" type="number" value={amount} min="1" step="1"
            onChange={e => { setAmount(e.target.value); onClearProposal(); }} />
          <button className="pf-stake-btn"
            onClick={() => { setAmount(v => String(parseFloat(v)+1)); onClearProposal(); }}>+</button>
          <span className="pf-stake-cur">{currency}</span>
        </div>
      </div>

      {/* 8. Live pricing card */}
      <div className="pf-section pf-pricing">
        <div className="pf-pricing-row">
          <span className="pf-pricing-label">Potential payout</span>
          <span className="pf-pricing-val pf-pricing-payout">
            {isLoading ? <span className="pf-loading-dot"/> : payout ? `${payout} ${currency}` : '—'}
          </span>
        </div>
        <div className="pf-pricing-divider"/>
        <div className="pf-pricing-row">
          <span className="pf-pricing-label">Stake</span>
          <span className="pf-pricing-val">{stake.toFixed(2)} {currency}</span>
        </div>
        <div className="pf-pricing-row">
          <span className="pf-pricing-label">Profit</span>
          <span className={`pf-pricing-val ${profit && parseFloat(profit) > 0 ? 'green' : ''}`}>
            {profit ? `${profit} ${currency}` : '—'}
          </span>
        </div>
      </div>

      {/* 9. Status */}
      {msg && (
        <div className={`pf-msg ${msgOk ? 'pf-msg--ok' : 'pf-msg--err'}`}>{msg}</div>
      )}

      {/* 10. Buy button */}
      <div className="pf-section">
        <button className="pf-buy" onClick={handleBuy}
          disabled={!proposal || isBuying || isLoading}
          style={{ '--buy-color': bColor } as React.CSSProperties}>
          {isBuying ? (
            <span className="pf-buy-spinner">↻ Placing…</span>
          ) : (
            <>
              <span className="pf-buy-text">{bText}</span>
              <span className="pf-buy-payout">
                {isLoading ? 'Getting price…' : payout ? `Payout ${payout} ${currency}` : `Payout — ${currency}`}
              </span>
            </>
          )}
        </button>
      </div>

      {/* 11. Contract summary */}
      {proposal && (
        <div className="pf-section pf-summary">
          <div className="pf-summary-row">
            <span>Current spot</span>
            <span className="mono">{typeof proposal.spot === 'number' ? proposal.spot.toFixed(pip) : '—'}</span>
          </div>
          <div className="pf-summary-row">
            <span>Ask price</span>
            <span className="mono">{askStr} {currency}</span>
          </div>
          <div className="pf-summary-row">
            <span>Duration</span>
            <span>{isAccu ? 'Continuous' : durLabel}</span>
          </div>
          <div className="pf-summary-row">
            <span>Stake</span>
            <span>{stake.toFixed(2)} {currency}</span>
          </div>
          {profit && parseFloat(profit) > 0 && (
            <div className="pf-summary-row">
              <span>Potential profit</span>
              <span className="green">{profit} {currency}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
