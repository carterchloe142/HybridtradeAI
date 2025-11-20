import { useEffect, useState } from 'react';
import AdminGuard from '../../components/AdminGuard';

type Reserve = {
  currency: string;
  hotWallet: number;
  coldWallet: number;
  emergencyFund: number;
  updatedAt: string;
};

export default function AdminProof() {
  const [reserves, setReserves] = useState<Reserve[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  async function fetchReserves() {
    setLoading(true);
    try {
      const res = await fetch('/api/transparency');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      const arr = Array.isArray(json.reserves) ? json.reserves : [];
      setReserves(arr);
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReserves();
  }, []);

  return (
    <AdminGuard>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Proof of Reserves</h1>
        {msg && <p className="mb-2 text-sm text-red-600">{msg}</p>}
        {loading && <p className="text-sm">Loading…</p>}
        <div className="overflow-auto">
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-100 text-black">
                <th className="px-2 py-1 text-left">Currency</th>
                <th className="px-2 py-1 text-left">Hot Wallet</th>
                <th className="px-2 py-1 text-left">Cold Wallet</th>
                <th className="px-2 py-1 text-left">Emergency Fund</th>
                <th className="px-2 py-1 text-left">Total</th>
                <th className="px-2 py-1 text-left">Updated</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(reserves) && reserves.map((r) => {
                const total = r.hotWallet + r.coldWallet;
                return (
                  <tr key={r.currency} className="border-t">
                    <td className="px-2 py-1 uppercase">{r.currency}</td>
                    <td className="px-2 py-1">{r.hotWallet.toFixed(4)}</td>
                    <td className="px-2 py-1">{r.coldWallet.toFixed(4)}</td>
                    <td className="px-2 py-1">{r.emergencyFund.toFixed(4)}</td>
                    <td className="px-2 py-1 font-medium">{total.toFixed(4)}</td>
                    <td className="px-2 py-1">{new Date(r.updatedAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button
          onClick={fetchReserves}
          className="mt-4 bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          Refresh
        </button>
      </div>
    </AdminGuard>
  );
}
