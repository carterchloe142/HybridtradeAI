import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';
import { sendEmail, TEMPLATES } from '@/src/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) return res.status(401).json({ error: 'Missing authorization token' });
  if (!supabaseServer) return res.status(500).json({ error: 'Supabase not configured' });

  // 1. Verify User
  const { data: { user }, error: userErr } = await supabaseServer.auth.getUser(token);
  if (userErr || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  try {
    // 2. Verify Admin Role
    const { data: userData, error: roleErr } = await supabaseServer
      .from('User')
      .select('role')
      .eq('id', user.id)
      .single();

    if (roleErr || !userData || userData.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { userId, action } = req.body;

    if (!userId || !action || !['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    // 3. Update User Status
    const { error: updateErr } = await supabaseServer
      .from('User')
      .update({
        kycStatus: newStatus,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateErr) throw updateErr;

    // 4. Update profiles Status (lowercase)
    const { error: profileErr } = await supabaseServer
      .from('profiles')
      .update({
        kyc_status: newStatus.toLowerCase(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (profileErr) console.warn('Profile update failed:', profileErr);

    // 5. Send Email Notification
    const { data: targetUser } = await supabaseServer.auth.admin.getUserById(userId);
    if (targetUser?.user?.email) {
       const subject = action === 'APPROVE' ? 'KYC Verification Approved' : 'KYC Verification Update';
       const html = action === 'APPROVE' 
        ? `<div style="font-family: sans-serif;">
             <h1 style="color: #22c55e;">You are Verified!</h1>
             <p>Congratulations, your KYC documents have been reviewed and approved.</p>
             <p>You now have full access to all investment features and higher withdrawal limits.</p>
             <p>Best,<br/>HybridTradeAI Admin</p>
           </div>`
        : `<div style="font-family: sans-serif;">
             <h1 style="color: #ef4444;">Verification Update</h1>
             <p>Unfortunately, your recent KYC submission could not be verified.</p>
             <p>Please check your document clarity and try again.</p>
             <p>Best,<br/>HybridTradeAI Admin</p>
           </div>`;
       
       await sendEmail(targetUser.user.email, { subject, html });
    }

    return res.status(200).json({ message: `User KYC ${newStatus.toLowerCase()} successfully` });

  } catch (err: any) {
    console.error('Admin KYC Review Error:', err);
    return res.status(500).json({ error: 'Failed to review KYC' });
  }
}
