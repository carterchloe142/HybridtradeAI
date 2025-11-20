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
"[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/performance.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminPerformance
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$components$2f$AdminGuard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/HYBRID TRADE AI/components/AdminGuard.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/HYBRID TRADE AI/lib/supabase.ts [ssr] (ecmascript)");
;
;
;
;
const defaultStreams = {
    trading: 0,
    copy_trading: 0,
    staking_yield: 0,
    ads_tasks: 0,
    ai: 0
};
function AdminPerformance() {
    const [weekEnding, setWeekEnding] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [streams, setStreams] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(defaultStreams);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    function updateStream(key, value) {
        setStreams((s)=>({
                ...s,
                [key]: Number(value) || 0
            }));
    }
    async function submit() {
        setLoading(true);
        setMessage('');
        try {
            const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
            const token = data.session?.access_token;
            if (!token) throw new Error('Missing session token. Please sign in again.');
            const res = await fetch('/api/admin/performance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    weekEnding,
                    streamRois: streams
                })
            });
            const payload = await res.json();
            if (!res.ok) throw new Error(payload?.error || 'Failed');
            setMessage('Saved performance for ' + weekEnding);
        } catch (e) {
            setMessage(e?.message || 'Error');
        } finally{
            setLoading(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$components$2f$AdminGuard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "max-w-2xl mx-auto p-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-semibold mb-4",
                    children: "Admin: Weekly Performance Streams"
                }, void 0, false, {
                    fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/performance.tsx",
                    lineNumber: 43,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "mb-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                            className: "block text-sm font-medium mb-1",
                            children: "Week Ending"
                        }, void 0, false, {
                            fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/performance.tsx",
                            lineNumber: 45,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                            type: "date",
                            className: "w-full border rounded p-2",
                            value: weekEnding,
                            onChange: (e)=>setWeekEnding(e.target.value)
                        }, void 0, false, {
                            fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/performance.tsx",
                            lineNumber: 46,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/performance.tsx",
                    lineNumber: 44,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 gap-4",
                    children: Object.keys(streams).map((key)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium mb-1",
                                    children: [
                                        key.replace('_', ' ').toUpperCase(),
                                        " ROI %"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/performance.tsx",
                                    lineNumber: 51,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                    type: "number",
                                    step: "0.01",
                                    className: "w-full border rounded p-2 text-black",
                                    value: streams[key],
                                    onChange: (e)=>updateStream(key, e.target.value)
                                }, void 0, false, {
                                    fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/performance.tsx",
                                    lineNumber: 52,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, key, true, {
                            fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/performance.tsx",
                            lineNumber: 50,
                            columnNumber: 11
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/performance.tsx",
                    lineNumber: 48,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                    className: "mt-6 bg-blue-600 text-white px-4 py-2 rounded",
                    disabled: loading || !weekEnding,
                    onClick: submit,
                    children: loading ? 'Saving...' : 'Save Performance'
                }, void 0, false, {
                    fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/performance.tsx",
                    lineNumber: 57,
                    columnNumber: 7
                }, this),
                message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                    className: "mt-3 text-sm",
                    children: message
                }, void 0, false, {
                    fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/performance.tsx",
                    lineNumber: 60,
                    columnNumber: 19
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "mt-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        className: "text-xs text-gray-500",
                        children: "Streams: Trading, Copy-Trading, Staking/Yield, Ads & Tasks, AI. Enter weekly ROI percentages per stream. Then trigger profit distribution via POST /api/admin/distribute-profits."
                    }, void 0, false, {
                        fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/performance.tsx",
                        lineNumber: 62,
                        columnNumber: 9
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/performance.tsx",
                    lineNumber: 61,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/performance.tsx",
            lineNumber: 42,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/Documents/trae_projects/HYBRID TRADE AI/pages/admin/performance.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d87dc40c._.js.map