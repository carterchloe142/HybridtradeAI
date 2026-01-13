import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  if (req.method === 'GET') {
    const { userId, files } = req.query;

    if (userId) {
        // Get details for specific user
        const { data: p, error: pErr } = await supabaseServer
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (pErr) return res.status(404).json({ error: 'Profile not found' });

        let fileUrls: any = {};
        if (files === '1') {
            // Generate signed URLs for KYC files if they exist
            // Assuming bucket 'kyc-documents' and path structure '{userId}/{filename}'
            const bucket = 'kyc-documents';
            const { data: list } = await supabaseServer.storage.from(bucket).list(String(userId));
            
            if (list) {
                for (const f of list) {
                    const { data: signed } = await supabaseServer.storage.from(bucket).createSignedUrl(`${userId}/${f.name}`, 3600);
                    if (signed) {
                        if (f.name.includes('id')) fileUrls.idUrl = signed.signedUrl;
                        else if (f.name.includes('neutral')) fileUrls.neutralUrl = signed.signedUrl;
                        else if (f.name.includes('smile')) fileUrls.smileUrl = signed.signedUrl;
                        else if (f.name.includes('left')) fileUrls.leftUrl = signed.signedUrl;
                        else if (f.name.includes('right')) fileUrls.rightUrl = signed.signedUrl;
                    }
                }
            }
        }

        return res.status(200).json({ details: p, files: fileUrls });
    } else {
        // List all
        const { data: list, error: listErr } = await supabaseServer
            .from('profiles')
            .select('*')
            .order('kyc_submitted_at', { ascending: false, nullsLast: true });
        
        if (listErr) return res.status(500).json({ error: listErr.message });
        
        return res.status(200).json({ items: list });
    }
  } else if (req.method === 'PATCH') {
      const { userId, status, level, reason } = req.body;
      if (!userId || !status) return res.status(400).json({ error: 'Missing userId or status' });

      // Map frontend status to DB Enum (VERIFIED, REJECTED, PENDING)
      const statusMap: Record<string, string> = {
          'approved': 'VERIFIED',
          'verified': 'VERIFIED',
          'rejected': 'REJECTED',
          'pending': 'PENDING'
      };
      const dbStatus = statusMap[String(status).toLowerCase()] || String(status).toUpperCase();

      const updateData: any = { 
          kyc_status: dbStatus,
          kyc_level: level || 1
      };
      
      if (dbStatus === 'REJECTED' && reason) {
          updateData.kyc_reject_reason = reason;
      }
      if (dbStatus === 'VERIFIED' || dbStatus === 'REJECTED') {
          updateData.kyc_decision_at = new Date().toISOString();
      }

      const { error: updateErr } = await supabaseServer
        .from('profiles')
        .update(updateData)
        .eq('user_id', userId);
        
      if (updateErr) return res.status(500).json({ error: updateErr.message });

      // Update User table as well (Sync)
      const userUpdate: any = {
        kycStatus: dbStatus,
        kycLevel: level || 1,
        kycDecisionAt: new Date().toISOString()
      };
      if (dbStatus === 'REJECTED' && reason) userUpdate.kycRejectReason = reason;

      const { error: userUpdateErr } = await supabaseServer
          .from('User')
          .update(userUpdate)
          .eq('id', userId);
      
      if (userUpdateErr) console.warn('User table update failed:', userUpdateErr);

      return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
