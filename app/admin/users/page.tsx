'use client';

export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import AdminGuard from '@/components/AdminGuard';
import AdminNavbar from '@/components/AdminNavbar';
import AdminSidebar from '@/components/AdminSidebar';
import { supabase } from '@/lib/supabase';

type AdminProfile = { user_id: string; role?: string | null; is_admin?: boolean | null };
type User = { id: string; email: string; name?: string; createdAt?: string; role?: string };

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [hideTestUsers, setHideTestUsers] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [promoteUserId, setPromoteUserId] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [loadingPromote, setLoadingPromote] = useState(false);

  useEffect(() => {
    fetchAdmins();
    fetchUsers();
  }, [hideTestUsers]); // Refetch users when filter changes

  async function fetchAdmins() {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('user_id,role,is_admin')
          .or('is_admin.eq.true,role.eq.admin');
        setAdmins((data as AdminProfile[]) || []);
      } catch (e) { }
  }

  async function fetchUsers() {
      setLoadingUsers(true);
      try {
          const { data: session } = await supabase.auth.getSession();
          const token = session.session?.access_token;
          if (!token) return;

          // Fetch users via API
          const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
          const json = await res.json();
          if (res.ok && json.items) {
              let allUsers = json.items as User[];
              if (hideTestUsers) {
                  allUsers = allUsers.filter(u => !u.email?.endsWith('@example.com'));
              }
              setUsers(allUsers);
              setTotalUsers(json.count || allUsers.length);
          }
      } catch (e) { console.error(e); }
      setLoadingUsers(false);
  }

  async function inviteAdmin() {
    setLoadingInvite(true);
    setMsg(null);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Missing session token');
      const res = await fetch('/api/admin/users/invite-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail.trim() })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Invite failed');
      setMsg(`Invited ${json.invited?.email || inviteEmail} and promoted to admin.`);
      setInviteEmail('');
      fetchAdmins(); // Refresh list
    } catch (e: any) {
      setMsg(e?.message || 'Error inviting admin');
    } finally {
      setLoadingInvite(false);
    }
  }

  async function promoteAdmin() {
    setLoadingPromote(true);
    setMsg(null);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Missing session token');
      const res = await fetch('/api/admin/users/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: promoteUserId.trim() })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Promotion failed');
      setMsg(`Promoted user ${promoteUserId} to admin.`);
      setPromoteUserId('');
      fetchAdmins(); // Refresh list
    } catch (e: any) {
      setMsg(e?.message || 'Error promoting admin');
    } finally {
      setLoadingPromote(false);
    }
  }

  return (
    <AdminGuard>
      <div className="grid md:grid-cols-[260px,1fr] gap-6 p-6">
        <div>
          <AdminSidebar />
        </div>
        <div className="space-y-6">
          <AdminNavbar />

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-neon">
              <h3 className="font-semibold text-foreground">Invite Admin by Email</h3>
              <p className="mt-2 text-sm text-muted-foreground">Sends an invite email and auto-promotes the user.</p>
              <div className="mt-3 flex gap-2">
                <input className="input-neon flex-1" placeholder="admin@example.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                <button className="btn-neon" disabled={loadingInvite || !inviteEmail} onClick={inviteAdmin}>{loadingInvite ? 'Inviting...' : 'Invite'}</button>
              </div>
            </div>

            <div className="card-neon">
              <h3 className="font-semibold text-foreground">Promote Existing User</h3>
              <p className="mt-2 text-sm text-muted-foreground">Enter a user ID from Supabase Auth → Users.</p>
              <div className="mt-3 flex gap-2">
                <input className="input-neon flex-1" placeholder="UUID user ID" value={promoteUserId} onChange={e => setPromoteUserId(e.target.value)} />
                <button className="btn-neon" disabled={loadingPromote || !promoteUserId} onClick={promoteAdmin}>{loadingPromote ? 'Promoting...' : 'Promote'}</button>
              </div>
            </div>
          </div>

          <div className="card-neon">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground">Current Admins</h3>
                <div className="text-sm text-muted-foreground">Total: {admins.length}</div>
            </div>
            
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-4">User ID</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2">is_admin</th>
                  </tr>
                </thead>
                <tbody>
                  {admins
                    .filter(a => !a.role?.includes('example.com'))
                    .map(a => (
                    <tr key={a.user_id} className="border-t border-border">
                      <td className="py-2 pr-4 font-mono text-xs text-foreground">{a.user_id}</td>
                      <td className="py-2 pr-4 text-foreground">{a.role || '—'}</td>
                      <td className="py-2 text-foreground">{a.is_admin ? 'true' : 'false'}</td>
                    </tr>
                  ))}
                  {admins.length === 0 && (
                    <tr>
                      <td className="py-3 text-muted-foreground" colSpan={3}>No admins found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card-neon mt-6">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-foreground">Registered Users</h3>
                <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input 
                            type="checkbox" 
                            className="rounded border-border accent-primary" 
                            checked={hideTestUsers} 
                            onChange={(e) => setHideTestUsers(e.target.checked)}
                        />
                        Hide Test Users (@example.com)
                    </label>
                    <button onClick={fetchUsers} className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded">Refresh</button>
                </div>
             </div>
             
             <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-muted-foreground border-b border-border">
                            <th className="py-2 pr-4">Email</th>
                            <th className="py-2 pr-4">Name</th>
                            <th className="py-2 pr-4">Joined</th>
                            <th className="py-2">ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loadingUsers ? (
                            <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">Loading users...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">No users found matching criteria.</td></tr>
                        ) : (
                            users.map(u => (
                                <tr key={u.id} className="border-b border-border/50 hover:bg-muted/5">
                                    <td className="py-3 pr-4 font-medium text-foreground">{u.email}</td>
                                    <td className="py-3 pr-4 text-muted-foreground">{u.name || '-'}</td>
                                    <td className="py-3 pr-4 text-muted-foreground">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                                    <td className="py-3 font-mono text-xs text-muted-foreground/50">{u.id}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
             </div>
             <div className="mt-2 text-xs text-muted-foreground text-right">
                Showing {users.length} {hideTestUsers ? 'real' : 'total'} users
             </div>
          </div>

          {msg && <p className="text-sm">{msg}</p>}
        </div>
      </div>
    </AdminGuard>
  );
}
