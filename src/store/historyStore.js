import { create } from "zustand";

const useHistoryStore = create((set) => ({
  history: [],

  addHistory: (trade) =>
    set((state) => ({
      history: [...state.history, trade],
    })),
}));

export default useHistoryStore;
