import { create } from "zustand";

const useTradeDirectionStore =
  create((set) => ({
    direction: "CALL",

    setDirection: (direction) =>
      set({
        direction,
      }),
  }));

export default useTradeDirectionStore;
