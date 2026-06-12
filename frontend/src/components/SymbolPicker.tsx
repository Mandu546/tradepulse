import { useState } from 'react';
import { DerivSymbol } from '../types/deriv';
import './SymbolPicker.css';
const MARKET_GROUPS: Record<string, string> = {
  synthetic_index:'🎲 Synthetic',forex:'💱 Forex',indices:'📈 Indices',commodities:'🪙 Commodities',cryptocurrency:'🔗 Crypto',
};
interface SymbolPickerProps {
  symbols: DerivSymbol[];
  selected: string;
  onSelect: (symbol: string, pip: number) => void;
}
export default function SymbolPicker({ symbols, selected, onSelect }: SymbolPickerProps) {
  const [search, setSearch] = useState('');
  const [activeMarket, setActiveMarket] = useState<string>('synthetic_index');
  const markets = Array.from(new Set(symbols.map(s => s.market)));
  const filtered = symbols.filter(s =>
    s.market===activeMarket && !s.is_trading_suspended &&
    (search==='' || s.display_name.toLowerCase().includes(search.toLowerCase()) || s.symbol.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="symbol-picker card">
      <div className="picker-header">
        <span className="picker-title">Markets</span>
        <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="picker-search" />
      </div>
      <div className="market-tabs">
        {markets.map(m => (
          <button key={m} className={`market-tab ${activeMarket===m?'active':''}`} onClick={() => setActiveMarket(m)}>
            {MARKET_GROUPS[m]||m}
          </button>
        ))}
      </div>
      <div className="symbol-list">
        {filtered.length===0 ? <div className="symbol-empty">No markets found</div> : filtered.slice(0,30).map(sym => (
          <div key={sym.symbol} className={`symbol-row ${selected===sym.symbol?'active':''}`} onClick={() => onSelect(sym.symbol, sym.pip)}>
            <div>
              <div className="sym-name">{sym.display_name}</div>
              <div className="sym-code mono">{sym.symbol}</div>
            </div>
            {selected===sym.symbol && <span className="sym-check">✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
