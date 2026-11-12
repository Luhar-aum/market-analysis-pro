import pytest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_symbols():
    r = client.get("/api/market/symbols")
    assert r.status_code == 200
    assert "symbols" in r.json()
    assert len(r.json()["symbols"]) > 0


def test_quote_nifty():
    r = client.get("/api/market/quote/NIFTY50")
    assert r.status_code == 200
    data = r.json()
    assert "ltp" in data
    assert "change_pct" in data
    assert data["symbol"] == "NIFTY50"


def test_ohlc():
    r = client.get("/api/market/ohlc/NIFTY50?interval=5m&periods=50")
    assert r.status_code == 200
    data = r.json()
    assert "candles" in data
    assert len(data["candles"]) == 50


def test_indicator_rsi():
    r = client.get("/api/market/indicator/NIFTY50?type=rsi&period=14")
    assert r.status_code == 200
    data = r.json()
    assert "value" in data
    assert 0 <= data["value"] <= 100


def test_predict():
    r = client.get("/api/predict/NIFTY50")
    assert r.status_code == 200
    data = r.json()
    assert data["direction"] in ["UP", "DOWN", "SIDEWAYS"]
    assert 0 < data["confidence"] < 1


def test_backtest():
    r = client.post("/api/backtest/run", json={"symbol": "NIFTY50", "capital": 100000})
    assert r.status_code == 200
    data = r.json()
    assert "metrics" in data
    assert "equity_curve" in data
    assert len(data["equity_curve"]) > 0
