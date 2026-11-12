import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useAllQuotes } from '../hooks/useMarket'

const SYMBOLS = ['NIFTY50', 'SENSEX', 'BANKNIFTY', 'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK']

function QuoteCard({ q }: { q: any }) {
  const up = q.change >= 0
  return (
    <div className="card">
      <div className="flex justify-between items-start mb-1">
        <div>
          <div className="font-bold text-sm" style={{ color: 'var(--text)' }}>{q.symbol}</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{q.name}</div>
        </div>
        {up ? <TrendingUp size={18} className="up" /> : <TrendingDown size={18} className="down" />}
      </div>
      <div className="text-xl font-bold" style={{ color: 'var(--text)' }}>
        ₹{q.ltp?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
      </div>
      <div className={`text-sm font-medium ${up ? 'up' : 'down'}`}>
        {up ? '+' : ''}{q.change?.toFixed(2)} ({up ? '+' : ''}{q.change_pct?.toFixed(2)}%)
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>H: ₹{q.high?.toFixed(2)}</span>
        <span>L: ₹{q.low?.toFixed(2)}</span>
        <span>O: ₹{q.open?.toFixed(2)}</span>
        <span>Vol: {(q.volume / 1e6).toFixed(1)}M</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { data: quotes, isLoading } = useAllQuotes(SYMBOLS)

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Market Overview</h2>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SYMBOLS.map(s => (
            <div key={s} className="card animate-pulse" style={{ height: 120 }}></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(quotes || []).map((q: any) => <QuoteCard key={q.symbol} q={q} />)}
        </div>
      )}

      <div className="mt-6 card">
        <h3 className="font-semibold mb-3 text-sm" style={{ color: 'var(--text)' }}>Market Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span style={{ color: 'var(--text-muted)' }}>NSE Status</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
              <span style={{ color: 'var(--text)' }}>Market Open (Simulated)</span>
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Data Source</span>
            <div className="mt-1 font-medium" style={{ color: 'var(--text)' }}>Simulated Feed</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Last Updated</span>
            <div className="mt-1 font-medium" style={{ color: 'var(--text)' }}>{new Date().toLocaleTimeString('en-IN')}</div>
          </div>
        </div>
        <p className="mt-3 text-xs p-2 rounded" style={{ background: 'rgba(59,130,246,0.1)', color: '#93c5fd' }}>
          Connect a broker API (Zerodha Kite Connect, Upstox, Angel One SmartAPI) to replace simulated data with live market feeds.
        </p>
      </div>
    </div>
  )
}
