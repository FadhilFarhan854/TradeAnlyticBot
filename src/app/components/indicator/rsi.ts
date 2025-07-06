import { Time } from 'lightweight-charts';

type CandleData = {
  openTime: number;
  open: string;
  close: string;
};

export function calculateRSI(data: CandleData[], period = 14): { time: Time; value: number }[] {
  const closes = data.map((d) => parseFloat(d.close));
  const rsi: { time: Time; value: number }[] = [];

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  rsi.push({
    time: Math.floor(data[period].openTime / 1000) as Time,
    value: 100 - 100 / (1 + avgGain / avgLoss),
  });

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    let gain = 0,
      loss = 0;
    if (change > 0) gain = change;
    else loss = -change;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgGain / avgLoss;
    const time = Math.floor(data[i].openTime / 1000);

    rsi.push({
      time: time as Time,
      value: 100 - 100 / (1 + rs),
    });
  }

  return rsi;
}
