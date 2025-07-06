/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/history/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const symbol = (body.symbol || '').toUpperCase();
    const interval = body.interval || '1m';
    const limit = Math.min(Number(body.limit) || 100, 1000); // Max 1000

    if (!symbol || !interval) {
      return NextResponse.json({ error: 'Missing required fields: symbol, interval' }, { status: 400 });
    }

    const binanceUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

    const res = await fetch(binanceUrl);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Binance' }, { status: 500 });
    }

    const rawData = await res.json();

    // Format hasil agar lebih mudah dibaca
    const formatted = rawData.map((d: any[]) => ({
      openTime: d[0],
      open: d[1],
      high: d[2],
      low: d[3],
      close: d[4],
      volume: d[5],
      closeTime: d[6],
      trades: d[8],
    }));

    return NextResponse.json({
      symbol,
      interval,
      limit,
      data: formatted,
    });
  } catch (error:any) {
    return NextResponse.json({ error: error }, { status: 400 });
  }
}
