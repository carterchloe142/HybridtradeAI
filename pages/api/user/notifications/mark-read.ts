import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Invalid ids' });
  }

  // Try PascalCase table
  let { error } = await supabaseServer
    .from('Notification')
    .update({ read: true })
    .in('id', ids)
    .eq('user_id', user.id);

  // Fallback to snake_case
  if (error && (error.message.includes('relation') || error.code === '42P01')) {
    const res2 = await supabaseServer
      .from('notifications')
      .update({ read: true })
      .in('id', ids)
      .eq('user_id', user.id);
    error = res2.error;
  }

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}
