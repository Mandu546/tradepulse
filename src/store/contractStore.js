import { create } from "zustand";

const useContractStore = create((set) => ({
  selectedContract: "Rise / Fall",

  setSelectedContract: (contract) =>
    set({
      selectedContract: contract,
    }),
}));

export default useContractStore;


