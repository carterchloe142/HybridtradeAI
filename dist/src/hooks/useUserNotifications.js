"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUserNotifications = useUserNotifications;
exports.useUnreadCount = useUnreadCount;
const react_1 = require("react");
const supabase_1 = require("../../lib/supabase");
function useUserNotifications(userId) {
    const [items, setItems] = (0, react_1.useState)([]);
    const [connected, setConnected] = (0, react_1.useState)(false);
    const [authed, setAuthed] = (0, react_1.useState)(false);
    const bcRef = (0, react_1.useRef)(null);
    const leaderRef = (0, react_1.useRef)(false);
    const esRef = (0, react_1.useRef)(null);
    const lastIdKey = (0, react_1.useMemo)(() => (userId ? `notifications:lastId:${userId}` : 'notifications:lastId'), [userId]);
    // Track Supabase auth state; only start polling/stream when authenticated
    (0, react_1.useEffect)(() => {
        let mounted = true;
        supabase_1.supabase.auth.getSession().then((res) => { if (mounted)
            setAuthed(!!res?.data?.session); }).catch(() => { });
        const { data: sub } = supabase_1.supabase.auth.onAuthStateChange((_event, session) => { if (mounted)
            setAuthed(!!session); });
        return () => { try {
            sub?.subscription?.unsubscribe();
        }
        catch { } ; mounted = false; };
    }, []);
    (0, react_1.useEffect)(() => {
        if (!authed) {
            setConnected(false);
            return;
        }
        let mounted = true;
        const bc = new BroadcastChannel('notifications:user');
        bcRef.current = bc;
        function onEvent(data) {
            const id = String(data?.id || '');
            if (!id)
                return;
            setItems((prev) => {
                const exists = prev.some((p) => String(p.id) === id);
                const next = exists ? prev.map((p) => (String(p.id) === id ? { ...p, ...data } : p)) : [data, ...prev];
                return next;
            });
            try {
                localStorage.setItem(lastIdKey, id);
            }
            catch { }
        }
        async function becomeLeader() {
            if (leaderRef.current)
                return;
            if (!mounted)
                return;
            leaderRef.current = true;
            const channel = bcRef.current ?? new BroadcastChannel('notifications:user');
            bcRef.current = channel;
            try {
                channel.postMessage({ t: 'leader' });
            }
            catch { }
            const lastEventId = (() => { try {
                return localStorage.getItem(lastIdKey) || '';
            }
            catch {
                return '';
            } })();
            const { data: sessionRes } = await supabase_1.supabase.auth.getSession();
            const token = sessionRes?.session?.access_token || '';
            const qp = new URLSearchParams();
            if (lastEventId)
                qp.set('lastEventId', lastEventId);
            if (token)
                qp.set('token', token);
            const url = `/api/user/notifications/stream${qp.toString() ? `?${qp.toString()}` : ''}`;
            const es = new EventSource(url);
            esRef.current = es;
            es.onopen = () => { if (mounted)
                setConnected(true); };
            es.onmessage = (ev) => {
                try {
                    const data = JSON.parse(ev.data);
                    onEvent(data);
                    bc.postMessage({ t: 'event', data });
                }
                catch { }
            };
            es.onerror = () => { };
        }
        let heardLeader = false;
        bc.onmessage = (ev) => {
            const msg = ev.data || {};
            if (!mounted)
                return;
            if (msg.t === 'leader') {
                heardLeader = true;
            }
            if (msg.t === 'event') {
                onEvent(msg.data);
            }
        };
        try {
            bc.postMessage({ t: 'who' });
        }
        catch { }
        const leaderTimeout = setTimeout(() => { if (!heardLeader)
            becomeLeader(); }, 400);
        async function maybeSynthKyc() {
            try {
                const { data: sessionRes } = await supabase_1.supabase.auth.getSession();
                const uid = String(sessionRes?.session?.user?.id || '');
                if (!uid)
                    return;
                const { data: prof } = await supabase_1.supabase
                    .from('profiles')
                    .select('kyc_status')
                    .eq('user_id', uid)
                    .maybeSingle();
                const k = String(prof?.kyc_status || '');
                const lastK = (() => { try {
                    return localStorage.getItem('notifications:lastKyc') || '';
                }
                catch {
                    return '';
                } })();
                if (k && k !== lastK) {
                    const synthetic = {
                        id: `synthetic:kyc:${Date.now()}`,
                        type: 'kyc_status',
                        title: k === 'approved' ? 'KYC Approved' : k === 'rejected' ? 'KYC Rejected' : 'KYC Updated',
                        message: k === 'approved' ? 'Your identity verification has been approved.' : k === 'rejected' ? 'Your KYC was rejected.' : 'Your KYC status was updated.',
                        read: false,
                        createdAt: new Date().toISOString(),
                    };
                    setItems((prev) => [synthetic, ...prev]);
                    try {
                        localStorage.setItem('notifications:lastKyc', k);
                    }
                    catch { }
                }
            }
            catch { }
        }
        ;
        (async () => {
            try {
                const { data: sessionRes } = await supabase_1.supabase.auth.getSession();
                const token = sessionRes?.session?.access_token || '';
                const res = await fetch('/api/user/notifications?limit=50&unreadOnly=false', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
                const json = await res.json();
                if (!mounted)
                    return;
                const list = Array.isArray(json?.items) ? json.items : [];
                setItems(list);
                await maybeSynthKyc();
            }
            catch { }
        })();
        const poll = setInterval(async () => {
            try {
                const { data: sessionRes } = await supabase_1.supabase.auth.getSession();
                const token = sessionRes?.session?.access_token || '';
                const res = await fetch('/api/user/notifications?limit=50&unreadOnly=false', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
                const json = await res.json();
                if (!mounted)
                    return;
                const list = Array.isArray(json?.items) ? json.items : [];
                setItems(list);
                await maybeSynthKyc();
            }
            catch { }
        }, 10000);
        return () => {
            mounted = false;
            try {
                bc.close();
            }
            catch { }
            try {
                esRef.current?.close();
            }
            catch { }
            try {
                clearTimeout(leaderTimeout);
            }
            catch { }
            try {
                clearInterval(poll);
            }
            catch { }
        };
    }, [authed, lastIdKey, userId]);
    const unreadCount = (0, react_1.useMemo)(() => items.filter((i) => !i.read).length, [items]);
    async function markRead(ids) {
        if (!ids?.length)
            return;
        const prev = items;
        setItems((curr) => curr.map((c) => (ids.includes(String(c.id)) ? { ...c, read: true } : c)));
        try {
            const { data: sessionRes } = await supabase_1.supabase.auth.getSession();
            const token = sessionRes?.session?.access_token || '';
            const headers = { 'Content-Type': 'application/json' };
            if (token)
                headers.Authorization = `Bearer ${token}`;
            const res = await fetch('/api/user/notifications/mark-read', { method: 'POST', headers, body: JSON.stringify({ ids }) });
            if (!res.ok)
                throw new Error('failed');
        }
        catch {
            setItems(prev);
        }
    }
    return { items, connected, unreadCount, markRead };
}
function useUnreadCount() {
    const { unreadCount } = useUserNotifications();
    return unreadCount;
}
