import { useEffect, useState } from 'react';
import AdminGuard from '../../components/AdminGuard';
import { supabase } from '../../lib/supabase';

type KycRecord = {
  user_id: string;
  email: string;
  kyc_status: 'pending' | 'approved' | 'rejected' | null;
  kyc_level?: number | null;
  kyc_submitted_at?: string | null;
  kyc_decision_at?: string | null;
  kyc_reject_reason?: string | null;
};

export default function AdminKyc() {
  const [list, setList] = useState<KycRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [active, setActive] = useState<string | null>(null);
  const [details, setDetails] = useState<any | null>(null);
  const [files, setFiles] = useState<{ idUrl?: string; neutralUrl?: string; smileUrl?: string; leftUrl?: string; rightUrl?: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [recordLevels, setRecordLevels] = useState<Record<string, number>>({});
  const [filterStatus, setFilterStatus] = useState<'all'|'pending'|'approved'|'rejected'>('all');
  const [query, setQuery] = useState('');

  async function fetchKyc() {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) throw new Error('Session lost');
      const res = await fetch('/api/admin/kyc', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load');
      setList((json.items as any) || []);
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function viewDetails(userId: string) {
    setActive(userId);
    setDetails(null);
    setFiles(null);
    setRejectReason('');
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) throw new Error('Session lost');
      const res = await fetch(`/api/admin/kyc?userId=${encodeURIComponent(userId)}&files=1`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setFiles(json.files || null);
      setDetails(json.details || null);
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  async function setStatus(userId: string, status: 'approved' | 'rejected', level?: number) {
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) return setMsg('Session lost');
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, status, level, reason: status === 'rejected' ? rejectReason : undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setMsg(`KYC ${status}`);
      fetchKyc();
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  useEffect(() => {
    fetchKyc();
  }, []);

  return (
    <AdminGuard>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">KYC Review</h1>
        {msg && <p className="mb-2 text-sm text-blue-600">{msg}</p>}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button onClick={() => fetchKyc()} className="text-xs bg-gray-700 text-white px-2 py-1 rounded">Refresh</button>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="text-xs border rounded px-2 py-1">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search email" className="text-xs border rounded px-2 py-1" />
          <button
            onClick={async () => {
              try {
                const { data: session } = await supabase.auth.getSession();
                const token = session.session?.access_token;
                if (!token) throw new Error('Session lost');
                const res = await fetch('/api/admin/storage/kyc-init', { headers: { Authorization: `Bearer ${token}` } });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || 'Failed');
                setMsg('KYC storage ready');
              } catch (e: any) { setMsg(e.message); }
            }}
            className="text-xs bg-blue-700 text-white px-2 py-1 rounded"
          >Init Storage</button>
        </div>
        {loading && <p className="text-sm">Loading…</p>}
        <div className="overflow-auto">
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-100 text-black">
                <th className="px-2 py-1 text-left">Email</th>
                <th className="px-2 py-1 text-left">Level</th>
                <th className="px-2 py-1 text-left">Status</th>
                <th className="px-2 py-1 text-left">Submitted</th>
                <th className="px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list
                .filter(u => filterStatus === 'all' ? true : String(u.kyc_status || 'pending') === filterStatus)
                .filter(u => query ? String(u.email || '').toLowerCase().includes(query.toLowerCase()) : true)
                .map((u) => (
                <tr key={u.user_id} className="border-t">
                  <td className="px-2 py-1">{u.email}</td>
                  <td className="px-2 py-1">{(u as any).kyc_level ?? '-'}</td>
                  <td className="px-2 py-1">
                    <span
                      className={`inline-block px-2 rounded text-xs ${
                        u.kyc_status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : u.kyc_status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {u.kyc_status}
                    </span>
                  </td>
                  <td className="px-2 py-1">{u.kyc_submitted_at ? new Date(u.kyc_submitted_at).toLocaleString() : '-'}</td>
                  <td className="px-2 py-1">
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewDetails(u.user_id)}
                      className="text-xs bg-gray-600 text-white px-2 py-1 rounded"
                    >
                      View Details
                    </button>
                    {u.kyc_status === 'pending' && (
                      <>
                        <select
                          value={recordLevels[u.user_id] ?? u.kyc_level ?? 1}
                          onChange={(e) => setRecordLevels((m) => ({ ...m, [u.user_id]: Number(e.target.value) }))}
                          className="text-xs border rounded px-2 py-1"
                        >
                          {[1,2,3].map(l => <option key={l} value={l}>Level {l}</option>)}
                        </select>
                        <button
                          onClick={() => setStatus(u.user_id, 'approved', recordLevels[u.user_id] ?? u.kyc_level ?? 1)}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded"
                        >
                          Approve
                        </button>
                        <input
                          value={active === u.user_id ? rejectReason : ''}
                          onChange={(e) => { if (active === u.user_id) setRejectReason(e.target.value) }}
                          placeholder="Reason"
                          className="text-xs border rounded px-2 py-1"
                          style={{ width: 120 }}
                        />
                        <button
                          onClick={() => setStatus(u.user_id, 'rejected')}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {active && (
          <div className="mt-4 p-4 border rounded bg-white">
            <h2 className="text-lg font-semibold mb-2">KYC Details</h2>
            {details && (
              <div className="text-sm space-y-1">
                <p>Full Name: {String(details?.fullName || '')}</p>
                <p>Date of Birth: {String(details?.dob || '')}</p>
                <p>Address: {String(details?.address || '')}</p>
                <p>ID Type: {String(details?.idType || '')}</p>
                <p>ID Number: {String(details?.idNumber || '')}</p>
                <p>Level: {String(details?.level || '')}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-3 mt-3 text-sm">
              {files?.idUrl && (<a href={files.idUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">View ID</a>)}
              {files?.neutralUrl && (<a href={files.neutralUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">Neutral</a>)}
              {files?.smileUrl && (<a href={files.smileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">Smile</a>)}
              {files?.leftUrl && (<a href={files.leftUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">Left</a>)}
              {files?.rightUrl && (<a href={files.rightUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">Right</a>)}
            </div>
            {details?.livenessMetrics && (
              <div className="mt-2 text-xs">
                <p>Smile vs Neutral diff: {String(details.livenessMetrics.diff_smile_vs_neutral)}%</p>
                <p>Left vs Neutral diff: {String(details.livenessMetrics.diff_left_vs_neutral)}%</p>
                <p>Right vs Neutral diff: {String(details.livenessMetrics.diff_right_vs_neutral)}%</p>
              </div>
            )}
            <div className="mt-3 text-sm">
              {list.find((x) => x.user_id === active)?.kyc_reject_reason && (
                <p className="text-red-700">Reject Reason: {String(list.find((x) => x.user_id === active)?.kyc_reject_reason || '')}</p>
              )}
              {list.find((x) => x.user_id === active)?.kyc_decision_at && (
                <p>Decision At: {new Date(String(list.find((x) => x.user_id === active)?.kyc_decision_at)).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
