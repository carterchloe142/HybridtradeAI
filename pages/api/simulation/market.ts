import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simulate market data that changes slightly based on time
  const now = new Date();
  const minute = now.getMinutes();
  
  // Base values
  let roi = 12.5;
  let sentiment = 75;
  let traders = 1200;

  // Add some randomness based on minute
  roi += (minute % 5) * 0.1 - 0.2;
  sentiment += (minute % 10) - 5;
  traders += (minute % 20) * 5;

  res.status(200).json({
    bestStream: { 
      name: 'High Frequency Trading', 
      roi: Number(roi.toFixed(2)) 
    },
    marketSentiment: Math.max(0, Math.min(100, sentiment)),
    topGainer: { symbol: 'BTC/USD', change: '+4.8%' },
    activeTraders: traders,
    globalMarketStatus: 'OPEN'
  });
}
