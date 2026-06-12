import { useEffect, useRef, useState, useCallback } from 'react';
import { WSManager } from '../services/wsManager';
import { ProposalResponse, BuyResponse, OpenContract, PortfolioContract, BalanceData } from '../types/deriv';

export function useAuthWS(wsUrl: string | null) {
  const wsRef = useRef<WSManager | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioContract[]>([]);
  const [openContracts, setOpenContracts] = useState<Map<number, OpenContract>>(new Map());
  const [proposal, setProposal] = useState<ProposalResponse | null>(null);
  const [isProposalLoading, setIsProposalLoading] = useState(false);
  const balanceSubRef = useRef<string | null>(null);
  const proposalSubRef = useRef<string | null>(null);

  useEffect(() => {
    if (!wsUrl) return;
    const ws = new WSManager(wsUrl);
    wsRef.current = ws;
    const unsubStatus = ws.onStatus(setStatus);
    const unsubBalance = ws.subscribe('balance', (msg: any) => {
      if (msg.balance) { setBalance({ balance: msg.balance.balance, currency: msg.balance.currency, account_id: msg.balance.loginid || '' }); }
    });
    const unsubPortfolio = ws.subscribe('portfolio', (msg: any) => {
      if (msg.portfolio?.contracts) { setPortfolio(msg.portfolio.contracts); }
    });
    const unsubOpenContract = ws.subscribe('proposal_open_contract', (msg: any) => {
      if (msg.proposal_open_contract) {
        const contract = msg.proposal_open_contract;
        setOpenContracts(prev => { const updated = new Map(prev); updated.set(contract.contract_id, contract); return updated; });
      }
    });
    const unsubProposal = ws.subscribe('proposal', (msg: any) => {
      if (msg.proposal) {
        setProposal({ id: msg.proposal.id, ask_price: msg.proposal.ask_price, payout: msg.proposal.payout, spot: msg.proposal.spot, spot_time: msg.proposal.spot_time, longcode: msg.proposal.longcode, display_value: msg.proposal.display_value });
        setIsProposalLoading(false);
      }
    });
    ws.connect();
    ws.onStatus((s) => {
      if (s === 'connected') {
        ws.send({ balance: 1, subscribe: 1 }).then((res: any) => { if (res.subscription?.id) { balanceSubRef.current = res.subscription.id; } }).catch(() => {});
        ws.send({ portfolio: 1 }).catch(() => {});
      }
    });
    return () => { unsubStatus(); unsubBalance(); unsubPortfolio(); unsubOpenContract(); unsubProposal(); ws.close(); };
  }, [wsUrl]);

  const requestProposal = useCallback(async (params: any) => {
    const ws = wsRef.current;
    if (!ws) return;
    if (proposalSubRef.current) { ws.forget(proposalSubRef.current); proposalSubRef.current = null; setProposal(null); }
    setIsProposalLoading(true);
    try {
      const res = await ws.send({ proposal: 1, subscribe: 1, ...params }) as any;
      if (res.subscription?.id) { proposalSubRef.current = res.subscription.id; }
    } catch (err: any) { setIsProposalLoading(false); throw err; }
  }, []);

  const buyContract = useCallback(async (proposalId: string, price: number): Promise<BuyResponse> => {
    const ws = wsRef.current;
    if (!ws) throw new Error('Not connected');
    const res = await ws.send({ buy: proposalId, price }) as any;
    if (res.buy) {
      if (res.buy.contract_id) { ws.send({ proposal_open_contract: 1, contract_id: res.buy.contract_id, subscribe: 1 }); }
      ws.send({ portfolio: 1 }).catch(() => {});
      return res.buy;
    }
    throw new Error(res.error?.message || 'Buy failed');
  }, []);

  const clearProposal = useCallback(() => {
    if (proposalSubRef.current && wsRef.current) { wsRef.current.forget(proposalSubRef.current); proposalSubRef.current = null; }
    setProposal(null);
  }, []);

  return {
    status, balance, portfolio,
    openContracts: Array.from(openContracts.values()),
    proposal, isProposalLoading, requestProposal, buyContract, clearProposal,
    refreshPortfolio: () => wsRef.current && wsRef.current.send({ portfolio: 1 }).catch(() => {}),
  };
}
