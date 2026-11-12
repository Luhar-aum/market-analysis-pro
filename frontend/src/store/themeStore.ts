import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeStore {
  theme: Theme
  setTheme: (t: Theme) => void
  toggle: () => void
}

function getInitial(): Theme {
  const stored = localStorage.getItem('market-analysis-pro-theme') as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: getInitial(),
  setTheme: (t) => {
    localStorage.setItem('market-analysis-pro-theme', t)
    document.documentElement.classList.toggle('dark', t === 'dark')
    set({ theme: t })
  },
  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },
}))
