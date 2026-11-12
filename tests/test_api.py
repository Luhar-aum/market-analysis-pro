import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health():
    r = client.get('/api/health')
    assert r.status_code == 200
    assert r.json()['status'] == 'ok'


def test_quote():
    r = client.get('/api/market/quote/NIFTY50')
    assert r.status_code == 200
    d = r.json()
    assert d['symbol'] == 'NIFTY50'
    assert 'ltp' in d
    assert 'change_pct' in d


def test_ohlc():
    r = client.get('/api/market/ohlc/NIFTY50?interval=5m&periods=10')
    assert r.status_code == 200
    d = r.json()
    assert 'candles' in d
    assert len(d['candles']) == 10


def test_indicator_rsi():
    r = client.get('/api/market/indicator/NIFTY50?type=rsi&period=14')
    assert r.status_code == 200
    d = r.json()
    assert d['type'] == 'rsi'
    assert 0 <= d['value'] <= 100


def test_predict():
    r = client.get('/api/predict/NIFTY50')
    assert r.status_code == 200
    d = r.json()
    assert d['direction'] in ('BULLISH', 'BEARISH', 'SIDEWAYS')
    assert 0 < d['confidence'] < 1
    assert 'disclaimer' in d


def test_backtest():
    r = client.post('/api/backtest/run', json={
        'strategy_id': 'test', 'symbol': 'NIFTY50',
        'start_date': '2024-01-01', 'end_date': '2024-12-31', 'capital': 100000
    })
    assert r.status_code == 200
    d = r.json()
    assert 'total_return_pct' in d
    assert 'sharpe_ratio' in d
    assert 'equity_curve' in d


def test_broker_status():
    r = client.get('/api/broker/status')
    assert r.status_code == 200
    d = r.json()
    assert d['mode'] == 'paper'
    assert d['sebi_compliant'] is True
