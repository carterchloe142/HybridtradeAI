module.exports = [
"[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@supabase/supabase-js", () => require("@supabase/supabase-js"));

module.exports = mod;
}),
"[project]/Documents/trae_projects/HYBRID TRADE AI/lib/supabase.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, cjs)");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://wdlcttgfwoejqynlylpv.supabase.co") || process.env.SUPABASE_URL;
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbGN0dGdmd29lanF5bmx5bHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODE0MzAsImV4cCI6MjA3ODQ1NzQzMH0.UZaY0iYoVRS5MioS5Clg6y_CVNdgzm-3OdB_cwWuB8E") || process.env.SUPABASE_ANON_KEY;
function makeStub() {
    const noop = async ()=>({
            data: null,
            error: new Error('Supabase not configured')
        });
    const auth = {
        getSession: async ()=>({
                data: {
                    session: null
                }
            }),
        onAuthStateChange: ()=>({
                data: {
                    subscription: {
                        unsubscribe: ()=>{}
                    }
                }
            }),
        signUp: async ()=>({
                data: null,
                error: new Error('Supabase not configured')
            }),
        signInWithPassword: async ()=>({
                data: null,
                error: new Error('Supabase not configured')
            })
    };
    const query = {
        select: ()=>({
                eq: ()=>({
                        limit: ()=>({
                                maybeSingle: noop
                            })
                    }),
                maybeSingle: noop
            }),
        upsert: ()=>({
                select: noop
            }),
        eq: ()=>({
                select: noop
            })
    };
    return {
        auth,
        from: ()=>query
    };
}
const supabase = ("TURBOPACK compile-time truthy", 1) ? (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__cjs$29$__["createClient"])(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true
    }
}) : "TURBOPACK unreachable";
}),
"[project]/Documents/trae_projects/HYBRID TRADE AI/components/AdminGuard.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminGuard
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/HYBRID TRADE AI/lib/supabase.ts [ssr] (ecmascript)");
;
;
;
function AdminGuard({ children }) {
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('loading');
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        let mounted = true;
        async function check() {
            const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
            const user = data.session?.user;
            if (!user) {
                if (mounted) setStatus('noauth');
                return;
            }
            const { data: profile } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["supabase"].from('profiles').select('role,is_admin').eq('user_id', user.id).maybeSingle();
            const p = profile;
            const isAdmin = Boolean(p?.is_admin) || String(p?.role || '').toLowerCase() === 'admin';
            if (mounted) setStatus(isAdmin ? 'ok' : 'forbidden');
        }
        check();
        return ()=>{
            mounted = false;
        };
    }, []);
    if (status === 'loading') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "p-6",
        children: "Checking permissions…"
    }, void 0, false, {
        fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/components/AdminGuard.tsx",
        lineNumber: 31,
        columnNumber: 36
    }, this);
    if (status === 'noauth') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "p-6",
        children: "Sign in required."
    }, void 0, false, {
        fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/components/AdminGuard.tsx",
        lineNumber: 32,
        columnNumber: 35
    }, this);
    if (status === 'forbidden') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "p-6",
        children: "Not authorized."
    }, void 0, false, {
        fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/components/AdminGuard.tsx",
        lineNumber: 33,
        columnNumber: 38
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
}),
"[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminWithdrawals
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$components$2f$AdminGuard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/HYBRID TRADE AI/components/AdminGuard.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/HYBRID TRADE AI/lib/supabase.ts [ssr] (ecmascript)");
;
;
;
;
function AdminWithdrawals() {
    const [rows, setRows] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(true);
    const [msg, setMsg] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    async function fetchWithdrawals() {
        setLoading(true);
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["supabase"].from('transactions').select(`
        id,user_id,amount,currency,status,to_address,created_at,
        profiles(email)
      `).eq('type', 'withdrawal').order('created_at', {
            ascending: false
        });
        if (error) console.error(error);
        else setRows(data || []);
        setLoading(false);
    }
    async function setStatus(id, status) {
        const { data: session } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
        const token = session.session?.access_token;
        if (!token) return setMsg('Session lost');
        try {
            const res = await fetch('/api/admin/transactions', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    id,
                    status
                })
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed');
            setMsg(`Withdrawal ${status}`);
            fetchWithdrawals();
        } catch (e) {
            setMsg(e.message);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        fetchWithdrawals();
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$components$2f$AdminGuard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "max-w-6xl mx-auto p-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-semibold mb-4",
                    children: "Withdrawals"
                }, void 0, false, {
                    fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                    lineNumber: 62,
                    columnNumber: 9
                }, this),
                msg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                    className: "mb-2 text-sm text-blue-600",
                    children: msg
                }, void 0, false, {
                    fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                    lineNumber: 63,
                    columnNumber: 17
                }, this),
                loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                    className: "text-sm",
                    children: "Loading…"
                }, void 0, false, {
                    fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                    lineNumber: 64,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "overflow-auto",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("table", {
                        className: "min-w-full table-auto text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("thead", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("tr", {
                                    className: "bg-gray-100 text-black",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                            className: "px-2 py-1 text-left",
                                            children: "User"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                            lineNumber: 69,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                            className: "px-2 py-1 text-left",
                                            children: "Amount"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                            lineNumber: 70,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                            className: "px-2 py-1 text-left",
                                            children: "Currency"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                            lineNumber: 71,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                            className: "px-2 py-1 text-left",
                                            children: "To Address"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                            lineNumber: 72,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                            className: "px-2 py-1 text-left",
                                            children: "Status"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                            lineNumber: 73,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                            className: "px-2 py-1 text-left",
                                            children: "Created"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                            lineNumber: 74,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                            className: "px-2 py-1",
                                            children: "Actions"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                            lineNumber: 75,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                    lineNumber: 68,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                lineNumber: 67,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("tbody", {
                                children: rows.map((w)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("tr", {
                                        className: "border-t",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                className: "px-2 py-1",
                                                children: w.profiles?.email || w.user_id
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                                lineNumber: 81,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                className: "px-2 py-1",
                                                children: w.amount
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                                lineNumber: 82,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                className: "px-2 py-1 uppercase",
                                                children: w.currency
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                                lineNumber: 83,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                className: "px-2 py-1 text-xs",
                                                children: w.to_address ? `${w.to_address.slice(0, 8)}…${w.to_address.slice(-6)}` : '-'
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                                lineNumber: 84,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                className: "px-2 py-1",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                    className: `inline-block px-2 rounded text-xs ${w.status === 'confirmed' ? 'bg-green-100 text-green-800' : w.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`,
                                                    children: w.status
                                                }, void 0, false, {
                                                    fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                                    lineNumber: 86,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                                lineNumber: 85,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                className: "px-2 py-1",
                                                children: new Date(w.created_at).toLocaleString()
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                                lineNumber: 98,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                className: "px-2 py-1",
                                                children: w.status === 'pending' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: "flex gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setStatus(w.id, 'confirmed'),
                                                            className: "text-xs bg-green-600 text-white px-2 py-1 rounded",
                                                            children: "Confirm"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                                            lineNumber: 102,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setStatus(w.id, 'rejected'),
                                                            className: "text-xs bg-red-600 text-white px-2 py-1 rounded",
                                                            children: "Reject"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                                            lineNumber: 108,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                                    lineNumber: 101,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                                lineNumber: 99,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, w.id, true, {
                                        fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                        lineNumber: 80,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                                lineNumber: 78,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                        lineNumber: 66,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
                    lineNumber: 65,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
            lineNumber: 61,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/withdrawals.tsx",
        lineNumber: 60,
        columnNumber: 5
    }, this);
}
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__bebb6fce._.js.map