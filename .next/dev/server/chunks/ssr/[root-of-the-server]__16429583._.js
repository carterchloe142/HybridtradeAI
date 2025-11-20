module.exports = [
"[project]/components/AdminGuard.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminGuard
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [ssr] (ecmascript)");
;
;
;
function AdminGuard({ children }) {
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('loading');
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        let mounted = true;
        async function check() {
            const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
            const user = data.session?.user;
            if (!user) {
                if (mounted) setStatus('noauth');
                return;
            }
            const { data: profile } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["supabase"].from('profiles').select('role,is_admin').eq('user_id', user.id).maybeSingle();
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
        fileName: "[project]/components/AdminGuard.tsx",
        lineNumber: 31,
        columnNumber: 36
    }, this);
    if (status === 'noauth') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "p-6",
        children: "Sign in required."
    }, void 0, false, {
        fileName: "[project]/components/AdminGuard.tsx",
        lineNumber: 32,
        columnNumber: 35
    }, this);
    if (status === 'forbidden') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "p-6",
        children: "Not authorized."
    }, void 0, false, {
        fileName: "[project]/components/AdminGuard.tsx",
        lineNumber: 33,
        columnNumber: 38
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
}),
"[project]/pages/admin/manual-credit.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ManualCreditPage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AdminGuard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/AdminGuard.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [ssr] (ecmascript)");
;
;
;
;
function ManualCreditPage() {
    const [userId, setUserId] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [amount, setAmount] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [description, setDescription] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [errorCode, setErrorCode] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [history, setHistory] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(1);
    const [limit, setLimit] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(25);
    const [total, setTotal] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(0);
    const [health, setHealth] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [healthMsg, setHealthMsg] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    async function loadHistory(nextPage = page, nextLimit = limit) {
        try {
            const { data: session } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
            const token = session.session?.access_token;
            const res = await fetch(`/api/admin/credit-user?page=${nextPage}&limit=${nextLimit}`, {
                headers: token ? {
                    'Authorization': `Bearer ${token}`
                } : undefined
            });
            const data = await res.json();
            if (!res.ok) {
                setMessage(data.error || 'Failed to load admin credits');
                setHistory([]);
            } else {
                setHistory(data.actions ?? []);
                setTotal(Number(data.total || 0));
                setPage(Number(data.page || nextPage));
                setLimit(Number(data.limit || nextLimit));
            }
        } catch (e) {
            setMessage(e?.message || 'Failed to load admin credits');
        }
    }
    async function loadHealth() {
        try {
            const { data: session } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
            const token = session.session?.access_token;
            const res = await fetch('/api/admin/health', {
                headers: token ? {
                    Authorization: `Bearer ${token}`
                } : undefined
            });
            const payload = await res.json();
            if (!res.ok) {
                setHealthMsg(payload.error || 'Health check failed');
            } else {
                setHealth(payload.status || null);
            }
        } catch (e) {
            setHealthMsg(e?.message || 'Health check failed');
        }
    }
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        loadHistory(page, limit);
        loadHealth();
    }, [
        page,
        limit
    ]);
    async function submit() {
        setMessage(null);
        setErrorCode(null);
        setLoading(true);
        try {
            const amt = Number(amount);
            if (!userId || !amt || amt <= 0) {
                setMessage('Enter a valid user identifier (email or UUID) and amount > 0');
                return;
            }
            const { data: session } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
            const token = session.session?.access_token;
            const res = await fetch('/api/admin/credit-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...token ? {
                        'Authorization': `Bearer ${token}`
                    } : {}
                },
                body: JSON.stringify({
                    // Send email if provided, otherwise assume UUID/cuid
                    ...userId.includes('@') ? {
                        email: userId
                    } : {
                        userId
                    },
                    amount: amt,
                    description
                })
            });
            const payload = await res.json();
            if (!res.ok) {
                const code = String(payload.error || '');
                setErrorCode(code || null);
                setMessage(code === 'manual_credits_disabled' ? 'Manual credits are disabled by configuration.' : code === 'service_role_not_configured' ? 'Supabase service role is not configured.' : code === 'invalid_user_identifier' ? 'User not found. Check email or UUID.' : code.startsWith('wallet_select_failed') ? 'Could not read wallet; check Supabase permissions.' : code.startsWith('wallet_create_failed') ? 'Could not create wallet; check Supabase schema.' : code.startsWith('wallet_update_failed') ? 'Could not update wallet; check Supabase RLS.' : code.startsWith('transactions_insert_failed') ? 'Could not insert transaction; check Supabase schema.' : payload.error || 'Credit failed');
            } else if (payload.status === 'pending') {
                setMessage('Credit logged as pending approval');
            } else {
                setMessage(`Credited. New balance: ${payload.balance}`);
                // Reset the form after a successful transaction
                setUserId('');
                setAmount('');
                setDescription('');
            }
            loadHistory();
        } catch (e) {
            setMessage(e?.message || 'Request failed');
        } finally{
            setLoading(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AdminGuard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "max-w-2xl mx-auto",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-semibold mb-4",
                    children: "Manual Credit"
                }, void 0, false, {
                    fileName: "[project]/pages/admin/manual-credit.tsx",
                    lineNumber: 129,
                    columnNumber: 7
                }, this),
                health && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "mb-4 text-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            children: [
                                "Manual Credits Enabled: ",
                                String(health.manualCreditsEnabled ?? false)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/admin/manual-credit.tsx",
                            lineNumber: 132,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            children: [
                                "Service Role Configured: ",
                                String(health.serviceRoleConfigured ?? false)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/admin/manual-credit.tsx",
                            lineNumber: 133,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            children: [
                                "Prisma Ready: ",
                                String(health.prismaReady ?? false)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/admin/manual-credit.tsx",
                            lineNumber: 134,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            children: [
                                "Wallets Table Ready: ",
                                String(health.walletsTableReady ?? false)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/admin/manual-credit.tsx",
                            lineNumber: 135,
                            columnNumber: 11
                        }, this),
                        !health.prismaReady && health.prismaError && health.prismaOptional !== true && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "mt-2 rounded px-3 py-2 bg-red-100 text-red-700",
                            children: [
                                "Prisma error: ",
                                health.prismaError
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/admin/manual-credit.tsx",
                            lineNumber: 137,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: `mt-2 rounded px-3 py-2 ${health.manualCreditsEnabled && health.serviceRoleConfigured ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`,
                            children: [
                                !health.manualCreditsEnabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    children: "Manual credits are disabled. Enable in environment config."
                                }, void 0, false, {
                                    fileName: "[project]/pages/admin/manual-credit.tsx",
                                    lineNumber: 142,
                                    columnNumber: 48
                                }, this),
                                health.manualCreditsEnabled && !health.serviceRoleConfigured && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    children: "Supabase service role is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
                                }, void 0, false, {
                                    fileName: "[project]/pages/admin/manual-credit.tsx",
                                    lineNumber: 143,
                                    columnNumber: 80
                                }, this),
                                health.manualCreditsEnabled && health.serviceRoleConfigured && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    children: "Manual credit is ready."
                                }, void 0, false, {
                                    fileName: "[project]/pages/admin/manual-credit.tsx",
                                    lineNumber: 144,
                                    columnNumber: 79
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/admin/manual-credit.tsx",
                            lineNumber: 141,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/admin/manual-credit.tsx",
                    lineNumber: 131,
                    columnNumber: 9
                }, this),
                healthMsg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                    className: "text-sm text-red-600 mb-2",
                    children: healthMsg
                }, void 0, false, {
                    fileName: "[project]/pages/admin/manual-credit.tsx",
                    lineNumber: 148,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "bg-white shadow rounded p-4 space-y-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium",
                                    children: "User Identifier"
                                }, void 0, false, {
                                    fileName: "[project]/pages/admin/manual-credit.tsx",
                                    lineNumber: 151,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                    value: userId,
                                    onChange: (e)=>setUserId(e.target.value),
                                    className: "mt-1 w-full border rounded px-3 py-2",
                                    placeholder: "Enter user email or Supabase UUID"
                                }, void 0, false, {
                                    fileName: "[project]/pages/admin/manual-credit.tsx",
                                    lineNumber: 152,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    className: "mt-1 text-xs text-gray-600",
                                    children: "You can paste the user's email, Supabase user UUID, or a Prisma cuid; emails are recommended."
                                }, void 0, false, {
                                    fileName: "[project]/pages/admin/manual-credit.tsx",
                                    lineNumber: 158,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/admin/manual-credit.tsx",
                            lineNumber: 150,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium",
                                    children: "Amount"
                                }, void 0, false, {
                                    fileName: "[project]/pages/admin/manual-credit.tsx",
                                    lineNumber: 161,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                    value: amount,
                                    onChange: (e)=>setAmount(e.target.value),
                                    className: "mt-1 w-full border rounded px-3 py-2",
                                    type: "number",
                                    step: "0.01",
                                    placeholder: "e.g., 100"
                                }, void 0, false, {
                                    fileName: "[project]/pages/admin/manual-credit.tsx",
                                    lineNumber: 162,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/admin/manual-credit.tsx",
                            lineNumber: 160,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium",
                                    children: "Description (optional)"
                                }, void 0, false, {
                                    fileName: "[project]/pages/admin/manual-credit.tsx",
                                    lineNumber: 165,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                    value: description,
                                    onChange: (e)=>setDescription(e.target.value),
                                    className: "mt-1 w-full border rounded px-3 py-2",
                                    placeholder: "Reason"
                                }, void 0, false, {
                                    fileName: "[project]/pages/admin/manual-credit.tsx",
                                    lineNumber: 166,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/admin/manual-credit.tsx",
                            lineNumber: 164,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            disabled: loading || Boolean(health && (!health.manualCreditsEnabled || !health.serviceRoleConfigured)),
                            onClick: submit,
                            className: "bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50",
                            children: loading ? 'Processing...' : 'Credit User'
                        }, void 0, false, {
                            fileName: "[project]/pages/admin/manual-credit.tsx",
                            lineNumber: 168,
                            columnNumber: 9
                        }, this),
                        message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: `mt-2 text-sm ${errorCode ? 'text-red-600' : 'text-green-700'}`,
                            children: [
                                message,
                                errorCode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    className: "ml-2",
                                    children: [
                                        "(",
                                        errorCode,
                                        ")"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/admin/manual-credit.tsx",
                                    lineNumber: 174,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/admin/manual-credit.tsx",
                            lineNumber: 172,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/admin/manual-credit.tsx",
                    lineNumber: 149,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                    className: "text-xl font-semibold mt-6 mb-2",
                    children: "Recent Admin Credits"
                }, void 0, false, {
                    fileName: "[project]/pages/admin/manual-credit.tsx",
                    lineNumber: 179,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "overflow-x-auto",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("table", {
                        className: "min-w-full text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("thead", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("tr", {
                                    className: "text-left",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                            className: "px-3 py-2",
                                            children: "Date"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/admin/manual-credit.tsx",
                                            lineNumber: 184,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                            className: "px-3 py-2",
                                            children: "Admin"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/admin/manual-credit.tsx",
                                            lineNumber: 185,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                            className: "px-3 py-2",
                                            children: "User"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/admin/manual-credit.tsx",
                                            lineNumber: 186,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                            className: "px-3 py-2",
                                            children: "Amount"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/admin/manual-credit.tsx",
                                            lineNumber: 187,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                            className: "px-3 py-2",
                                            children: "Status"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/admin/manual-credit.tsx",
                                            lineNumber: 188,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                            className: "px-3 py-2",
                                            children: "Note"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/admin/manual-credit.tsx",
                                            lineNumber: 189,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/admin/manual-credit.tsx",
                                    lineNumber: 183,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/pages/admin/manual-credit.tsx",
                                lineNumber: 182,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("tbody", {
                                children: history.map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("tr", {
                                        className: "border-t",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                className: "px-3 py-2",
                                                children: new Date(h.createdAt).toLocaleString()
                                            }, void 0, false, {
                                                fileName: "[project]/pages/admin/manual-credit.tsx",
                                                lineNumber: 195,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                className: "px-3 py-2",
                                                children: h.adminId
                                            }, void 0, false, {
                                                fileName: "[project]/pages/admin/manual-credit.tsx",
                                                lineNumber: 196,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                className: "px-3 py-2",
                                                children: h.userId
                                            }, void 0, false, {
                                                fileName: "[project]/pages/admin/manual-credit.tsx",
                                                lineNumber: 197,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                className: "px-3 py-2",
                                                children: h.amount
                                            }, void 0, false, {
                                                fileName: "[project]/pages/admin/manual-credit.tsx",
                                                lineNumber: 198,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                className: "px-3 py-2",
                                                children: h.status
                                            }, void 0, false, {
                                                fileName: "[project]/pages/admin/manual-credit.tsx",
                                                lineNumber: 199,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                className: "px-3 py-2",
                                                children: h.note ?? ''
                                            }, void 0, false, {
                                                fileName: "[project]/pages/admin/manual-credit.tsx",
                                                lineNumber: 200,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, h.id, true, {
                                        fileName: "[project]/pages/admin/manual-credit.tsx",
                                        lineNumber: 194,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/pages/admin/manual-credit.tsx",
                                lineNumber: 192,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/admin/manual-credit.tsx",
                        lineNumber: 181,
                        columnNumber: 9
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/pages/admin/manual-credit.tsx",
                    lineNumber: 180,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between mt-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    className: "bg-gray-200 text-black rounded px-3 py-1 disabled:opacity-50",
                                    disabled: page <= 1,
                                    onClick: ()=>setPage((p)=>Math.max(1, p - 1)),
                                    children: "Prev"
                                }, void 0, false, {
                                    fileName: "[project]/pages/admin/manual-credit.tsx",
                                    lineNumber: 208,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    className: "bg-gray-200 text-black rounded px-3 py-1 disabled:opacity-50",
                                    disabled: page * limit >= total,
                                    onClick: ()=>setPage((p)=>p + 1),
                                    children: "Next"
                                }, void 0, false, {
                                    fileName: "[project]/pages/admin/manual-credit.tsx",
                                    lineNumber: 213,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/admin/manual-credit.tsx",
                            lineNumber: 207,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "text-sm",
                            children: [
                                "Page ",
                                page,
                                " • Showing ",
                                history.length,
                                " of ",
                                total,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("select", {
                                    className: "border rounded px-2 py-1 ml-3",
                                    value: limit,
                                    onChange: (e)=>setLimit(Number(e.target.value)),
                                    children: [
                                        10,
                                        25,
                                        50,
                                        100
                                    ].map((l)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                            value: l,
                                            children: [
                                                l,
                                                "/page"
                                            ]
                                        }, l, true, {
                                            fileName: "[project]/pages/admin/manual-credit.tsx",
                                            lineNumber: 226,
                                            columnNumber: 38
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/pages/admin/manual-credit.tsx",
                                    lineNumber: 221,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/admin/manual-credit.tsx",
                            lineNumber: 219,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/admin/manual-credit.tsx",
                    lineNumber: 206,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/pages/admin/manual-credit.tsx",
            lineNumber: 128,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/pages/admin/manual-credit.tsx",
        lineNumber: 127,
        columnNumber: 5
    }, this);
}
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__16429583._.js.map