import { create } from "zustand";

const useProposalStore = create((set) => ({
  payout: 0,

  askPrice: 0,

  proposalId: null,

  setProposal: (proposal) =>
    set({
      payout: proposal.payout,

      askPrice: proposal.ask_price,

      proposalId: proposal.id,
    }),
}));

export default useProposalStore;
