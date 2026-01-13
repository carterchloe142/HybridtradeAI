import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/src/lib/supabaseServer';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

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

  try {
    const { 
      idFileDataUrl, 
      selfieNeutralDataUrl, 
      selfieSmileDataUrl, 
      selfieLeftDataUrl, 
      selfieRightDataUrl,
      payload 
    } = req.body;

    if (!idFileDataUrl) {
      return res.status(400).json({ error: 'ID document is required' });
    }

    const uploadFile = async (dataUrl: string, path: string) => {
      // Decode Base64
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid input string');
      }
      const buffer = Buffer.from(matches[2], 'base64');
      const type = matches[1]; // e.g., image/jpeg

      const { data, error } = await supabaseServer.storage
        .from('kyc-documents')
        .upload(path, buffer, {
          contentType: type,
          upsert: true
        });

      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabaseServer.storage
        .from('kyc-documents')
        .getPublicUrl(path);
        
      return publicUrl;
    };

    const timestamp = Date.now();
    const idUrl = await uploadFile(idFileDataUrl, `${user.id}/${timestamp}_id.jpg`);
    const neutralUrl = await uploadFile(selfieNeutralDataUrl, `${user.id}/${timestamp}_neutral.jpg`);
    
    // We upload other selfie angles too if needed, but for MVP maybe just store them or skip?
    // Let's upload all for completeness
    await uploadFile(selfieSmileDataUrl, `${user.id}/${timestamp}_smile.jpg`);
    await uploadFile(selfieLeftDataUrl, `${user.id}/${timestamp}_left.jpg`);
    await uploadFile(selfieRightDataUrl, `${user.id}/${timestamp}_right.jpg`);

    // We only return the main ID and Neutral Selfie URLs for the submit step, 
    // or maybe we store them in a JSON column?
    // For now, let's return them.
    
    return res.status(200).json({ 
      documentUrl: idUrl, 
      selfieUrl: neutralUrl,
      message: 'Files uploaded successfully' 
    });

  } catch (err: any) {
    console.error('KYC Upload Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to upload documents' });
  }
}
