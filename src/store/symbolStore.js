import { create } from "zustand";

const useSymbolStore = create((set) => ({
  selectedSymbol: "R_75",

  setSelectedSymbol: (symbol) =>
    set({
      selectedSymbol: symbol,
    }),
}));

export default useSymbolStore;
