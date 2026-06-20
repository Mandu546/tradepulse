import { create } from 'zustand'

const useAuthStore = create((set) => ({
  token: localStorage.getItem('dopra-token') || '',
  account: null,
  balance: null,
  currency: 'USD',
  isLoggedIn: false,

  setToken: (token) => {
    localStorage.setItem('dopra-token', token)
    set({ token, isLoggedIn: !!token })
  },

  setAccount: (account) => set({ account, isLoggedIn: true }),

  setBalance: (balance, currency) => set({ balance, currency }),

  logout: () => {
    localStorage.removeItem('dopra-token')
    set({ token: '', account: null, balance: null, isLoggedIn: false })
  },
}))

export default useAuthStore