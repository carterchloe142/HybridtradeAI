import { useEffect, useState } from 'react';
import AdminGuard from '../../components/AdminGuard';
import { supabase } from '../../lib/supabase';

type Deposit = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  tx_hash?: string;
  created_at: string;
  profiles: { email: string } | null;
};

export default function AdminDeposits() {
  const [rows, setRows] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  async function fetchDeposits() {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,user_id,amount,currency,status,tx_hash,created_at,
        profiles(email)
      `)
      .eq('type', 'deposit')
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    else setRows((data as any) || []);
    setLoading(false);
  }

  async function setStatus(id: string, status: 'confirmed' | 'cancelled') {
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
      setMsg(`Deposit ${status}`);
      fetchDeposits();
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  useEffect(() => {
    fetchDeposits();
  }, []);

  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Deposits</h1>
        {msg && <p className="mb-2 text-sm text-blue-600">{msg}</p>}
        {loading && <p className="text-sm">Loading…</p>}
        <div className="overflow-auto">
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-100 text-black">
                <th className="px-2 py-1 text-left">User</th>
                <th className="px-2 py-1 text-left">Amount</th>
                <th className="px-2 py-1 text-left">Currency</th>
                <th className="px-2 py-1 text-left">Tx Hash</th>
                <th className="px-2 py-1 text-left">Status</th>
                <th className="px-2 py-1 text-left">Created</th>
                <th className="px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="px-2 py-1">{d.profiles?.email || d.user_id}</td>
                  <td className="px-2 py-1">{d.amount}</td>
                  <td className="px-2 py-1 uppercase">{d.currency}</td>
                  <td className="px-2 py-1 text-xs">{d.tx_hash || '-'}</td>
                  <td className="px-2 py-1">
                    <span
                      className={`inline-block px-2 rounded text-xs ${
                        d.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : d.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="px-2 py-1">{new Date(d.created_at).toLocaleString()}</td>
                  <td className="px-2 py-1">
                    {d.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setStatus(d.id, 'confirmed')}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setStatus(d.id, 'cancelled')}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded"
                        >
                          Cancel
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
