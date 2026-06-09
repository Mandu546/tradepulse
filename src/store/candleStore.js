import { create } from "zustand";

const useCandleStore = create((set) => ({
  candles: [],

  setCandles: (candles) =>
    set({
      candles,
    }),

  addCandle: (candle) =>
    set((state) => ({
      candles: [...state.candles, candle],
    })),
}));

export default useCandleStore;

