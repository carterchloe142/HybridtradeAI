import { useEffect, useState } from 'react';
import AdminGuard from '../../components/AdminGuard';
import { supabase } from '../../lib/supabase';

type Withdrawal = {
  id: string;
  user_id: string;
  type?: string;
  amount?: number;
  amount_usd?: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'rejected';
  to_address?: string;
  created_at: string;
  profiles: { email: string } | null;
};

export default function AdminWithdrawals() {
  const [rows, setRows] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  async function fetchWithdrawals() {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,user_id,type,amount,amount_usd,currency,status,to_address,created_at,
        profiles(email)
      `)
      .in('type', ['withdraw', 'withdraw_request', 'withdrawal'])
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    else setRows((data as any) || []);
    setLoading(false);
  }

  async function setStatus(id: string, status: 'confirmed' | 'rejected') {
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) return setMsg('Session lost');
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setMsg(`Withdrawal ${status}`);
      fetchWithdrawals();
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Withdrawals</h1>
        {msg && <p className="mb-2 text-sm text-blue-600">{msg}</p>}
        {loading && <p className="text-sm">Loading…</p>}
        <div className="overflow-auto">
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-100 text-black">
                <th className="px-2 py-1 text-left">User</th>
                <th className="px-2 py-1 text-left">Amount</th>
                <th className="px-2 py-1 text-left">Currency</th>
                <th className="px-2 py-1 text-left">To Address</th>
                <th className="px-2 py-1 text-left">Status</th>
                <th className="px-2 py-1 text-left">Created</th>
                <th className="px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr key={w.id} className="border-t">
                  <td className="px-2 py-1">{w.profiles?.email || w.user_id}</td>
                  <td className="px-2 py-1">{Number((w as any).amount ?? (w as any).amount_usd ?? 0)}</td>
                  <td className="px-2 py-1 uppercase">{w.currency}</td>
                  <td className="px-2 py-1 text-xs">{w.to_address ? `${w.to_address.slice(0, 8)}…${w.to_address.slice(-6)}` : '-'}</td>
                  <td className="px-2 py-1">
                    <span
                      className={`inline-block px-2 rounded text-xs ${
                        w.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : w.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="px-2 py-1">{new Date(w.created_at).toLocaleString()}</td>
                  <td className="px-2 py-1">
                    {w.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setStatus(w.id, 'confirmed')}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setStatus(w.id, 'rejected')}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminGuard>
  );
}
