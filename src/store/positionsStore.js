import { create } from "zustand";

const usePositionsStore = create((set) => ({
  positions: [],

  addPosition: (position) =>
    set((state) => ({
      positions: [...state.positions, position],
    })),

  removePosition: (id) =>
    set((state) => ({
      positions: state.positions.filter(
        (position) => position.id !== id
      ),
    })),
}));

export default usePositionsStore;

