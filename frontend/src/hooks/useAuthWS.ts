import { useEffect, useRef, useState, useCallback } from 'react';
import { WSManager } from '../services/wsManager';
import { ProposalResponse, BuyResponse, OpenContract, PortfolioContract, BalanceData } from '../types/deriv';

function toNum(val: any): number {
  if (typeof val === 'number') return val;
  const n = parseFloat(String(val));
  return isNaN(n) ? 0 : n;
}

export function useAuthWS(wsUrl: string | null) {
  const wsRef = useRef<WSManager | null>(null);
  const [status, setStatus] = useState<'connecting'|'connected'|'disconnected'|'error'>('disconnected');
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioContract[]>([]);
  const [openContracts, setOpenContracts] = useState<Map<number, OpenContract>>(new Map());
  const [proposal, setProposal] = useState<ProposalResponse | null>(null);
  const [isProposalLoading, setIsProposalLoading] = useState(false);
  const proposalSubRef = useRef<string | null>(null);

  useEffect(() => {
    if (!wsUrl) return;
    const ws = new WSManager(wsUrl);
    wsRef.current = ws;

    const unsubStatus = ws.onStatus(setStatus);

    const unsubBalance = ws.subscribe('balance', (msg: any) => {
      if (msg.balance) {
        setBalance({
          balance: toNum(msg.balance.balance),
          currency: msg.balance.currency || 'USD',
          account_id: msg.balance.loginid || '',
        });
      }
    });

    const unsubPortfolio = ws.subscribe('portfolio', (msg: any) => {
      if (msg.portfolio?.contracts) {
        setPortfolio(msg.portfolio.contracts.map((c: any) => ({
          ...c,
          buy_price: toNum(c.buy_price),
          payout: toNum(c.payout),
        })));
      }
    });

    const unsubOpenContract = ws.subscribe('proposal_open_contract', (msg: any) => {
      if (msg.proposal_open_contract) {
        const c = msg.proposal_open_contract;
        const normalized: OpenContract = {
          ...c,
          buy_price: toNum(c.buy_price),
          sell_price: toNum(c.sell_price),
          profit: toNum(c.profit),
          profit_percentage: toNum(c.profit_percentage),
          current_spot: toNum(c.current_spot),
          entry_spot: toNum(c.entry_spot),
        };
        setOpenContracts(prev => {
          const updated = new Map(prev);
          updated.set(c.contract_id, normalized);
          return updated;
        });
      }
    });

    const unsubProposal = ws.subscribe('proposal', (msg: any) => {
      if (msg.proposal) {
        setProposal({
          id: msg.proposal.id,
          ask_price: toNum(msg.proposal.ask_price),
          payout: toNum(msg.proposal.payout),
          spot: toNum(msg.proposal.spot),
          spot_time: msg.proposal.spot_time,
          longcode: msg.proposal.longcode,
          display_value: msg.proposal.display_value,
        });
        setIsProposalLoading(false);
      }
    });

    ws.connect();

    ws.onStatus((s) => {
      if (s === 'connected') {
        ws.send({ balance: 1, subscribe: 1 }).catch(() => {});
        ws.send({ portfolio: 1 }).catch(() => {});
      }
    });

    return () => {
      unsubStatus(); unsubBalance(); unsubPortfolio();
      unsubOpenContract(); unsubProposal();
      ws.close();
    };
  }, [wsUrl]);

  const requestProposal = useCallback(async (params: any) => {
    const ws = wsRef.current;
    if (!ws) return;
    if (proposalSubRef.current) {
      ws.forget(proposalSubRef.current);
      proposalSubRef.current = null;
      setProposal(null);
    }
    setIsProposalLoading(true);
    try {
      const res = await ws.send({ proposal: 1, subscribe: 1, ...params }) as any;
      if (res.subscription?.id) proposalSubRef.current = res.subscription.id;
    } catch (err: any) {
      setIsProposalLoading(false);
      throw err;
    }
  }, []);

  const buyContract = useCallback(async (proposalId: string, price: number): Promise<BuyResponse> => {
    const ws = wsRef.current;
    if (!ws) throw new Error('Not connected to trading server');
    const res = await ws.send({ buy: proposalId, price }) as any;
    if (res.error) throw new Error(res.error.message || 'Buy failed');
    if (res.buy) {
      if (res.buy.contract_id) {
        ws.send({ proposal_open_contract: 1, contract_id: res.buy.contract_id, subscribe: 1 });
      }
      ws.send({ portfolio: 1 }).catch(() => {});
      return res.buy;
    }
    throw new Error('Buy failed — no response');
  }, []);

  const clearProposal = useCallback(() => {
    if (proposalSubRef.current && wsRef.current) {
      wsRef.current.forget(proposalSubRef.current);
      proposalSubRef.current = null;
    }
    setProposal(null);
  }, []);

  const resetBalance = useCallback(async () => {
    const ws = wsRef.current;
    if (!ws) return;
    try {
      await ws.send({ topup_virtual: 1 });
      ws.send({ balance: 1, subscribe: 1 }).catch(() => {});
    } catch (err: any) {
      console.error('Reset balance failed:', err.message);
    }
  }, []);

  return {
    status, balance, portfolio,
    openContracts: Array.from(openContracts.values()),
    proposal, isProposalLoading, requestProposal, buyContract,
    clearProposal, resetBalance,
    refreshPortfolio: () => wsRef.current?.send({ portfolio: 1 }).catch(() => {}),
  };
}
