import type { NextApiRequest, NextApiResponse } from 'next';
import { runProfitDistribution } from '../../../backend/profit-distribution';
import { requireAdmin } from '../../../lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req);
  if (!admin.ok) return res.status(401).json({ error: admin.error || 'Unauthorized' });
  const dryRun = String(req.query.dryRun || req.body?.dryRun || '').toLowerCase() === 'true';
  try {
    const result = await runProfitDistribution({ dryRun });
    if (!result.ok) return res.status(500).json(result);
    return res.status(200).json({ ...result, dryRun });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || 'Distribution failed' });
  }
}
