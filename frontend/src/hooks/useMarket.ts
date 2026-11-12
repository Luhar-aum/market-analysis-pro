import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

const API = '/api'

export function useQuote(symbol: string) {
  return useQuery({
    queryKey: ['quote', symbol],
    queryFn: () => fetch(`${API}/market/quote/${symbol}`).then(r => r.json()),
    refetchInterval: 3000,
  })
}

export function useOhlc(symbol: string, interval: string) {
  return useQuery({
    queryKey: ['ohlc', symbol, interval],
    queryFn: () => fetch(`${API}/market/ohlc/${symbol}?interval=${interval}&periods=120`).then(r => r.json()),
    refetchInterval: 10000,
  })
}

export function usePredict(symbol: string) {
  return useQuery({
    queryKey: ['predict', symbol],
    queryFn: () => fetch(`${API}/predict/${symbol}`).then(r => r.json()),
    refetchInterval: 30000,
  })
}

export function useBrokerStatus() {
  return useQuery({
    queryKey: ['broker'],
    queryFn: () => fetch(`${API}/broker/status`).then(r => r.json()),
    refetchInterval: 10000,
  })
}

export function useAllQuotes(symbols: string[]) {
  return useQuery({
    queryKey: ['allQuotes', ...symbols],
    queryFn: () => Promise.all(symbols.map(s => fetch(`${API}/market/quote/${s}`).then(r => r.json()))),
    refetchInterval: 3000,
  })
}

export function useLiveTick(symbol: string) {
  const [tick, setTick] = useState<{ ltp: number; change: number; change_pct: number } | null>(null)
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    ws.current = new WebSocket(`${proto}://${window.location.host}/ws/market/${symbol}`)
    ws.current.onmessage = (e) => {
      try { setTick(JSON.parse(e.data)) } catch {}
    }
    return () => ws.current?.close()
  }, [symbol])

  return tick
}
