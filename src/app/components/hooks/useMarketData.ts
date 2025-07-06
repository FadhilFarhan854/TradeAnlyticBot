"use client"
// hooks/useMarketData.ts
import { useEffect, useRef, useState } from 'react';
import { CandleData } from '../../lib/types';

export function useMarketData(symbol: string, interval: string, limit: number) {
  const [data, setData] = useState<CandleData[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch history
  useEffect(() => {
    const fetchHistory = async () => {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, interval, limit }),
      });
      const json = await res.json();
      if (json.data) setData(json.data);
    };

    fetchHistory();
  }, [symbol, interval, limit]);

  // WebSocket update
  useEffect(() => {
    if (wsRef.current) wsRef.current.close();

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const kline = message.k;

      const newCandle: CandleData = {
        openTime: kline.t,
        open: kline.o,
        high: kline.h,
        low: kline.l,
        close: kline.c,
        volume: kline.v,
        closeTime: kline.T,
        trades: kline.n,
      };

      if (kline.o === '0.00000000') return;

      setData((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = newCandle;
        return updated;
      });
    };
    
    

    return () => ws.close();
  }, [symbol, interval]);

  return data;
}
