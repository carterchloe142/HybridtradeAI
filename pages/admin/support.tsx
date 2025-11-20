import { useEffect, useState } from 'react';
import AdminGuard from '../../components/AdminGuard';
import { supabase } from '../../lib/supabase';

type Ticket = {
  id: string;
  user_id: string;
  subject: string;
  status: 'open' | 'closed';
  created_at: string;
  profiles: { email: string } | null;
  replies: { id: string; body: string; is_admin: boolean; created_at: string }[];
};

export default function AdminSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [active, setActive] = useState<string | null>(null);
  const [reply, setReply] = useState('');

  async function fetchTickets() {
    setLoading(true);
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        id,user_id,subject,status,created_at,
        profiles(email),
        replies(id,body,is_admin,created_at)
      `)
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    else setTickets((data as any) || []);
    setLoading(false);
  }

  async function sendReply() {
    if (!active || !reply.trim()) return;
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) return setMsg('Session lost');
    try {
      const res = await fetch('/api/admin/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ticketId: active, body: reply }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setReply('');
      setMsg('Reply sent');
      fetchTickets();
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  async function closeTicket(id: string) {
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) return setMsg('Session lost');
    try {
      const res = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ticketId: id, status: 'closed' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setMsg('Ticket closed');
      fetchTickets();
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  useEffect(() => {
    fetchTickets();
  }, []);

  const activeTicket = tickets.find((t) => t.id === active);

  return (
    <AdminGuard>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Support Tickets</h1>
        {msg && <p className="mb-2 text-sm text-blue-600">{msg}</p>}
        {loading && <p className="text-sm">Loading…</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="overflow-auto max-h-96">
              <table className="min-w-full table-auto text-sm">
                <thead>
                  <tr className="bg-gray-100 text-black">
                    <th className="px-2 py-1 text-left">Subject</th>
                    <th className="px-2 py-1 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr
                      key={t.id}
                      className={`border-t cursor-pointer ${active === t.id ? 'bg-blue-50' : ''}`}
                      onClick={() => setActive(t.id)}
                    >
                      <td className="px-2 py-1">{t.subject}</td>
                      <td className="px-2 py-1">
                        <span
                          className={`inline-block px-2 rounded text-xs ${
                            t.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:col-span-2">
            {activeTicket ? (
              <div className="border rounded p-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-medium">{activeTicket.subject}</h2>
                  {activeTicket.status === 'open' && (
                    <button
                      onClick={() => closeTicket(activeTicket.id)}
                      className="text-xs bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Close
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {activeTicket.replies.map((r) => (
                    <div key={r.id} className={`p-2 rounded text-sm ${r.is_admin ? 'bg-blue-50' : 'bg-gray-50'}`}>
                      <div className="font-medium text-xs">{r.is_admin ? 'Admin' : activeTicket.profiles?.email}</div>
                      <div>{r.body}</div>
                      <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                {activeTicket.status === 'open' && (
                  <div className="mt-3">
                    <textarea
                      className="w-full border rounded p-2 text-sm"
                      rows={3}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Your reply…"
                    />
                    <button
                      onClick={sendReply}
                      className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Select a ticket to view details</p>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
