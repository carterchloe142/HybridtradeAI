import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';
import { sendEmail, TEMPLATES } from '@/src/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // --- Auth Check (Admin) ---
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) return res.status(401).json({ error: 'Missing authorization token' });
  if (!supabaseServer) return res.status(500).json({ error: 'Supabase not configured' });

  const { data: { user }, error: userErr } = await supabaseServer.auth.getUser(token);
  if (userErr || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  // Verify Admin Role (Try both tables)
  let isAdmin = false;
  
  // 1. Try profiles
  const { data: p1 } = await supabaseServer.from('profiles').select('role,is_admin').eq('user_id', user.id).maybeSingle();
  if (p1) {
      const r = String(p1.role || '').toLowerCase();
      isAdmin = Boolean(p1.is_admin) || r === 'admin';
  } else {
      // 2. Try User
      const { data: p2 } = await supabaseServer.from('User').select('role').eq('id', user.id).maybeSingle();
      if (p2) {
          const r = String(p2.role || '').toLowerCase();
          isAdmin = r === 'admin';
      }
  }

  if (!isAdmin) return res.status(403).json({ error: 'Forbidden: Admin access required' });
  // --------------------------

  if (req.method === 'GET') {
    const { userId, files } = req.query;

    if (userId) {
        // Latest application for this user
        const { data: app, error: appErr } = await supabaseServer
          .from('kyc_applications')
          .select('*')
          .eq('user_id', String(userId))
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (appErr) return res.status(500).json({ error: appErr.message });
        if (!app) return res.status(404).json({ error: 'No KYC application found for this user yet' });

        const { data: uData } = await supabaseServer.from('User').select('id,email').eq('id', String(userId)).maybeSingle();
        const { data: pData } = await supabaseServer.from('profiles').select('email').eq('user_id', String(userId)).maybeSingle();

        const details = {
          user_id: String(userId),
          email: uData?.email || pData?.email || '',
          kyc_status: String(app.status || 'pending'),
          kyc_level: app.level || 1,
          kyc_submitted_at: app.submitted_at,
          kyc_reject_reason: app.reject_reason || null,
          ...(app.details || {}),
        };

        const fileUrls: any = {};
        if (files === '1') {
          const bucket = 'kyc-documents';
          const f = (app.files || {}) as any;
          const resolveUrl = (path?: string, url?: string) => {
            if (url) return url;
            if (!path) return undefined;
            const { data: publicUrlData } = supabaseServer.storage.from(bucket).getPublicUrl(path);
            return publicUrlData.publicUrl;
          };

          fileUrls.idUrl = resolveUrl(f.idPath, f.idUrl);
          fileUrls.neutralUrl = resolveUrl(f.neutralPath, f.neutralUrl);
          fileUrls.smileUrl = resolveUrl(f.smilePath, f.smileUrl);
          fileUrls.leftUrl = resolveUrl(f.leftPath, f.leftUrl);
          fileUrls.rightUrl = resolveUrl(f.rightPath, f.rightUrl);
        }

        return res.status(200).json({ details, files: fileUrls, applicationId: app.id });

    } else {
        const { data: apps, error: appsErr } = await supabaseServer
          .from('kyc_applications')
          .select('id,user_id,status,level,submitted_at,created_at,decided_at,reject_reason')
          .order('created_at', { ascending: false })
          .limit(500);

        if (appsErr) return res.status(500).json({ error: appsErr.message });

        const latestByUser = new Map<string, any>();
        for (const a of apps || []) {
          const uid = String((a as any).user_id);
          if (!latestByUser.has(uid)) latestByUser.set(uid, a);
        }

        const userIds = Array.from(latestByUser.keys());
        const { data: users } = await supabaseServer.from('User').select('id,email').in('id', userIds);
        const { data: profiles } = await supabaseServer.from('profiles').select('user_id,email').in('user_id', userIds as any);

        const emailById = new Map<string, string>();
        (users || []).forEach((u: any) => emailById.set(String(u.id), String(u.email || '')));
        (profiles || []).forEach((p: any) => {
          const k = String(p.user_id);
          if (!emailById.get(k)) emailById.set(k, String(p.email || ''));
        });

        const items = userIds.map((uid) => {
          const a = latestByUser.get(uid);
          return {
            application_id: a.id,
            user_id: uid,
            email: emailById.get(uid) || '',
            kyc_status: String(a.status || 'pending'),
            kyc_level: a.level || 1,
            kyc_submitted_at: a.submitted_at || a.created_at,
            kyc_decision_at: a.decided_at || null,
            kyc_reject_reason: a.reject_reason || null,
          };
        });

        return res.status(200).json({ items });
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
      const frontendStatus = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending';

      const now = new Date().toISOString();

      const { data: app } = await supabaseServer
        .from('kyc_applications')
        .select('id')
        .eq('user_id', String(userId))
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!app?.id) return res.status(404).json({ error: 'No KYC application found to update' });

      const { error: appUpdateErr } = await supabaseServer
        .from('kyc_applications')
        .update({
          status: frontendStatus,
          level: level || 1,
          reject_reason: frontendStatus === 'rejected' ? (reason || null) : null,
          decided_at: now,
        })
        .eq('id', app.id);

      if (appUpdateErr) return res.status(500).json({ error: appUpdateErr.message });

      await supabaseServer
        .from('profiles')
        .update({
          kyc_status: frontendStatus,
          kyc_level: level || 1,
        })
        .eq('user_id', String(userId));

      await supabaseServer
        .from('User')
        .update({
          kycStatus: dbStatus,
          updatedAt: now,
        })
        .eq('id', String(userId));

      // Send Email
      try {
          const { data: targetUser } = await supabaseServer.auth.admin.getUserById(userId);
          if (targetUser?.user?.email) {
             const subject = status === 'approved' ? 'KYC Verification Approved' : 'KYC Verification Update';
             const html = status === 'approved' 
              ? `<div style="font-family: sans-serif;">
                   <h1 style="color: #22c55e;">You are Verified!</h1>
                   <p>Congratulations, your KYC documents have been reviewed and approved.</p>
                   <p>You now have full access to all investment features.</p>
                 </div>`
             : `<div style="font-family: sans-serif;">
                  <h1 style="color: #ef4444;">Verification Update</h1>
                  <p>Unfortunately, your recent KYC submission could not be verified.</p>
                  <p>Reason: <strong>${reason || 'Document clarity issues'}</strong></p>
                  <p>Please try again.</p>
                 </div>`;
             
             await sendEmail(targetUser.user.email, { subject, html });
          }
      } catch (e) { console.error('Email send failed', e); }

      return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
