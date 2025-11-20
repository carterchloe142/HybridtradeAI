import { useEffect, useState } from 'react';
import AdminGuard from '../../components/AdminGuard';
import { supabase } from '../../lib/supabase';

type Tx = {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'referral';
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'failed';
  tx_hash?: string;
  created_at: string;
  profiles: { email: string } | null;
};

export default function AdminTransactions() {
  const [rows, setRows] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  async function fetchTx() {
    setLoading(true);
    let q = supabase
      .from('transactions')
      .select(`
        id,user_id,type,amount,currency,status,tx_hash,created_at,
        profiles(email)
      `)
      .order('created_at', { ascending: false });
    if (typeFilter) q = q.eq('type', typeFilter);
    if (statusFilter) q = q.eq('status', statusFilter);
    const { data, error } = await q;
    if (error) console.error(error);
    else setRows((data as any) || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchTx();
  }, [typeFilter, statusFilter]);

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Transactions</h1>
        <div className="flex gap-3 mb-4">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All types</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="profit">Profit</option>
            <option value="referral">Referral</option>
          </select>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        {loading && <p className="text-sm">Loading…</p>}
        <div className="overflow-auto">
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-100 text-black">
                <th className="px-2 py-1 text-left">User</th>
                <th className="px-2 py-1 text-left">Type</th>
                <th className="px-2 py-1 text-left">Amount</th>
                <th className="px-2 py-1 text-left">Currency</th>
                <th className="px-2 py-1 text-left">Status</th>
                <th className="px-2 py-1 text-left">Tx Hash</th>
                <th className="px-2 py-1 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((tx) => (
                <tr key={tx.id} className="border-t">
                  <td className="px-2 py-1">{tx.profiles?.email || tx.user_id}</td>
                  <td className="px-2 py-1">{tx.type}</td>
                  <td className="px-2 py-1">{tx.amount}</td>
                  <td className="px-2 py-1 uppercase">{tx.currency}</td>
                  <td className="px-2 py-1">
                    <span
                      className={`inline-block px-2 rounded text-xs ${
                        tx.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : tx.status === 'cancelled' || tx.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-2 py-1 text-xs">{tx.tx_hash ? `${tx.tx_hash.slice(0, 8)}…${tx.tx_hash.slice(-6)}` : '-'}</td>
                  <td className="px-2 py-1">{new Date(tx.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminGuard>
  );
}
