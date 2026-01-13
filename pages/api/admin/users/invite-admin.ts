import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // --- Auth Check (Admin) ---
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) return res.status(401).json({ error: 'Missing authorization token' });
  if (!supabaseServer) return res.status(500).json({ error: 'Supabase not configured' });

  const { data: { user }, error: userErr } = await supabaseServer.auth.getUser(token);
  if (userErr || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  const { data: profile } = await supabaseServer
    .from('profiles')
    .select('role,is_admin')
    .eq('user_id', user.id)
    .maybeSingle();

  const userRole = String(profile?.role || '').toLowerCase();
  const isAdmin = Boolean(profile?.is_admin) || userRole === 'admin';

  if (!isAdmin) return res.status(403).json({ error: 'Forbidden: Admin access required' });
  // --------------------------

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });

  try {
      // Invite user
      const { data: invited, error: inviteErr } = await supabaseServer.auth.admin.inviteUserByEmail(email);
      
      if (inviteErr) throw inviteErr;
      if (!invited.user) throw new Error('Failed to create user invite');

      const newUserId = invited.user.id;

      // Promote to admin immediately
      // Check if profile exists (it might be created by a trigger)
      const { data: p } = await supabaseServer.from('profiles').select('*').eq('user_id', newUserId).maybeSingle();

      if (p) {
          await supabaseServer.from('profiles').update({ is_admin: true, role: 'admin' }).eq('user_id', newUserId);
      } else {
          // Create profile if missing
          await supabaseServer.from('profiles').insert({ 
              user_id: newUserId, 
              email: email,
              is_admin: true, 
              role: 'admin' 
          });
      }

      return res.status(200).json({ success: true, invited: invited.user });

  } catch (error: any) {
      console.error('Invite error:', error);
      return res.status(500).json({ error: error.message });
  }
}
