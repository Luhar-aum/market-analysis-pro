import { Moon, Sun, TrendingUp } from 'lucide-react'
import { useThemeStore } from '../store/themeStore'

interface Props {
  activeTab: string
  setTab: (t: string) => void
}

const TABS = ['Dashboard', 'Charts', 'Sentiment', 'Strategy', 'Broker']

export default function Header({ activeTab, setTab }: Props) {
  const { theme, toggle } = useThemeStore()

  return (
    <header className="sticky top-0 z-50" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={22} color="#3b82f6" />
          <span className="font-bold text-base" style={{ color: 'var(--text)' }}>Market Analysis Pro</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">BETA</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`tab${activeTab === t ? ' active' : ''}`}
            >{t}</button>
          ))}
        </nav>
        <button onClick={toggle} className="btn-secondary p-2" title="Toggle theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
      <nav className="flex md:hidden overflow-x-auto px-4 pb-2 gap-1">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`tab whitespace-nowrap${activeTab === t ? ' active' : ''}`}>{t}</button>
        ))}
      </nav>
    </header>
  )
}
