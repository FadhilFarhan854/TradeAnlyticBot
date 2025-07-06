/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch('https://api.binance.com/api/v3/exchangeInfo');
  const data = await res.json();

  // Ambil simbol spot trading aktif
  const symbols = data.symbols
    .filter((s: any) => s.status === 'TRADING' && s.isSpotTradingAllowed)
    .map((s: any) => s.symbol);

  return NextResponse.json({ symbols });
}
