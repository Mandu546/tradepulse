import { useEffect, useRef, useState, useCallback } from 'react';
import { WSManager } from '../services/wsManager';
import { DerivSymbol, TickData, TickHistoryItem } from '../types/deriv';

const PUBLIC_WS_URL = 'wss://ws.derivws.com/websockets/v3?app_id=1089';

export function usePublicWS() {
  const wsRef = useRef<WSManager | null>(null);
  const [status, setStatus] = useState<'connecting'|'connected'|'disconnected'|'error'>('disconnected');
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
        setCurrentTick({
          symbol: msg.tick.symbol,
          epoch: msg.tick.epoch,
          quote: toNum(msg.tick.quote),
        });
        setTickHistory(prev => [
          ...prev.slice(-199),
          { epoch: msg.tick.epoch, quote: toNum(msg.tick.quote) }
        ]);
      }
    });

    const unsubHistory = ws.subscribe('history', (msg: any) => {
      if (msg.history?.times && msg.history?.prices) {
        setTickHistory(
          msg.history.times.map((t: number, i: number) => ({
            epoch: t,
            quote: toNum(msg.history.prices[i]),
          }))
        );
      }
    });

    // Handle active_symbols response
    const unsubSymbols = ws.subscribe('active_symbols', (msg: any) => {
      if (msg.active_symbols) {
        const raw = msg.active_symbols;
        // Sort: synthetic/volatility first, then forex, rest
        const sorted = [...raw].sort((a: any, b: any) => {
          const order = (m: string) =>
            m === 'synthetic_index' ? 0 :
            m === 'random_index' ? 1 :
            m === 'forex' ? 2 : 3;
          return order(a.market) - order(b.market);
        });
        setSymbols(sorted.map((s: any) => ({
          symbol: s.symbol,
          display_name: s.display_name,
          market: s.market,
          market_display_name: s.market_display_name,
          is_trading_suspended: !!s.is_trading_suspended,
          pip: toNum(s.pip),
        })));
      }
    });

    ws.connect();

    ws.onStatus((s) => {
      if (s === 'connected') {
        // Fetch symbols on connect
        ws.send({ active_symbols: 'brief', product_type: 'basic' }).catch(() => {});
      }
    });

    return () => {
      unsubStatus();
      unsubTick();
      unsubHistory();
      unsubSymbols();
      ws.close();
    };
  }, []);

  const subscribeSymbol = useCallback(async (symbol: string) => {
    const ws = wsRef.current;
    if (!ws) return;

    // Forget previous tick subscription
    if (tickSubRef.current) {
      ws.send({ forget: tickSubRef.current }).catch(() => {});
      tickSubRef.current = null;
    }

    setTickHistory([]);
    setCurrentTick(null);

    // Get history first
    try {
      await ws.send({
        ticks_history: symbol,
        adjust_start_time: 1,
        count: 100,
        end: 'latest',
        start: 1,
        style: 'ticks',
      });
    } catch {}

    // Subscribe live ticks
    try {
      const res = await ws.send({ ticks: symbol, subscribe: 1 }) as any;
      if (res.subscription?.id) {
        tickSubRef.current = res.subscription.id;
      }
      if (res.tick) {
        setCurrentTick({
          symbol: res.tick.symbol,
          epoch: res.tick.epoch,
          quote: toNum(res.tick.quote),
        });
      }
    } catch (err) {
      console.warn('Tick subscribe error:', err);
    }
  }, []);

  const unsubscribeSymbol = useCallback(() => {
    const ws = wsRef.current;
    if (tickSubRef.current && ws) {
      ws.send({ forget: tickSubRef.current }).catch(() => {});
      tickSubRef.current = null;
    }
  }, []);

  const refetchSymbols = useCallback(() => {
    wsRef.current?.send({ active_symbols: 'brief', product_type: 'basic' }).catch(() => {});
  }, []);

  return {
    status,
    symbols,
    currentTick,
    tickHistory,
    subscribeSymbol,
    unsubscribeSymbol,
    refetchSymbols,
  };
}

function toNum(val: any): number {
  if (typeof val === 'number') return val;
  const n = parseFloat(String(val));
  return isNaN(n) ? 0 : n;
}
