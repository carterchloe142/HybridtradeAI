import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

  const limit = Number(req.query.limit) || 50;
  const unreadOnly = req.query.unreadOnly === 'true';

  let query = supabaseServer
    .from('Notification')
    .select('*')
    .eq('userId', user.id)
    .order('createdAt', { ascending: false })
    .limit(limit);

  if (unreadOnly) {
    query = query.eq('read', false);
  }

  // Handle table name fallback
  let { data, error } = await query;

  if (error && (error.message.includes('relation') || error.code === '42P01' || error.message.includes('column'))) {
    // Fallback to snake_case table
    let query2 = supabaseServer
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query2 = query2.eq('read', false);
    }
    const res2 = await query2;
    data = res2.data;
    error = res2.error;
  }

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ items: data || [] });
}
