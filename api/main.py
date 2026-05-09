# api/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf

app = FastAPI(title="Cleanytics TradFi API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/tradfi/{ticker}")
def get_price(ticker: str):
    try:
        stock = yf.Ticker(ticker)
        info = stock.fast_info
        return {
            "ticker": ticker,
            "price": round(info.last_price, 4),
            "previous_close": round(info.previous_close, 4),
            "change_pct": round(
                (info.last_price - info.previous_close) / info.previous_close * 100, 4
            )
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tradfi/{ticker}/history")
def get_history(ticker: str, period: str = "1mo"):
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No data for {ticker}")
        return {
            str(date): round(price, 4)
            for date, price in hist["Close"].items()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))