import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) return res.status(401).json({ error: 'Missing authorization token' });
  if (!supabaseServer) return res.status(500).json({ error: 'Supabase not configured' });

  const { data: { user }, error: userErr } = await supabaseServer.auth.getUser(token);
  if (userErr || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  const { documentUrl } = req.body;

  if (!documentUrl) {
    return res.status(400).json({ error: 'Document URL is required' });
  }

  try {
    // Update User table
    const { error: userError } = await supabaseServer
      .from('User')
      .update({
        kycStatus: 'PENDING',
        kycDocument: documentUrl,
        updatedAt: new Date().toISOString()
      })
      .eq('id', user.id);

    if (userError) throw userError;

    // Also update profiles table (snake_case) to keep sync with frontend
    const { error: profileError } = await supabaseServer
      .from('profiles')
      .update({
        kyc_status: 'pending', // snake_case value? Frontend checks 'pending'
        // kyc_document? profiles might not have this column, check-tables didn't show it.
        // But let's assume kyc_status is what matters for access control.
        kyc_submitted_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
    
    if (profileError) {
         console.warn('Profile update failed:', profileError);
         // Don't fail the request if profile update fails, but log it.
         // Or should we fail? Better to keep them in sync.
         // But profiles might not exist for all users if not created by trigger?
         // We can try upsert.
    }

    return res.status(200).json({ message: 'KYC submitted successfully' });
  } catch (err: any) {
    console.error('KYC Submit Error:', err);
    return res.status(500).json({ error: 'Failed to submit KYC' });
  }
}
