import { useState } from 'react'
import { Play, Plus, Code, LayoutGrid } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const DEFAULT_CODE = `# Strategy: RSI Mean Reversion
# Platform: Market Analysis Pro

class Strategy:
    def __init__(self):
        self.rsi_period = 14
        self.rsi_oversold = 30
        self.rsi_overbought = 70

    def on_bar(self, data):
        rsi = data.indicator('rsi', period=self.rsi_period)
        if rsi < self.rsi_oversold:
            return Signal('BUY', quantity=50)
        elif rsi > self.rsi_overbought:
            return Signal('SELL', quantity=50)
        return None
`

const VISUAL_RULES = [
  { id: 1, type: 'condition', label: 'IF RSI(14) < 30', color: '#3b82f6' },
  { id: 2, type: 'operator', label: 'AND', color: '#8b5cf6' },
  { id: 3, type: 'condition', label: 'Price > VWAP', color: '#3b82f6' },
  { id: 4, type: 'action', label: 'THEN BUY 50 qty', color: '#22c55e' },
]

function BacktestResults({ result }: { result: any }) {
  const equity = (result.equity_curve || []).map((v: number, i: number) => ({ day: i * 5, value: v }))
  return (
    <div className="card mt-4">
      <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>Backtest Results</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total Return', value: `${result.total_return_pct > 0 ? '+' : ''}${result.total_return_pct}%`, cls: result.total_return_pct > 0 ? 'up' : 'down' },
          { label: 'CAGR', value: `${result.cagr_pct}%`, cls: '' },
          { label: 'Sharpe Ratio', value: result.sharpe_ratio, cls: '' },
          { label: 'Max Drawdown', value: `${result.max_drawdown_pct}%`, cls: 'down' },
          { label: 'Win Rate', value: `${result.win_rate_pct}%`, cls: '' },
          { label: 'Total Trades', value: result.total_trades, cls: '' },
          { label: 'Avg Win', value: `₹${result.avg_win}`, cls: 'up' },
          { label: 'Avg Loss', value: `₹${result.avg_loss}`, cls: 'down' },
        ].map(m => (
          <div key={m.label} className="p-2 rounded" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{m.label}</div>
            <div className={`font-bold text-sm ${m.cls}`} style={{ color: m.cls ? undefined : 'var(--text)' }}>{m.value}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={equity}>
            <defs>
              <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Portfolio']} />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#eqGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>⚠️ {result.disclaimer}</p>
    </div>
  )
}

export default function Strategy() {
  const [mode, setMode] = useState<'visual' | 'code'>('visual')
  const [code, setCode] = useState(DEFAULT_CODE)
  const [symbol, setSymbol] = useState('NIFTY50')
  const [capital, setCapital] = useState(100000)

  const bt = useMutation({
    mutationFn: (body: any) => fetch('/api/backtest/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  })

  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Strategy Builder</h2>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <button onClick={() => setMode('visual')} className={mode === 'visual' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <LayoutGrid size={12} /> Visual
          </button>
          <button onClick={() => setMode('code')} className={mode === 'code' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Code size={12} /> Code
          </button>
        </div>
      </div>

      {mode === 'visual' ? (
        <div className="card">
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>Visual Rule Builder</h3>
          <div className="flex flex-wrap gap-2 items-center mb-4">
            {VISUAL_RULES.map(r => (
              <div key={r.id} className="px-3 py-2 rounded-lg text-sm font-medium" style={{ background: `${r.color}20`, border: `1px solid ${r.color}50`, color: r.color }}>
                {r.label}
              </div>
            ))}
            <button className="btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus size={12} /> Add Rule
            </button>
          </div>
          <div className="p-3 rounded text-xs" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>
            Available conditions: RSI, MACD, EMA crossover, Bollinger Band breakout, VWAP, Volume spike, Price change %, Supertrend, Stochastic
          </div>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            <Code size={14} color="#94a3b8" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>strategy.py</span>
          </div>
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            className="w-full p-4 font-mono text-xs resize-none"
            style={{ height: 240, background: 'var(--surface)', color: 'var(--text)', outline: 'none', border: 'none' }}
          />
        </div>
      )}

      <div className="mt-4 card">
        <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>Run Backtest</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Symbol</label>
            <select value={symbol} onChange={e => setSymbol(e.target.value)} className="btn-secondary w-full" style={{ background: 'var(--surface)', color: 'var(--text)' }}>
              {['NIFTY50', 'SENSEX', 'BANKNIFTY', 'RELIANCE', 'TCS'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Capital (₹)</label>
            <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} className="btn-secondary w-full" style={{ background: 'var(--surface)', color: 'var(--text)' }} />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Start Date</label>
            <input type="date" defaultValue="2024-01-01" className="btn-secondary w-full" style={{ background: 'var(--surface)', color: 'var(--text)' }} />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>End Date</label>
            <input type="date" defaultValue="2024-12-31" className="btn-secondary w-full" style={{ background: 'var(--surface)', color: 'var(--text)' }} />
          </div>
        </div>
        <button
          onClick={() => bt.mutate({ strategy_id: 'default', symbol, capital, start_date: '2024-01-01', end_date: '2024-12-31' })}
          disabled={bt.isPending}
          className="btn-primary flex items-center gap-2"
        >
          <Play size={14} />
          {bt.isPending ? 'Running...' : 'Run Backtest'}
        </button>
      </div>

      {bt.data && <BacktestResults result={bt.data} />}
    </div>
  )
}
