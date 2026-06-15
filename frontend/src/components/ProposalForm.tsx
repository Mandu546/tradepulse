import { useState, useEffect, useRef, useCallback } from 'react';
import { ProposalResponse } from '../types/deriv';
import './ProposalForm.css';

// ── Contract catalogue ────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'digits', label: 'Digits',
    color: '#2563eb',
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
    id: 'callput', label: 'Up / Down',
    color: '#22c55e',
    types: [
      { id: 'CALL', label: 'Rise', needsDigit: false },
      { id: 'PUT',  label: 'Fall', needsDigit: false },
    ],
  },
  {
    id: 'touch', label: 'Touch',
    color: '#f59e0b',
    types: [
      { id: 'ONETOUCH', label: 'Touch',    needsDigit: false },
      { id: 'NOTOUCH',  label: 'No Touch', needsDigit: false },
    ],
  },
  {
    id: 'accumulator', label: 'Accumulators',
    color: '#8b5cf6',
    types: [
      { id: 'ACCU', label: 'Accumulator', needsDigit: false },
    ],
  },
  {
    id: 'multiplier', label: 'Multipliers',
    color: '#ec4899',
    types: [
      { id: 'MULTUP',   label: 'Up',   needsDigit: false },
      { id: 'MULTDOWN', label: 'Down', needsDigit: false },
    ],
  },
] as const;

type CatId = typeof CATEGORIES[number]['id'];

// ── Props (unchanged from existing integration) ───────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt2(v: any): string {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return isNaN(n) ? '—' : n.toFixed(2);
}

function buyColor(contractType: string): string {
  if (contractType.startsWith('DIGIT')) return '#2563eb';
  if (contractType === 'CALL')           return '#22c55e';
  if (contractType === 'PUT')            return '#ef4444';
  if (contractType.startsWith('ONE') || contractType.startsWith('NO')) return '#f59e0b';
  if (contractType.startsWith('ACCU'))  return '#8b5cf6';
  return '#2563eb';
}

function buyText(contractType: string): string {
  const map: Record<string, string> = {
    DIGITEVEN: 'BUY EVEN', DIGITODD: 'BUY ODD',
    DIGITOVER: 'BUY OVER', DIGITUNDER: 'BUY UNDER',
    DIGITMATCH: 'BUY MATCH', DIGITDIFF: 'BUY DIFFERS',
    CALL: 'BUY RISE', PUT: 'BUY FALL',
    ONETOUCH: 'BUY TOUCH', NOTOUCH: 'BUY NO TOUCH',
    ACCU: 'BUY', MULTUP: 'BUY UP', MULTDOWN: 'BUY DOWN',
  };
  return map[contractType] ?? 'BUY';
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ProposalForm({
  symbol, currency, proposal, isLoading,
  lastDigit, digitHistory,
  onRequestProposal, onBuy, onClearProposal,
}: ProposalFormProps) {

  // ── Local state (all existing logic preserved) ──────────────────────────────
  const [activeCatId, setActiveCatId]   = useState<CatId>('digits');
  const [contractType, setContractType] = useState('DIGITEVEN');
  const [amount, setAmount]             = useState('10');
  const [duration, setDuration]         = useState('5');
  const [durationUnit, setDurationUnit] = useState('t');
  const [selectedDigit, setSelectedDigit] = useState(5);
  const [showCatMenu, setShowCatMenu]   = useState(false);
  const [isBuying, setIsBuying]         = useState(false);
  const [msg, setMsg]                   = useState('');
  const [msgOk, setMsgOk]              = useState(false);
  const debRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buyCount = useRef(0);

  const activeCat   = CATEGORIES.find(c => c.id === activeCatId)!;
  const activeType  = activeCat.types.find(t => t.id === contractType);
  const isDigits    = contractType.startsWith('DIGIT');
  const needsDigit  = activeType?.needsDigit ?? false;

  // Digit frequency from history
  const digitFreq = Array.from({ length: 10 }, (_, i) => {
    if (digitHistory.length < 10) return null;
    const pct = (digitHistory.filter(d => d === i).length / digitHistory.length) * 100;
    return pct.toFixed(1);
  });

  // ── Proposal trigger (existing debounce logic preserved) ───────────────────
  const fireProposal = useCallback(() => {
    if (!symbol) return;
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => {
      const params: any = {
        amount:        parseFloat(amount) || 10,
        basis:         'stake',
        contract_type: contractType,
        currency,
        duration:      parseInt(duration) || 1,
        duration_unit: durationUnit,
        underlying_symbol: symbol,
      };
      if (needsDigit) params.barrier = String(selectedDigit);
      onRequestProposal(params);
    }, 400);
  }, [symbol, amount, contractType, currency, duration, durationUnit, needsDigit, selectedDigit]);

  useEffect(() => {
    fireProposal();
    return () => { if (debRef.current) clearTimeout(debRef.current); };
  }, [fireProposal]);

  // ── Category change ─────────────────────────────────────────────────────────
  const selectCategory = (catId: CatId) => {
    const cat = CATEGORIES.find(c => c.id === catId)!;
    setActiveCatId(catId);
    setContractType(cat.types[0].id);
    setShowCatMenu(false);
    onClearProposal();
    if (catId === 'digits') { setDurationUnit('t'); setDuration('5'); }
  };

  // ── Buy (existing logic preserved) ─────────────────────────────────────────
  const handleBuy = async () => {
    if (!proposal || isBuying) return;
    const id = ++buyCount.current;
    setIsBuying(true);
    setMsg('');
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

  // ── Computed display values ─────────────────────────────────────────────────
  const payout = proposal ? fmt2(proposal.payout) : null;
  const stake  = parseFloat(amount) || 10;
  const profit = proposal && typeof proposal.payout === 'number'
    ? (proposal.payout - (proposal.ask_price ?? stake)).toFixed(2)
    : null;
  const pip = proposal?.spot
    ? (String(proposal.spot).split('.')[1]?.length ?? 2)
    : 2;
  const durLabel = (() => {
    const n = parseInt(duration) || 1;
    if (durationUnit === 't') return `${n} tick${n !== 1 ? 's' : ''}`;
    if (durationUnit === 's') return `${n} second${n !== 1 ? 's' : ''}`;
    if (durationUnit === 'm') return `${n} minute${n !== 1 ? 's' : ''}`;
    if (durationUnit === 'h') return `${n} hour${n !== 1 ? 's' : ''}`;
    return `${n} day${n !== 1 ? 's' : ''}`;
  })();

  const bColor = buyColor(contractType);
  const bText  = buyText(contractType);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="pf">

      {/* ── 1. Contract Type dropdown ── */}
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

      {/* ── 2. Trade type cards ── */}
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

      {/* ── 3. Digit prediction grid ── */}
      {isDigits && (
        <div className="pf-section">
          <div className="pf-label">Last digit prediction</div>
          <div className="pf-digit-grid">
            {Array.from({ length: 10 }, (_, i) => {
              const freq   = digitFreq[i];
              const isLast = lastDigit === i;
              const isSel  = needsDigit && selectedDigit === i;
              const freqN  = freq !== null ? parseFloat(freq) : null;
              return (
                <button key={i}
                  className={[
                    'pf-digit',
                    isLast ? 'pf-digit--last' : '',
                    isSel  ? 'pf-digit--sel'  : '',
                  ].join(' ')}
                  onClick={() => { if (needsDigit) { setSelectedDigit(i); onClearProposal(); } }}
                  disabled={!needsDigit && !isLast}>
                  <span className="pf-digit-n">{i}</span>
                  <span className={[
                    'pf-digit-p',
                    freqN !== null && freqN > 11 ? 'hot' : '',
                    freqN !== null && freqN < 9  ? 'cold' : '',
                  ].join(' ')}>
                    {freq !== null ? `${freq}%` : '·'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 4. Duration ── */}
      <div className="pf-section pf-row2">
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

      {/* ── 5. Stake ── */}
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

      {/* ── 6. Live pricing card ── */}
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

      {/* ── 7. Status message ── */}
      {msg && (
        <div className={`pf-msg ${msgOk ? 'pf-msg--ok' : 'pf-msg--err'}`}>{msg}</div>
      )}

      {/* ── 8. Buy button ── */}
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

      {/* ── 9. Contract summary ── */}
      {proposal && (
        <div className="pf-section pf-summary">
          <div className="pf-summary-row">
            <span>Current spot</span>
            <span className="mono">{typeof proposal.spot === 'number' ? proposal.spot.toFixed(pip) : '—'}</span>
          </div>
          <div className="pf-summary-row">
            <span>Ask price</span>
            <span className="mono">{fmt2(proposal.ask_price)} {currency}</span>
          </div>
          <div className="pf-summary-row">
            <span>Duration</span>
            <span>{durLabel}</span>
          </div>
          <div className="pf-summary-row">
            <span>Stake</span>
            <span>{stake.toFixed(2)} {currency}</span>
          </div>
          {profit && (
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
