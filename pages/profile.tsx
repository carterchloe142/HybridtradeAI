import RequireAuth from '../components/RequireAuth';
import { useEffect, useState } from 'react';
import { getCurrentUserId, getReferralByUser } from '../lib/db';

export default function Profile() {
  const [userId, setUserId] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string>('');

  useEffect(() => {
    (async () => {
      const id = await getCurrentUserId();
      setUserId(id);
      if (id) {
        const ref = await getReferralByUser(id);
        if (ref?.code) setReferralCode(ref.code);
      }
    })();
  }, []);

  const generateReferral = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      setReferralCode(data.referralCode);
    } finally {
      setLoading(false);
    }
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const referralLink = referralCode ? `${siteUrl}/auth/register?ref=${referralCode}` : '';

  const copyLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const shareLink = async () => {
    if (!referralLink) return;
    setShareError('');
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Join HybridTradeAI', url: referralLink });
      } else {
        await navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (e: any) {
      setShareError(e?.message || 'Unable to share');
    }
  };

  return (
    <RequireAuth>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="card-neon">
          <h2 className="text-2xl font-bold neon-text">Your Profile</h2>
          <p className="mt-2 text-sm text-white/80">User ID: {userId}</p>
        </div>
        <div className="card-neon">
          <h3 className="font-semibold">Referral</h3>
          {referralCode ? (
            <div className="mt-2">
              <p className="text-sm">Code: <span className="text-neon-blue">{referralCode}</span></p>
              <p className="text-sm break-all">Link: <a className="text-neon-blue" href={referralLink}>{referralLink}</a></p>
              <div className="mt-3 flex gap-3">
                <button className="btn-neon" onClick={copyLink}>Copy Link</button>
                <button className="btn-neon" onClick={shareLink}>Share</button>
              </div>
              {copied && <p className="mt-2 text-xs text-neon-blue">Copied!</p>}
              {shareError && <p className="mt-2 text-xs text-red-400">{shareError}</p>}
            </div>
          ) : (
            <button className="btn-neon mt-3" onClick={generateReferral} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Referral Code'}
            </button>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
