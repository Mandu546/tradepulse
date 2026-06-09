import { create } from "zustand";

const useTradeStore = create((set) => ({
  stake: 10,
  duration: 5,
  unit: "Ticks",

  setStake: (stake) =>
    set({
      stake,
    }),

  setDuration: (duration) =>
    set({
      duration,
    }),

  setUnit: (unit) =>
    set({
      unit,
    }),
}));

export default useTradeStore;

