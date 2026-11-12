from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import random
from datetime import datetime, timedelta
import math

app = FastAPI(title="Market Analysis API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

active_connections: dict[str, list[WebSocket]] = {}

SYMBOLS = {
    "NIFTY50": {"name": "Nifty 50", "base": 22500},
    "SENSEX": {"name": "BSE Sensex", "base": 74000},
    "BANKNIFTY": {"name": "Bank Nifty", "base": 48000},
    "RELIANCE": {"name": "Reliance Industries", "base": 2900},
    "TCS": {"name": "TCS", "base": 3800},
    "INFY": {"name": "Infosys", "base": 1600},
    "HDFC": {"name": "HDFC Bank", "base": 1550},
    "ICICIBANK": {"name": "ICICI Bank", "base": 1150},
}


def generate_mock_price(symbol: str, offset: float = 0):
    base = SYMBOLS.get(symbol, {}).get("base", 1000)
    variation = base * 0.02 * math.sin(offset + random.random())
    return round(base + variation, 2)


def generate_ohlcv(symbol: str, interval: str, periods: int):
    base = SYMBOLS.get(symbol, {}).get("base", 1000)
    candles = []
    now = datetime.now()

    interval_minutes = {"1m": 1, "5m": 5, "15m": 15, "1h": 60, "1D": 1440, "1W": 10080}
    mins = interval_minutes.get(interval, 5)

    price = base
    for i in range(periods, 0, -1):
        ts = now - timedelta(minutes=mins * i)
        change = price * random.uniform(-0.005, 0.005)
        open_ = round(price, 2)
        close = round(price + change, 2)
        high = round(max(open_, close) * random.uniform(1.001, 1.008), 2)
        low = round(min(open_, close) * random.uniform(0.992, 0.999), 2)
        volume = random.randint(100000, 2000000)
        candles.append({
            "time": int(ts.timestamp()),
            "open": open_,
            "high": high,
            "low": low,
            "close": close,
            "volume": volume
        })
        price = close
    return candles


@app.get("/api/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


@app.get("/api/market/symbols")
async def get_symbols():
    return {"symbols": [
        {"symbol": k, "name": v["name"]} for k, v in SYMBOLS.items()
    ]}


@app.get("/api/market/quote/{symbol}")
async def get_quote(symbol: str):
    sym = symbol.upper()
    base = SYMBOLS.get(sym, {}).get("base", 1000)
    ltp = generate_mock_price(sym)
    prev_close = round(base * random.uniform(0.99, 1.01), 2)
    change = round(ltp - prev_close, 2)
    change_pct = round((change / prev_close) * 100, 2)
    return {
        "symbol": sym,
        "name": SYMBOLS.get(sym, {}).get("name", sym),
        "ltp": ltp,
        "open": round(prev_close * random.uniform(0.998, 1.002), 2),
        "high": round(ltp * random.uniform(1.005, 1.015), 2),
        "low": round(ltp * random.uniform(0.985, 0.995), 2),
        "prev_close": prev_close,
        "change": change,
        "change_pct": change_pct,
        "volume": random.randint(1000000, 50000000),
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/market/ohlc/{symbol}")
async def get_ohlc(symbol: str, interval: str = "5m", periods: int = 100):
    sym = symbol.upper()
    candles = generate_ohlcv(sym, interval, periods)
    return {"symbol": sym, "interval": interval, "candles": candles}


@app.get("/api/market/indicator/{symbol}")
async def get_indicator(symbol: str, type: str = "rsi", period: int = 14):
    sym = symbol.upper()
    candles = generate_ohlcv(sym, "5m", period * 3)
    closes = [c["close"] for c in candles]

    if type == "rsi":
        gains, losses = [], []
        for i in range(1, len(closes)):
            diff = closes[i] - closes[i - 1]
            gains.append(max(diff, 0))
            losses.append(max(-diff, 0))
        avg_gain = sum(gains[-period:]) / period
        avg_loss = sum(losses[-period:]) / period
        rs = avg_gain / avg_loss if avg_loss != 0 else 100
        rsi = round(100 - (100 / (1 + rs)), 2)
        return {"symbol": sym, "indicator": "rsi", "period": period, "value": rsi}

    elif type == "macd":
        ema12 = sum(closes[-12:]) / 12
        ema26 = sum(closes[-26:]) / 26
        macd_line = round(ema12 - ema26, 2)
        signal = round(macd_line * 0.9, 2)
        histogram = round(macd_line - signal, 2)
        return {"symbol": sym, "indicator": "macd", "macd": macd_line, "signal": signal, "histogram": histogram}

    return {"symbol": sym, "indicator": type, "value": None, "error": "unsupported indicator"}


@app.get("/api/predict/{symbol}")
async def predict_direction(symbol: str):
    sym = symbol.upper()
    directions = ["UP", "DOWN", "SIDEWAYS"]
    direction = random.choices(directions, weights=[0.4, 0.3, 0.3])[0]
    confidence = round(random.uniform(0.52, 0.78), 2)

    features = {
        "rsi": round(random.uniform(30, 70), 1),
        "macd_signal": random.choice(["bullish", "bearish", "neutral"]),
        "pcr": round(random.uniform(0.7, 1.4), 2),
        "fii_net": round(random.uniform(-3000, 3000), 0),
        "sentiment_score": round(random.uniform(-1, 1), 2),
        "vix": round(random.uniform(12, 22), 1)
    }

    rationale_map = {
        "UP": f"Technical indicators suggest bullish momentum with RSI at {features['rsi']}. FII activity shows net {'buying' if features['fii_net'] > 0 else 'selling'} of Rs.{abs(features['fii_net'])}Cr. PCR at {features['pcr']} indicates {'call writing' if features['pcr'] > 1 else 'put writing'} dominance.",
        "DOWN": f"Bearish signals detected with RSI at {features['rsi']} showing potential overbought conditions. Global cues mixed with VIX at {features['vix']}. FII net flow of Rs.{features['fii_net']}Cr adds pressure.",
        "SIDEWAYS": f"Consolidation expected near current levels. RSI neutral at {features['rsi']}, PCR balanced at {features['pcr']}. Market awaiting directional trigger."
    }

    return {
        "symbol": sym,
        "direction": direction,
        "confidence": confidence,
        "rationale": rationale_map[direction],
        "features": features,
        "disclaimer": "This is a probabilistic research signal, NOT investment advice. Past performance does not guarantee future results.",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/backtest/run")
async def run_backtest(body: dict):
    symbol = body.get("symbol", "NIFTY50")
    capital = body.get("capital", 100000)

    trades = random.randint(45, 120)
    win_rate = random.uniform(0.48, 0.65)
    total_return = random.uniform(8, 28)

    equity_curve = []
    equity = capital
    now = datetime.now()
    for i in range(252):
        daily_return = random.uniform(-0.015, 0.018)
        equity = round(equity * (1 + daily_return), 2)
        equity_curve.append({
            "time": int((now - timedelta(days=252 - i)).timestamp()),
            "value": equity
        })

    return {
        "symbol": symbol,
        "capital": capital,
        "metrics": {
            "total_return_pct": round(total_return, 2),
            "cagr_pct": round(total_return * 0.9, 2),
            "sharpe_ratio": round(random.uniform(0.8, 2.1), 2),
            "max_drawdown_pct": round(random.uniform(5, 18), 2),
            "win_rate_pct": round(win_rate * 100, 1),
            "total_trades": trades,
            "avg_win_pct": round(random.uniform(1.2, 3.5), 2),
            "avg_loss_pct": round(random.uniform(0.8, 2.0), 2),
            "profit_factor": round(random.uniform(1.1, 2.5), 2)
        },
        "equity_curve": equity_curve,
        "disclaimer": "Past backtest performance does not guarantee future results."
    }


@app.get("/api/broker/positions")
async def get_positions():
    return {
        "positions": [
            {"symbol": "NIFTY50", "qty": 50, "avg_price": 22450, "ltp": 22510, "pnl": 3000, "type": "LONG"},
            {"symbol": "BANKNIFTY", "qty": 25, "avg_price": 47900, "ltp": 48050, "pnl": 3750, "type": "LONG"},
        ],
        "total_pnl": 6750,
        "mode": "PAPER"
    }


@app.post("/api/broker/order")
async def place_order(body: dict):
    return {
        "order_id": f"ORD{random.randint(100000, 999999)}",
        "status": "PENDING_CONFIRMATION",
        "symbol": body.get("symbol"),
        "qty": body.get("qty"),
        "order_type": body.get("order_type", "MARKET"),
        "mode": "PAPER",
        "timestamp": datetime.now().isoformat(),
        "message": "Order queued for manual confirmation (paper trading mode)"
    }


@app.websocket("/ws/market/{symbol}")
async def websocket_market(websocket: WebSocket, symbol: str):
    await websocket.accept()
    sym = symbol.upper()
    offset = random.random() * 100
    try:
        while True:
            offset += 0.1
            price = generate_mock_price(sym, offset)
            change = round(price - SYMBOLS.get(sym, {}).get("base", 1000), 2)
            await websocket.send_json({
                "symbol": sym,
                "ltp": price,
                "change": change,
                "change_pct": round(change / SYMBOLS.get(sym, {}).get("base", 1000) * 100, 2),
                "volume": random.randint(100, 10000),
                "timestamp": datetime.now().isoformat()
            })
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        pass
