import { create } from 'zustand'

const getInitialTheme = () => {
  const stored = localStorage.getItem('dopra-theme')
  if (stored) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('dopra-theme', theme)
}

const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),

  init: () => {
    applyTheme(get().theme)
  },

  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    set({ theme: next })
  },

  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
}))

export default useThemeStore