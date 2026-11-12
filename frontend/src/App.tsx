import { useState } from 'react'
import Header from './components/Header'
import Disclaimer from './components/Disclaimer'
import Dashboard from './pages/Dashboard'
import Charts from './pages/Charts'
import Sentiment from './pages/Sentiment'
import Strategy from './pages/Strategy'
import Broker from './pages/Broker'

export default function App() {
  const [tab, setTab] = useState('Dashboard')

  const page = {
    Dashboard: <Dashboard />,
    Charts: <Charts />,
    Sentiment: <Sentiment />,
    Strategy: <Strategy />,
    Broker: <Broker />,
  }[tab] ?? <Dashboard />

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Header activeTab={tab} setTab={setTab} />
      <main className="flex-1 max-w-7xl w-full mx-auto pb-8">
        {page}
      </main>
      <Disclaimer />
    </div>
  )
}
