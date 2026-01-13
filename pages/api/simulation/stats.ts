import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Mock simulation stats
  res.status(200).json({
    best: {
      name: 'High Frequency Trading',
      avg: 14.5
    },
    worst: {
      name: 'Conservative Growth',
      avg: 3.2
    },
    activeStrategies: 12,
    totalVolume: 4500000
  });
}
