import { create } from "zustand";

const useAuthStore = create((set) => ({
  token: "",

  setToken: (token) =>
    set({
      token,
    }),
}));

export default useAuthStore;
