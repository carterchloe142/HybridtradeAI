import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Auth check
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) return res.status(401).json({ error: 'Missing authorization token' });
  if (!supabaseServer) return res.status(500).json({ error: 'Supabase not configured' });

  const { data: { user }, error: userErr } = await supabaseServer.auth.getUser(token);
  if (userErr || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  // Admin check
  const { data: profile } = await supabaseServer
    .from('profiles')
    .select('role,is_admin')
    .eq('user_id', user.id)
    .maybeSingle();

  const userRole = String(profile?.role || '').toLowerCase();
  const isAdmin = Boolean(profile?.is_admin) || userRole === 'admin';

  if (!isAdmin) return res.status(403).json({ error: 'Forbidden: Admin access required' });

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const bucketName = 'kyc-documents';
    const { data: buckets, error: listErr } = await supabaseServer.storage.listBuckets();
    
    if (listErr) throw listErr;
    
    const exists = buckets?.find(b => b.name === bucketName);
    
    if (!exists) {
      const { data, error: createErr } = await supabaseServer.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf']
      });
      if (createErr) throw createErr;
      return res.status(200).json({ message: `Bucket ${bucketName} created`, created: true });
    }

    return res.status(200).json({ message: `Bucket ${bucketName} already exists`, created: false });
  } catch (e: any) {
    console.error('KYC Init Error:', e);
    return res.status(500).json({ error: e.message });
  }
}
