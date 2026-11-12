import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, CandlestickSeries, HistogramSeries } from 'lightweight-charts'
import { useOhlc } from '../hooks/useMarket'
import { useThemeStore } from '../store/themeStore'

const SYMBOLS = ['NIFTY50', 'SENSEX', 'BANKNIFTY', 'RELIANCE', 'TCS']
const INTERVALS = ['1m', '5m', '15m', '1h', '1D', '1W']

export default function Charts() {
  const [symbol, setSymbol] = useState('NIFTY50')
  const [interval, setInterval] = useState('5m')
  const { theme } = useThemeStore()
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<any>(null)
  const candleRef = useRef<any>(null)
  const volRef = useRef<any>(null)
  const { data } = useOhlc(symbol, interval)

  useEffect(() => {
    if (!chartRef.current) return
    const isDark = theme === 'dark'
    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 380,
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#111827' : '#ffffff' },
        textColor: isDark ? '#94a3b8' : '#475569',
      },
      grid: {
        vertLines: { color: isDark ? '#1f2937' : '#e2e8f0' },
        horzLines: { color: isDark ? '#1f2937' : '#e2e8f0' },
      },
      crosshair: { mode: 1 },
      timeScale: { timeVisible: true, secondsVisible: false },
    })
    candleRef.current = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e', downColor: '#ef4444',
      borderUpColor: '#22c55e', borderDownColor: '#ef4444',
      wickUpColor: '#22c55e', wickDownColor: '#ef4444',
    })
    volRef.current = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'vol',
    })
    chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } })
    chartInstance.current = chart

    const ro = new ResizeObserver(() => {
      if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth })
    })
    ro.observe(chartRef.current)
    return () => { ro.disconnect(); chart.remove() }
  }, [theme])

  useEffect(() => {
    if (!data?.candles || !candleRef.current) return
    const candles = data.candles.map((c: any) => ({
      time: c.time as number,
      open: c.open, high: c.high, low: c.low, close: c.close,
    }))
    const volumes = data.candles.map((c: any) => ({
      time: c.time as number,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)',
    }))
    candleRef.current.setData(candles)
    volRef.current?.setData(volumes)
    chartInstance.current?.timeScale().fitContent()
  }, [data])

  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <select
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          className="btn-secondary"
          style={{ background: 'var(--surface)', color: 'var(--text)' }}
        >
          {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex gap-1">
          {INTERVALS.map(i => (
            <button
              key={i}
              onClick={() => setInterval(i)}
              className={interval === i ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
            >{i}</button>
          ))}
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-2 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{symbol} · {interval}</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Candlestick + Volume</span>
        </div>
        <div ref={chartRef} style={{ width: '100%' }} />
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {['RSI (14)', 'MACD', 'Bollinger Bands'].map(ind => (
          <div key={ind} className="card">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{ind}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>Live</span>
            </div>
            <div className="h-16 flex items-center justify-center rounded" style={{ background: 'var(--bg)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Indicator panel — connect broker API for live values</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
