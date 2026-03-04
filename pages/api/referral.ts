
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify auth
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  // Strategy: Use Base64 encoded User ID as the referral code
  // This avoids needing a separate database table for mapping.
  
  if (req.method === 'GET' || req.method === 'POST') {
    try {
      const userId = user.id;
      // Simple Base64 encoding
      const buffer = Buffer.from(userId);
      const base64 = buffer.toString('base64');
      // Make it URL safe just in case, though standard base64 is mostly fine for query params
      const code = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
      return res.status(200).json({ code });
    } catch (error) {
      console.error('Error generating referral:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
