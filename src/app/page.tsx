"use client";
import { useState } from 'react';
import ChartContainer from '@/app/components/chartContainer'
import SearchBar from '@/app/components/searchbar/SearchBar';
import OrderBook from '@/app/components/orderbook';
import { useMarketData } from './components/hooks/useMarketData';

export default function Home() {
  const [symbol, setSymbol] = useState('btcusdt');
  const [interval, setInterval] = useState('1h');
  const data = useMarketData(symbol, interval, 1000);

  const handleSymbolSelect = (newSymbol: string) => setSymbol(newSymbol);

  return (
    <main>
      <div className='bg-[#2e2e2e] h-[100vh] text-white flex p-5 gap-1'>
        <div className='w-[80%] bg-[#242424] h-full flex flex-col gap-1 rounded-xl'>
          <div className='w-full flex justify-between h-[10%]'>
            <div className='w-full h-[50%] flex gap-2 text-xs pt-2 px-2'>
              {['1m', '5m', '15m', '30m', '1h', '2h', '6h', '12h', '1d', '3d', '1w', '1M'].map((i) => (
                <button
                  key={i}
                  className={`rounded-md px-2 border-2 border-[#5f5f5f] cursor-pointer ${interval === i ? 'bg-[#484848]' : ''}`}
                  onClick={() => setInterval(i)}
                >
                  {i}
                </button>
              ))}
            </div>
            <SearchBar onSelect={handleSymbolSelect} />
          </div>
          <ChartContainer data={data} />
        </div>
        <div className='w-[20%] bg-[#242424] h-full rounded-xl'>
          <OrderBook symbol={symbol} />
        </div>
      </div>
    </main>
  );
}
