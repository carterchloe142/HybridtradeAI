import { NextApiRequest, NextApiResponse } from 'next';
import { runStreamDistribution } from '@/src/lib/profit/engine';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Security Check
  const authHeader = req.headers.authorization || '';
  const key = req.query.key as string;
  const CRON_SECRET = process.env.CRON_SECRET || 'fallback_cron_secret';

  // Allow Bearer token or query param
  if (authHeader !== `Bearer ${CRON_SECRET}` && key !== CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
      const dryRun = req.query.dryRun === 'true';
      const force = req.query.force === 'true';
      
      // We pass the current date as 'weekEnding' for the distribution cycle
      const result = await runStreamDistribution({ 
          weekEnding: new Date(),
          dryRun
      });

      return res.status(200).json(result);
  } catch (error: any) {
      console.error('Cron job failed:', error);
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
