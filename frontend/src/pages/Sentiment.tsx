import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react'
import { usePredict } from '../hooks/useMarket'

const SYMBOLS = ['NIFTY50', 'SENSEX', 'BANKNIFTY']

function DirectionBadge({ dir }: { dir: string }) {
  if (dir === 'BULLISH') return (
    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
      <TrendingUp size={14} /> BULLISH
    </span>
  )
  if (dir === 'BEARISH') return (
    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
      <TrendingDown size={14} /> BEARISH
    </span>
  )
  return (
    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold" style={{ background: 'rgba(234,179,8,0.15)', color: '#eab308' }}>
      <Minus size={14} /> SIDEWAYS
    </span>
  )
}

export default function Sentiment() {
  const [symbol, setSymbol] = useState('NIFTY50')
  const { data, isLoading, refetch } = usePredict(symbol)

  const conf = data?.confidence ?? 0
  const confPct = Math.round(conf * 100)

  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>AI Market Sentiment</h2>
        <div className="flex gap-2">
          {SYMBOLS.map(s => (
            <button key={s} onClick={() => setSymbol(s)} className={symbol === s ? 'btn-primary' : 'btn-secondary'} style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>{s}</button>
          ))}
        </div>
        <button onClick={() => refetch()} className="btn-secondary p-2" title="Refresh">
          <RefreshCw size={14} />
        </button>
      </div>

      {isLoading ? (
        <div className="card animate-pulse" style={{ height: 200 }}></div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Signal for {data.symbol}</div>
                <DirectionBadge dir={data.direction} />
              </div>
              <div className="text-right">
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Confidence</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{confPct}%</div>
              </div>
            </div>
            <div className="w-full rounded-full h-3 mb-3" style={{ background: 'var(--border)' }}>
              <div
                className="h-3 rounded-full transition-all"
                style={{ width: `${confPct}%`, background: data.direction === 'BULLISH' ? '#22c55e' : data.direction === 'BEARISH' ? '#ef4444' : '#eab308' }}
              />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{data.rationale}</p>
            <p className="mt-3 text-xs p-2 rounded" style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}>
              ⚠️ {data.disclaimer}
            </p>
          </div>

          <div className="card">
            <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>Signal Features</h3>
            <div className="space-y-2">
              {Object.entries(data.features || {}).map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-1" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{k.replace(/_/g, ' ')}</span>
                  <span className="text-xs font-mono font-medium" style={{ color: 'var(--text)' }}>{String(v)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              Updated: {data.timestamp ? new Date(data.timestamp).toLocaleTimeString('en-IN') : '—'}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 card">
        <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>AI Pipeline Architecture</h3>
        <div className="flex flex-wrap gap-2 items-center text-xs" style={{ color: 'var(--text-muted)' }}>
          {['News Scraper', '→', 'FinBERT Sentiment', '→', 'Feature Store', '→', 'XGBoost Model', '→', 'LLM Rationale', '→', 'Signal API'].map((s, i) => (
            <span key={i} style={s !== '→' ? { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', color: 'var(--text)' } : {}}>{s}</span>
          ))}
        </div>
        <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          Currently using simulated signals. Connect FinBERT + broker option-chain API + FII/DII data to enable real AI predictions.
        </p>
      </div>
    </div>
  )
}
