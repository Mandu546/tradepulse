import { useEffect, useRef, useState } from 'react';
import { WSManager } from '../services/wsManager';
import { DerivSymbol, TickData, TickHistoryItem } from '../types/deriv';

const PUBLIC_WS_URL = 'wss://ws.derivws.com/websockets/v3?app_id=1089';

export function usePublicWS() {
  const wsRef = useRef<WSManager | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [symbols, setSymbols] = useState<DerivSymbol[]>([]);
  const [currentTick, setCurrentTick] = useState<TickData | null>(null);
  const [tickHistory, setTickHistory] = useState<TickHistoryItem[]>([]);
  const tickSubRef = useRef<string | null>(null);

  useEffect(() => {
    const ws = new WSManager(PUBLIC_WS_URL);
    wsRef.current = ws;
    const unsubStatus = ws.onStatus(setStatus);
    const unsubTick = ws.subscribe('tick', (msg: any) => {
      if (msg.tick) {
        setCurrentTick({ symbol: msg.tick.symbol, epoch: msg.tick.epoch, quote: msg.tick.quote });
        setTickHistory(prev => [...prev, { epoch: msg.tick.epoch, quote: msg.tick.quote }].slice(-100));
      }
    });
    const unsubHistory = ws.subscribe('history', (msg: any) => {
      if (msg.history) {
        setTickHistory(msg.history.times.map((t: number, i: number) => ({ epoch: t, quote: msg.history.prices[i] })));
      }
    });
    ws.connect();
    ws.onStatus((s) => { if (s === 'connected') { fetchSymbols(ws); } });
    return () => { unsubStatus(); unsubTick(); unsubHistory(); ws.close(); };
  }, []);

  const fetchSymbols = async (ws: WSManager) => {
    try {
      const response = await ws.send({ active_symbols: 'brief', product_type: 'basic' }) as any;
      if (response.active_symbols) {
        setSymbols(response.active_symbols.map((s: any) => ({
          symbol: s.symbol, display_name: s.display_name, market: s.market,
          market_display_name: s.market_display_name,
          is_trading_suspended: s.is_trading_suspended, pip: s.pip,
        })));
      }
    } catch (err) { console.error('Failed to fetch symbols:', err); }
  };

  const subscribeSymbol = async (symbol: string) => {
    const ws = wsRef.current;
    if (!ws) return;
    if (tickSubRef.current) { ws.forget(tickSubRef.current); tickSubRef.current = null; }
    setTickHistory([]);
    try {
      await ws.send({ ticks_history: symbol, adjust_start_time: 1, count: 80, end: 'latest', start: 1, style: 'ticks' });
    } catch (err) { console.error('Tick history error:', err); }
    try {
      const res = await ws.send({ ticks: symbol, subscribe: 1 }) as any;
      if (res.subscription?.id) { tickSubRef.current = res.subscription.id; }
    } catch (err) { console.error('Tick subscribe error:', err); }
  };

  const unsubscribeSymbol = () => {
    if (tickSubRef.current && wsRef.current) { wsRef.current.forget(tickSubRef.current); tickSubRef.current = null; }
  };

  return {
    status, symbols, currentTick, tickHistory,
    subscribeSymbol, unsubscribeSymbol,
    refetchSymbols: () => wsRef.current && fetchSymbols(wsRef.current),
  };
}
