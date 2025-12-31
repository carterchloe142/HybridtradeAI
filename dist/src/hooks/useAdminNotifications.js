"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAdminNotifications = useAdminNotifications;
exports.useUnreadCountAdmin = useUnreadCountAdmin;
const react_1 = require("react");
function useAdminNotifications(adminId) {
    const [items, setItems] = (0, react_1.useState)([]);
    const [connected, setConnected] = (0, react_1.useState)(false);
    const esRef = (0, react_1.useRef)(null);
    const lastIdKey = (0, react_1.useMemo)(() => (adminId ? `admin:notifications:lastId:${adminId}` : 'admin:notifications:lastId'), [adminId]);
    (0, react_1.useEffect)(() => {
        let mounted = true;
        const lastEventId = (() => { try {
            return localStorage.getItem(lastIdKey) || '';
        }
        catch {
            return '';
        } })();
        const url = lastEventId ? `/api/admin/notifications/stream?lastEventId=${encodeURIComponent(lastEventId)}` : `/api/admin/notifications/stream`;
        const es = new EventSource(url);
        esRef.current = es;
        es.onopen = () => { if (mounted)
            setConnected(true); };
        es.onmessage = (ev) => {
            try {
                const data = JSON.parse(ev.data);
                const id = String(data?.id || '');
                if (!id)
                    return;
                setItems((prev) => {
                    const exists = prev.some((p) => String(p.id) === id);
                    return exists ? prev.map((p) => (String(p.id) === id ? { ...p, ...data } : p)) : [data, ...prev];
                });
                try {
                    localStorage.setItem(lastEventId, id);
                }
                catch { }
            }
            catch { }
        };
        es.onerror = () => { };
        return () => { mounted = false; try {
            es.close();
        }
        catch { } };
    }, [lastIdKey, adminId]);
    async function refreshUnread() {
        try {
            const res = await fetch('/api/admin/notifications/unread-count');
            return await res.json();
        }
        catch {
            return { total: 0, unreadByType: {} };
        }
    }
    return { items, connected, refreshUnread };
}
async function useUnreadCountAdmin() {
    try {
        const res = await fetch('/api/admin/notifications/unread-count');
        const json = await res.json();
        return Number(json?.total || 0);
    }
    catch {
        return 0;
    }
}
