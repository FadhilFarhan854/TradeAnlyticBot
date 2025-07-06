'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ISeriesApi, Time, LogicalRange } from 'lightweight-charts';
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
  const [userZoomed, setUserZoomed] = useState(false);
  const visibleRangeRef = useRef<LogicalRange | null>(null);

  const getPrecision = (price: number) => {
    if (price >= 1000) return 2;
    if (price >= 1) return 4;
    if (price >= 0.01) return 6;
    return 8;
  };

  // Inisialisasi Chart
  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    // Bersihkan chart sebelumnya jika ada
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
    }

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

    const firstValid = data.find((d) => !isNaN(parseFloat(d.close)));
    const firstPrice = firstValid ? parseFloat(firstValid.close) : 1;
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

    const rsiSeries = chart.addLineSeries({
      color: '#f7e33d',
      lineWidth: 1,
      priceScaleId: 'rsi',
    });

    chart.priceScale('rsi')?.applyOptions({
      scaleMargins: { top: 0.7, bottom: 0 },
      borderColor: '#555',
    });

    // Set data awal
    const formattedData = data.map((d) => ({
      time: Math.floor(d.openTime / 1000) as Time,
      open: parseFloat(d.open),
      high: parseFloat(d.high),
      low: parseFloat(d.low),
      close: parseFloat(d.close),
    }));

    const rsiData = calculateRSI(data);

    candleSeries.setData(formattedData);
    rsiSeries.setData(rsiData);

    // Track user zoom/scroll
    chart.timeScale().subscribeVisibleLogicalRangeChange((newRange) => {
      if (newRange) {
        visibleRangeRef.current = newRange;
        setUserZoomed(true);
      }
    });

    chartInstanceRef.current = chart;
    candleSeriesRef.current = candleSeries;
    rsiSeriesRef.current = rsiSeries;
  }, [data]);

  // Update data TANPA reset zoom
  useEffect(() => {
    if (!candleSeriesRef.current || !rsiSeriesRef.current || !data.length) return;

    const last = data[data.length - 1];
    const latest = {
      time: Math.floor(last.openTime / 1000) as Time,
      open: parseFloat(last.open),
      high: parseFloat(last.high),
      low: parseFloat(last.low),
      close: parseFloat(last.close),
    };

    const rsiData = calculateRSI(data);
    const lastRSI = rsiData[rsiData.length - 1];

    // Gunakan update (bukan setData)
    candleSeriesRef.current.update(latest);
    rsiSeriesRef.current.update(lastRSI);

    // Restore zoom jika user sebelumnya zoom
    if (userZoomed && visibleRangeRef.current && chartInstanceRef.current) {
      chartInstanceRef.current.timeScale().setVisibleLogicalRange(visibleRangeRef.current);
    }
  }, [data]);

  return <div ref={chartRef} className="h-[90%] w-full" />;
}