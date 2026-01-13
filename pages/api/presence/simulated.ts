import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Return mock presence data
  // 404 was causing console errors
  res.status(200).json({
    activeUsers: Math.floor(Math.random() * 500) + 1200, // 1200-1700
    recentTrades: [
      { pair: 'BTC/USD', type: 'buy', amount: 0.5, price: 45000, time: Date.now() },
      { pair: 'ETH/USD', type: 'sell', amount: 5.2, price: 2800, time: Date.now() - 5000 },
    ]
  });
}
