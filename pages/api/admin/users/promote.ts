import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '../../../../lib/supabaseServer';
import { requireAdmin } from '../../../../lib/adminAuth';

const BodySchema = z.object({ userId: z.string().uuid() });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req);
  if (!admin.ok) return res.status(401).json({ error: admin.error || 'Unauthorized' });
  const parse = BodySchema.safeParse(req.body || {});
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload', issues: parse.error.issues });
  const { userId } = parse.data;

  try {
    const payload = { user_id: userId, role: 'admin', is_admin: true };
    const { data, error } = await supabaseServer
      .from('profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .maybeSingle();
    if (error) return res.status(500).json({ ok: false, error: 'Failed to promote user', details: error.message });
    return res.status(200).json({ ok: true, profile: data });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'Promotion failed' });
  }
}

