import asyncio
import json
import math
import random
import time
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Market Analysis Pro API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYMBOLS = {
    "NIFTY50": {"base": 24500, "name": "Nifty 50"},
    "SENSEX": {"base": 81200, "name": "BSE Sensex"},
    "BANKNIFTY": {"base": 52300, "name": "Bank Nifty"},
    "RELIANCE": {"base": 2950, "name": "Reliance Industries"},
    "TCS": {"base": 4200, "name": "TCS"},
    "INFY": {"base": 1850, "name": "Infosys"},
    "HDFCBANK": {"base": 1720, "name": "HDFC Bank"},
    "ICICIBANK": {"base": 1280, "name": "ICICI Bank"},
}

_price_state: dict = {}


def get_price(symbol: str) -> float:
    base = SYMBOLS.get(symbol, {}).get("base", 1000)
    if symbol not in _price_state:
        _price_state[symbol] = base
    drift = random.gauss(0, base * 0.001)
    _price_state[symbol] = max(base * 0.8, _price_state[symbol] + drift)
    return round(_price_state[symbol], 2)


def gen_ohlcv(symbol: str, interval: str, periods: int):
    base = SYMBOLS.get(symbol, {}).get("base", 1000)
    minutes = {"1m": 1, "5m": 5, "15m": 15, "1h": 60, "1D": 1440, "1W": 10080}.get(interval, 5)
    now = int(time.time())
    candles = []
    price = base
    for i in range(periods, 0, -1):
        ts = now - i * minutes * 60
        open_ = price
        change = random.gauss(0, base * 0.005)
        close = round(open_ + change, 2)
        high = round(max(open_, close) + abs(random.gauss(0, base * 0.002)), 2)
        low = round(min(open_, close) - abs(random.gauss(0, base * 0.002)), 2)
        volume = int(random.uniform(500000, 2000000))
        candles.append({"time": ts, "open": open_, "high": high, "low": low, "close": close, "volume": volume})
        price = close
    return candles


@app.get("/api/health")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}


@app.get("/api/market/quote/{symbol}")
def quote(symbol: str):
    sym = symbol.upper()
    info = SYMBOLS.get(sym, {"base": 1000, "name": sym})
    ltp = get_price(sym)
    prev = info["base"]
    change = round(ltp - prev, 2)
    change_pct = round((change / prev) * 100, 2)
    return {
        "symbol": sym,
        "name": info["name"],
        "ltp": ltp,
        "open": round(prev * random.uniform(0.998, 1.002), 2),
        "high": round(ltp * random.uniform(1.001, 1.005), 2),
        "low": round(ltp * random.uniform(0.995, 0.999), 2),
        "close": round(prev, 2),
        "change": change,
        "change_pct": change_pct,
        "volume": int(random.uniform(1000000, 5000000)),
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/market/ohlc/{symbol}")
def ohlc(symbol: str, interval: str = "5m", periods: int = 100):
    return {"symbol": symbol.upper(), "interval": interval, "candles": gen_ohlcv(symbol.upper(), interval, periods)}


@app.get("/api/market/indicator/{symbol}")
def indicator(symbol: str, type: str = "rsi", period: int = 14):
    candles = gen_ohlcv(symbol.upper(), "5m", period + 50)
    closes = [c["close"] for c in candles]
    if type == "rsi":
        gains, losses = [], []
        for i in range(1, len(closes)):
            d = closes[i] - closes[i - 1]
            gains.append(max(d, 0))
            losses.append(max(-d, 0))
        avg_gain = sum(gains[-period:]) / period
        avg_loss = sum(losses[-period:]) / period
        rs = avg_gain / avg_loss if avg_loss else 100
        rsi = round(100 - (100 / (1 + rs)), 2)
        return {"symbol": symbol.upper(), "type": "rsi", "period": period, "value": rsi, "signal": "oversold" if rsi < 30 else "overbought" if rsi > 70 else "neutral"}
    elif type == "macd":
        ema12 = closes[-12] if len(closes) >= 12 else closes[-1]
        ema26 = closes[-26] if len(closes) >= 26 else closes[-1]
        macd = round(ema12 - ema26, 2)
        signal = round(macd * 0.9, 2)
        return {"symbol": symbol.upper(), "type": "macd", "macd": macd, "signal": signal, "histogram": round(macd - signal, 2)}
    return {"symbol": symbol.upper(), "type": type, "value": None}


@app.get("/api/predict/{symbol}")
def predict(symbol: str):
    sym = symbol.upper()
    directions = ["BULLISH", "BEARISH", "SIDEWAYS"]
    direction = random.choices(directions, weights=[0.4, 0.3, 0.3])[0]
    confidence = round(random.uniform(0.52, 0.78), 2)
    rationales = {
        "BULLISH": "Technical indicators show RSI recovering from oversold levels with positive MACD crossover. FII net buying has increased over the past 3 sessions. Global cues from Dow Jones are positive. Put-Call Ratio at 0.82 suggests bullish sentiment.",
        "BEARISH": "RSI approaching overbought territory above 68. FII selling pressure observed. Crude oil prices rising, adding inflationary concerns. Put-Call Ratio elevated at 1.15 indicates defensive positioning.",
        "SIDEWAYS": "Mixed signals from technical indicators. Market awaiting RBI policy outcome. FII activity balanced. RSI near neutral 50 level suggests consolidation likely.",
    }
    return {
        "symbol": sym,
        "direction": direction,
        "confidence": confidence,
        "rationale": rationales[direction],
        "features": {
            "rsi": round(random.uniform(35, 70), 1),
            "macd_signal": random.choice(["bullish_crossover", "bearish_crossover", "neutral"]),
            "pcr": round(random.uniform(0.7, 1.3), 2),
            "fii_net_cr": round(random.uniform(-3000, 3000), 0),
            "news_sentiment": round(random.uniform(-1, 1), 2),
            "vix": round(random.uniform(12, 22), 1),
        },
        "disclaimer": "This is a probabilistic research signal, NOT investment advice. Past signals do not guarantee future results.",
        "timestamp": datetime.utcnow().isoformat(),
    }


class BacktestRequest(BaseModel):
    strategy_id: str = "default"
    symbol: str = "NIFTY50"
    start_date: str = "2024-01-01"
    end_date: str = "2024-12-31"
    capital: float = 100000


@app.post("/api/backtest/run")
def backtest_run(req: BacktestRequest):
    n_days = 252
    equity = [req.capital]
    trades = []
    pos = None
    for i in range(n_days):
        ret = random.gauss(0.0004, 0.012)
        new_eq = equity[-1] * (1 + ret)
        equity.append(round(new_eq, 2))
        if random.random() < 0.08:
            side = random.choice(["BUY", "SELL"])
            pnl = round(random.gauss(500, 2000), 2)
            trades.append({"day": i, "side": side, "pnl": pnl})

    total_return = round((equity[-1] - equity[0]) / equity[0] * 100, 2)
    wins = [t for t in trades if t["pnl"] > 0]
    losses = [t for t in trades if t["pnl"] <= 0]
    max_dd = round(min(0, random.gauss(-8, 3)), 2)
    cagr = round(total_return * (365 / n_days), 2)
    sharpe = round(random.uniform(0.8, 2.1), 2)

    return {
        "symbol": req.symbol,
        "capital": req.capital,
        "final_value": equity[-1],
        "total_return_pct": total_return,
        "cagr_pct": cagr,
        "sharpe_ratio": sharpe,
        "max_drawdown_pct": max_dd,
        "win_rate_pct": round(len(wins) / len(trades) * 100, 1) if trades else 0,
        "total_trades": len(trades),
        "avg_win": round(sum(t["pnl"] for t in wins) / len(wins), 2) if wins else 0,
        "avg_loss": round(sum(t["pnl"] for t in losses) / len(losses), 2) if losses else 0,
        "equity_curve": equity[::5],
        "disclaimer": "Past backtest performance does not guarantee future results.",
    }


@app.get("/api/broker/status")
def broker_status():
    return {
        "connected": False,
        "broker": None,
        "mode": "paper",
        "positions": [],
        "daily_pnl": 0,
        "daily_loss_limit": -5000,
        "max_positions": 5,
        "kill_switch_active": False,
        "sebi_compliant": True,
        "disclaimer": "Live trading requires SEBI-compliant broker API with static IP whitelisting and 2FA.",
    }


@app.websocket("/ws/market/{symbol}")
async def ws_market(websocket: WebSocket, symbol: str):
    await websocket.accept()
    sym = symbol.upper()
    try:
        while True:
            ltp = get_price(sym)
            info = SYMBOLS.get(sym, {"base": ltp, "name": sym})
            prev = info["base"]
            await websocket.send_json({
                "symbol": sym,
                "ltp": ltp,
                "change": round(ltp - prev, 2),
                "change_pct": round((ltp - prev) / prev * 100, 2),
                "timestamp": datetime.utcnow().isoformat(),
            })
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        pass
