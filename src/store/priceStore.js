import { create } from "zustand";

const usePriceStore = create((set) => ({
  currentPrice: 0,

  setCurrentPrice: (price) =>
    set({
      currentPrice: price,
    }),
}));

export default usePriceStore;
