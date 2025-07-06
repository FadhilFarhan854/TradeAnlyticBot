// components/ChartContainer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { createChart, ISeriesApi, Time } from 'lightweight-charts';
import { calculateRSI } from './indicator/rsi';
import { CandleData } from '../lib/types';

type Props = {
  data: CandleData[];
};

export default function ChartContainer({ data }: Props) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<ReturnType<typeof createChart> | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;
    if (chartInstanceRef.current) chartInstanceRef.current.remove();

    const chart = createChart(chartRef.current, {
      layout: {
        background: { color: '#242424' },
        textColor: '#ffffff',
      },
      grid: {
        vertLines: { color: '#333' },
        horzLines: { color: '#333' },
      },
      timeScale: {
        borderColor: '#555',
      },
      rightPriceScale: {
        borderColor: '#555',
      },
    
    });
    
    const getPrecision = (price: number) => {
      if (price >= 1000) return 2;
      if (price >= 1) return 4;
      if (price >= 0.01) return 6;
      return 8;
    };

    const firstPrice = parseFloat(data[0].close);
    const precision = getPrecision(firstPrice);

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#05ed43',
      downColor: '#ed1c05',
      borderVisible: false,
      wickUpColor: '#0f0',
      wickDownColor: '#f00',
      priceFormat: {
        type: 'price',
        precision,
        minMove: Math.pow(10, -precision),
      },
    });

    const formattedData = data.map((d) => ({
      time: Math.floor(d.openTime / 1000) as Time,
      open: parseFloat(d.open),
      high: parseFloat(d.high),
      low: parseFloat(d.low),
      close: parseFloat(d.close),
    }));

    candleSeries.setData(formattedData);



    // rsi
    const rsiData = calculateRSI(data);
    const rsiSeries = chart.addLineSeries({
      color: '#f7e33d',
      lineWidth: 1,
      priceScaleId: 'rsi',
    });

    chart.priceScale('rsi')?.applyOptions({
      scaleMargins: { top: 0.7, bottom: 0 },
      borderColor: '#555',
    });

    rsiSeries.setData(rsiData);

    chartInstanceRef.current = chart;
    candleSeriesRef.current = candleSeries;
    rsiSeriesRef.current = rsiSeries;

     
    
  }, [data]);

  

  return <div ref={chartRef} className="h-[90%] w-full" />;
}


