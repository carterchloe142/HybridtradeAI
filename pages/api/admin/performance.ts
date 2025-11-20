import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../lib/supabaseServer';
import { z } from 'zod';
import { requireAdmin } from '../../../lib/adminAuth';

const RoiSchema = z.record(z.number().nonnegative());
const BodySchema = z.object({
  weekEnding: z.string().refine(s => !isNaN(Date.parse(s)), { message: 'Invalid date' }),
  streamRois: RoiSchema
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req);
  if (!admin.ok) return res.status(401).json({ error: admin.error || 'Unauthorized' });
  const parse = BodySchema.safeParse(req.body || {});
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload', issues: parse.error.issues });
  const { weekEnding, streamRois } = parse.data;

  try {
    const payload = { week_ending: weekEnding, stream_rois: streamRois };
    // Try upsert by week_ending if unique constraint exists; otherwise fallback to insert
    let result: any = null;
    try {
      const { data, error } = await supabaseServer
        .from('performance')
        .upsert(payload, { onConflict: 'week_ending' })
        .select()
        .maybeSingle();
      if (error) throw error;
      result = data;
    } catch (e: any) {
      const { data, error } = await supabaseServer
        .from('performance')
        .insert(payload)
        .select()
        .maybeSingle();
      if (error) return res.status(500).json({ error: 'Failed to insert performance', details: error.message });
      result = data;
    }

    return res.status(200).json({ ok: true, performance: result });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || 'Failed to upsert performance' });
  }
}
