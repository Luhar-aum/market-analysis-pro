import { useState } from 'react'
import { Shield, AlertTriangle, Zap, Power } from 'lucide-react'
import { useBrokerStatus } from '../hooks/useMarket'

const BROKERS = [
  { id: 'zerodha', name: 'Zerodha Kite Connect', cost: '₹2000/month', docs: 'kite.trade/docs' },
  { id: 'upstox', name: 'Upstox API', cost: 'Free tier', docs: 'upstox.com/developer' },
  { id: 'angelone', name: 'Angel One SmartAPI', cost: 'Free', docs: 'smartapi.angelbroking.com' },
  { id: 'fyers', name: 'Fyers API', cost: 'Free', docs: 'myapi.fyers.in' },
]

export default function Broker() {
  const { data: status } = useBrokerStatus()
  const [killSwitch, setKillSwitch] = useState(false)
  const [mode, setMode] = useState<'paper' | 'live'>('paper')
  const [maxLoss, setMaxLoss] = useState(5000)
  const [maxPositions, setMaxPositions] = useState(5)
  const [autoMode, setAutoMode] = useState(false)

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Broker Integration</h2>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'rgba(234,179,8,0.15)', color: '#eab308' }}>
          <AlertTriangle size={12} /> SEBI Compliant Framework Required
        </div>
      </div>

      <div className="card" style={{ borderColor: '#1d4ed8', background: 'rgba(29,78,216,0.08)' }}>
        <div className="flex items-start gap-3">
          <Shield size={20} color="#60a5fa" className="mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-sm mb-1" style={{ color: '#93c5fd' }}>SEBI Retail Algo Framework (Mandatory since April 1, 2026)</div>
            <ul className="text-xs space-y-1" style={{ color: '#bfdbfe' }}>
              <li>• OAuth-based login + mandatory 2FA for all broker API sessions</li>
              <li>• Static IP whitelisting — register your server's IP in broker developer console</li>
              <li>• Daily session reset — re-authenticate before next-day pre-open (9:00 AM IST)</li>
              <li>• Algo/Strategy ID tagging — every order must carry broker-issued Algo-ID</li>
              <li>• Personal use only (&lt;10 orders/sec) — selling to others requires RA license</li>
              <li>• No "guaranteed return" claims permitted anywhere in the platform</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>Supported Brokers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BROKERS.map(b => (
            <div key={b.id} className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{b.name}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.cost} · {b.docs}</div>
              </div>
              <button className="btn-secondary text-xs" style={{ padding: '0.25rem 0.75rem' }}>Connect</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>Trading Mode</h3>
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setMode('paper')}
            className={mode === 'paper' ? 'btn-primary' : 'btn-secondary'}
          >Paper Trading</button>
          <button
            onClick={() => setMode('live')}
            className={mode === 'live' ? 'btn-primary' : 'btn-secondary'}
            style={mode === 'live' ? { background: '#dc2626' } : {}}
          >Live Trading</button>
        </div>
        {mode === 'live' && (
          <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
            ⚠️ Live trading uses real capital. Ensure you have completed all SEBI compliance steps, whitelisted your IP, and tested thoroughly in paper mode.
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text)' }}>Risk Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Daily Max Loss (₹)</label>
            <input type="number" value={maxLoss} onChange={e => setMaxLoss(Number(e.target.value))} className="btn-secondary w-full" style={{ background: 'var(--surface)', color: 'var(--text)' }} />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Max Open Positions</label>
            <input type="number" value={maxPositions} onChange={e => setMaxPositions(Number(e.target.value))} className="btn-secondary w-full" style={{ background: 'var(--surface)', color: 'var(--text)' }} />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg mb-3" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <Zap size={14} color="#60a5fa" />
            <span className="text-sm" style={{ color: 'var(--text)' }}>Auto-Execute Mode</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>(vs. manual confirm)</span>
          </div>
          <button
            onClick={() => setAutoMode(!autoMode)}
            className={autoMode ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
          >{autoMode ? 'ON' : 'OFF'}</button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: killSwitch ? 'rgba(239,68,68,0.1)' : 'var(--bg)', border: `1px solid ${killSwitch ? 'rgba(239,68,68,0.5)' : 'var(--border)'}` }}>
          <div className="flex items-center gap-2">
            <Power size={14} color={killSwitch ? '#ef4444' : '#94a3b8'} />
            <span className="text-sm font-medium" style={{ color: killSwitch ? '#ef4444' : 'var(--text)' }}>Kill Switch</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{killSwitch ? 'All trading HALTED' : 'Trading enabled'}</span>
          </div>
          <button
            onClick={() => setKillSwitch(!killSwitch)}
            className="btn-secondary"
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', color: killSwitch ? '#ef4444' : undefined, borderColor: killSwitch ? '#ef4444' : undefined }}
          >{killSwitch ? 'RESUME' : 'HALT ALL'}</button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>Audit Log</h3>
        <div className="rounded-lg p-3 text-xs font-mono space-y-1" style={{ background: 'var(--bg)', maxHeight: 140, overflow: 'auto' }}>
          {[
            '[2026-11-12 09:15:03] System started — paper trading mode',
            '[2026-11-12 09:15:04] Risk controls initialized — max loss: ₹5,000',
            '[2026-11-12 09:15:05] No broker connection — awaiting OAuth setup',
            '[2026-11-12 09:15:06] Kill switch: INACTIVE',
          ].map((l, i) => (
            <div key={i} style={{ color: 'var(--text-muted)' }}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
