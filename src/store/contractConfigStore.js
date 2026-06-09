import { create } from "zustand";

const useContractConfigStore = create((set) => ({
  duration: 5,

  durationUnit: "t",

  barrier: 5,

  prediction: 5,

  contractType: "CALL",

  tradeDirection: "CALL",

  setDuration: (duration) =>
    set({
      duration,
    }),

  setDurationUnit: (durationUnit) =>
    set({
      durationUnit,
    }),

  setBarrier: (barrier) =>
    set({
      barrier,
    }),

  setPrediction: (prediction) =>
    set({
      prediction,
    }),

  setContractType: (contractType) =>
    set({
      contractType,
    }),
        setTradeDirection: (tradeDirection) =>
  set({
    tradeDirection,
  }),

}));

export default useContractConfigStore;
