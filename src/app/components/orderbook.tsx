/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';

// Tipe order (price, quantity)
type Order = [string, string];

export default function OrderBookDOM({ symbol }: { symbol: string }) {
  const [bids, setBids] = useState<Order[]>([]);
  const [asks, setAsks] = useState<Order[]>([]);

  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth20@100ms`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.bids && data.asks) {
        setBids(data.bids.slice(0, 10));
        setAsks(data.asks.slice(0, 10));
      }
    };

    return () => ws.close();
  }, [symbol]);

  // Temukan volume maksimum untuk skalakan bar
  const maxVolume = Math.max(
    ...bids.map(([_, qty]) => parseFloat(qty)),
    ...asks.map(([_, qty]) => parseFloat(qty))
  );

  const renderRow = (type: 'bid' | 'ask', [price, qty]: Order, i: number) => {
    const volume = parseFloat(qty);
    const widthPercent = ((volume / maxVolume) * 100).toFixed(2);
    const isBid = type === 'bid';
    const barColor = isBid ? 'bg-green-600' : 'bg-red-600';
    const textColor = isBid ? 'text-green-400' : 'text-red-400';
  
    return (
      <div key={i} className="relative flex justify-between text-xs py-0.5 px-1">
        <div
          className={clsx(
            'absolute top-0 left-0 h-full opacity-60 z-0 rounded-sm',
            barColor
          )}
          style={{ width: `${widthPercent}%` }}
        />
        <span className={`${textColor} z-10`}>{parseFloat(price).toFixed(8)}</span>
        <span className="z-10">{volume.toFixed(3)}</span>
      </div>
    );
  };

  return (
    <div className="p-2 text-white h-full overflow-auto">
      <h2 className="text-center text-sm font-bold text-green-400 mb-1">Bids</h2>
      <div className="mb-4">
        {bids.map((bid, i) => renderRow('bid', bid, i))}
      </div>

      <h2 className="text-center text-sm font-bold text-red-400 mb-1">Asks</h2>
      <div>
        {asks.map((ask, i) => renderRow('ask', ask, i))}
      </div>
    </div>
  );
}
