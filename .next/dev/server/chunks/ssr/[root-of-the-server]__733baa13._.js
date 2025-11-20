module.exports = [
"[project]/components/Sidebar.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Sidebar
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-grid.js [ssr] (ecmascript) <export default as LayoutGrid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wallet$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wallet$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wallet.js [ssr] (ecmascript) <export default as Wallet>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-round.js [ssr] (ecmascript) <export default as User2>");
;
;
;
;
const items = [
    {
        href: '/dashboard',
        label: 'Dashboard',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__["LayoutGrid"]
    },
    {
        href: '/plans',
        label: 'Plans',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wallet$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wallet$3e$__["Wallet"]
    },
    {
        href: '/profile',
        label: 'Profile',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User2$3e$__["User2"]
    }
];
function Sidebar() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("aside", {
        className: "glass w-full md:w-64 rounded-2xl p-4 h-fit md:h-[calc(100vh-120px)]",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("nav", {
            className: "flex md:flex-col gap-3",
            children: items.map(({ href, label, icon: Icon })=>{
                const active = router.pathname === href;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: href,
                    className: `flex items-center gap-2 px-3 py-2 rounded-lg ${active ? 'bg-white/10 text-neon-blue' : 'hover:bg-white/10'}`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(Icon, {
                            size: 18
                        }, void 0, false, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 21,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            children: label
                        }, void 0, false, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 22,
                            columnNumber: 15
                        }, this)
                    ]
                }, href, true, {
                    fileName: "[project]/components/Sidebar.tsx",
                    lineNumber: 19,
                    columnNumber: 13
                }, this);
            })
        }, void 0, false, {
            fileName: "[project]/components/Sidebar.tsx",
            lineNumber: 15,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/Sidebar.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/DashboardCard.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardCard
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
;
function DashboardCard({ title, value, sublabel }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "card-neon",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "text-sm text-white/70",
                children: title
            }, void 0, false, {
                fileName: "[project]/components/DashboardCard.tsx",
                lineNumber: 12,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "mt-2 text-2xl font-semibold",
                children: value
            }, void 0, false, {
                fileName: "[project]/components/DashboardCard.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this),
            sublabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "mt-1 text-xs text-white/60",
                children: sublabel
            }, void 0, false, {
                fileName: "[project]/components/DashboardCard.tsx",
                lineNumber: 14,
                columnNumber: 20
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/DashboardCard.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/RequireAuth.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RequireAuth
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
;
;
;
;
function RequireAuth({ children }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [ready, setReady] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        let mounted = true;
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getSession().then((res)=>{
            const isAuthed = !!res.data?.session;
            if (!isAuthed) {
                router.replace('/auth/login');
            } else if (mounted) {
                setReady(true);
            }
        });
        const { data: sub } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.onAuthStateChange((_event, session)=>{
            if (!session) router.replace('/auth/login');
        });
        return ()=>{
            sub?.subscription?.unsubscribe();
            mounted = false;
        };
    }, [
        router
    ]);
    if (!ready) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "card-neon text-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                children: "Checking your session..."
            }, void 0, false, {
                fileName: "[project]/components/RequireAuth.tsx",
                lineNumber: 30,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/RequireAuth.tsx",
            lineNumber: 29,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
}),
"[project]/hooks/useCurrency.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCurrency",
    ()=>useCurrency
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
;
const staticRates = {
    USD: 1,
    EUR: 0.92,
    NGN: 1550,
    BTC: 1 / 65000,
    ETH: 1 / 3500
};
function useCurrency(initial = 'USD') {
    const [currency, setCurrency] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(initial);
    const rate = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useMemo"])(()=>staticRates[currency] || 1, [
        currency
    ]);
    const format = (amount)=>{
        const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'NGN' ? '₦' : currency === 'BTC' ? '₿' : 'Ξ';
        const decimals = currency === 'USD' || currency === 'EUR' || currency === 'NGN' ? 2 : 6;
        return `${symbol}${amount.toFixed(decimals)}`;
    };
    const convertFromUSD = (usdAmount)=>usdAmount * rate;
    const convertToUSD = (amount, fromCurrency)=>{
        const r = staticRates[fromCurrency] || 1; // currency per USD
        return amount / r; // convert currency -> USD
    };
    return {
        currency,
        setCurrency,
        format,
        convertFromUSD,
        convertToUSD,
        rate
    };
}
}),
"[project]/backend/profit-engine.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PLANS",
    ()=>PLANS,
    "calculateReferralCommission",
    ()=>calculateReferralCommission,
    "calculateWeeklyROI",
    ()=>calculateWeeklyROI,
    "distributeWeeklyProfits",
    ()=>distributeWeeklyProfits,
    "referralConfig",
    ()=>referralConfig
]);
const PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        description: 'Entry plan allocating 70% Ads & Tasks and 30% Trading.',
        weeklyRoi: 30,
        features: [
            '70% Ads & Tasks',
            '30% Trading',
            'Task bonuses available'
        ]
    },
    {
        id: 'pro',
        name: 'Pro',
        description: 'Balanced plan: 60% Trading, 25% Copy-Trading, 15% Ads & Tasks.',
        weeklyRoi: 35,
        features: [
            '60% Trading',
            '25% Copy-Trading',
            '15% Ads & Tasks',
            'Premium education content'
        ]
    },
    {
        id: 'elite',
        name: 'Elite',
        description: 'High-tier: 50% Trading, 30% Staking/Yield, 20% AI/Copy-Trading.',
        weeklyRoi: 40,
        features: [
            'Priority withdrawals',
            'Beta access to new features',
            '50% Trading',
            '30% Staking/Yield',
            '20% AI/Copy-Trading'
        ]
    }
];
const referralConfig = {
    starter: 5,
    pro: 7,
    elite: 10
};
function calculateWeeklyROI(amountUSD, planId) {
    const plan = PLANS.find((p)=>p.id === planId);
    if (!plan) return 0;
    const roi = amountUSD * (plan.weeklyRoi / 100);
    return Number(roi.toFixed(2));
}
function calculateReferralCommission(downlineWeeklyRoiUSD, planId) {
    const pct = planId === 'pro' ? referralConfig.pro : planId === 'elite' ? referralConfig.elite : referralConfig.starter;
    const commission = downlineWeeklyRoiUSD * (pct / 100);
    return Number(commission.toFixed(2));
}
async function distributeWeeklyProfits() {
    // TODO: integrate with DB (Supabase) to: 
    // 1) fetch active investments
    // 2) compute ROI per plan
    // 3) credit wallets for profits and referrals
    // 4) record transactions and update balances
    return {
        ok: true,
        message: 'Scheduled distribution stub executed.'
    };
}
}),
"[project]/lib/db.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCurrentUserId",
    ()=>getCurrentUserId,
    "getReferralByUser",
    ()=>getReferralByUser,
    "getUserInvestments",
    ()=>getUserInvestments,
    "getUserWallets",
    ()=>getUserWallets,
    "upsertReferral",
    ()=>upsertReferral
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [ssr] (ecmascript)");
;
async function getCurrentUserId() {
    const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
    return data.session?.user?.id ?? null;
}
async function getUserWallets(userId) {
    // First try client-side read (requires RLS policies). If empty or blocked, fallback to server API.
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["supabase"].from('wallets').select('id,user_id,currency,balance').eq('user_id', userId);
    const direct = data ?? [];
    if (!error && direct.length > 0) return direct;
    try {
        const { data: session } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
        const token = session.session?.access_token;
        if (!token) return direct; // cannot fallback without token
        const res = await fetch(`/api/user/wallets?ts=${Date.now()}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            // Ensure no caching by intermediaries
            cache: 'no-store'
        });
        if (!res.ok) return direct;
        const payload = await res.json();
        return payload.wallets ?? [];
    } catch  {
        return direct;
    }
}
async function getUserInvestments(userId) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["supabase"].from('investments').select('id,user_id,plan_id,amount_usd,status').eq('user_id', userId);
    if (error) return [];
    return data ?? [];
}
async function upsertReferral(userId, code) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["supabase"].from('referrals').upsert({
        user_id: userId,
        code
    }, {
        onConflict: 'user_id'
    }).select();
    if (error) return null;
    return data?.[0] ?? null;
}
async function getReferralByUser(userId) {
    const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["supabase"].from('referrals').select('code,total_earnings').eq('user_id', userId).limit(1).maybeSingle();
    return data ?? null;
}
}),
"[project]/pages/dashboard.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Dashboard
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Sidebar$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Sidebar.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DashboardCard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/DashboardCard.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$RequireAuth$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/RequireAuth.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useCurrency$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useCurrency.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$profit$2d$engine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/backend/profit-engine.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useUserNotifications$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useUserNotifications.ts [ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
function Dashboard() {
    const { currency, setCurrency, format, convertFromUSD, convertToUSD } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useCurrency$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["useCurrency"])('USD');
    const [walletAmount, setWalletAmount] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(0);
    const [walletTotalUSD, setWalletTotalUSD] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(0);
    const [investedUSD, setInvestedUSD] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(0);
    const [withdrawableUSD, setWithdrawableUSD] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(0);
    const [referralUSD, setReferralUSD] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(0);
    const [weeklyRoiUSD, setWeeklyRoiUSD] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(0);
    const [refreshKey, setRefreshKey] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(0);
    const userIdRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const { items: notifications } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useUserNotifications$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["useUserNotifications"])();
    const [depositAmount, setDepositAmount] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [depositProvider, setDepositProvider] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('flutterwave');
    const [depositPlan, setDepositPlan] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('starter');
    const [withdrawAmount, setWithdrawAmount] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [actionMsg, setActionMsg] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [actionErr, setActionErr] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const latest = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useMemo"])(()=>notifications[0], [
        notifications
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (!latest) return;
        const t = String(latest?.type || '');
        if (t === 'manual_credit' || t === 'profit' || t === 'investment_status' || t === 'withdrawal_status') {
            setRefreshKey((k)=>k + 1);
        }
    }, [
        latest
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        async function fetchData() {
            const userId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["getCurrentUserId"])();
            if (!userId) return;
            userIdRef.current = userId;
            // Prefer user's profile currency if present
            try {
                const { data: profile } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["supabase"].from('profiles').select('currency').eq('user_id', userId).maybeSingle();
                const preferred = profile?.currency || 'USD';
                setCurrency((prev)=>prev || preferred);
            } catch  {}
            const [wallets, investments] = await Promise.all([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["getUserWallets"])(userId),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["getUserInvestments"])(userId)
            ]);
            const totalWalletSelected = wallets.filter((w)=>w.currency === currency).reduce((sum, w)=>sum + (Number(w.balance) || 0), 0);
            setWalletAmount(Number(totalWalletSelected.toFixed(2)));
            const totalUSD = wallets.reduce((sum, w)=>{
                const amt = Number(w.balance) || 0;
                return sum + convertToUSD(amt, w.currency);
            }, 0);
            setWalletTotalUSD(Number(totalUSD.toFixed(2)));
            const activeInvestments = investments.filter((i)=>i.status === 'active');
            const totalInvested = activeInvestments.reduce((sum, i)=>sum + i.amount_usd, 0);
            setInvestedUSD(totalInvested);
            const withdrawable = totalInvested * 0.12;
            setWithdrawableUSD(Number(withdrawable.toFixed(2)));
            const roi = (0, __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$profit$2d$engine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["calculateWeeklyROI"])(totalInvested, activeInvestments[0]?.plan_id || 'starter');
            setWeeklyRoiUSD(roi);
            setReferralUSD(Number((roi * 0.05).toFixed(2)));
        }
        fetchData();
    }, [
        currency,
        refreshKey
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        // Subscribe to realtime wallet changes for the current user
        (async ()=>{
            const userId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["getCurrentUserId"])();
            if (!userId) return;
            userIdRef.current = userId;
            const channel = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["supabase"].channel(`wallets_user_${userId}`).on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'wallets',
                filter: `user_id=eq.${userId}`
            }, ()=>{
                setRefreshKey((k)=>k + 1);
            }).subscribe();
            return ()=>{
                try {
                    channel.unsubscribe();
                } catch  {}
            };
        })();
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$RequireAuth$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "grid md:grid-cols-[auto,1fr] gap-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Sidebar$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/pages/dashboard.tsx",
                    lineNumber: 104,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "glass rounded-2xl p-4 flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                    className: "text-xl font-bold neon-text",
                                    children: "Overview"
                                }, void 0, false, {
                                    fileName: "[project]/pages/dashboard.tsx",
                                    lineNumber: 108,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 text-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                            className: "text-white/70",
                                            children: "Currency:"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/dashboard.tsx",
                                            lineNumber: 110,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("select", {
                                            className: "input-neon w-32",
                                            value: currency,
                                            onChange: (e)=>setCurrency(e.target.value),
                                            children: [
                                                'USD',
                                                'EUR',
                                                'NGN',
                                                'BTC',
                                                'ETH'
                                            ].map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                    value: c,
                                                    children: c
                                                }, c, false, {
                                                    fileName: "[project]/pages/dashboard.tsx",
                                                    lineNumber: 117,
                                                    columnNumber: 19
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/pages/dashboard.tsx",
                                            lineNumber: 111,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/dashboard.tsx",
                                    lineNumber: 109,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/dashboard.tsx",
                            lineNumber: 107,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DashboardCard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    title: "Wallet balance (selected)",
                                    value: format(walletAmount)
                                }, void 0, false, {
                                    fileName: "[project]/pages/dashboard.tsx",
                                    lineNumber: 124,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DashboardCard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    title: "All wallets total (USD)",
                                    value: `$${walletTotalUSD.toFixed(2)}`
                                }, void 0, false, {
                                    fileName: "[project]/pages/dashboard.tsx",
                                    lineNumber: 125,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DashboardCard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    title: `All wallets total (${currency})`,
                                    value: format(convertFromUSD(walletTotalUSD))
                                }, void 0, false, {
                                    fileName: "[project]/pages/dashboard.tsx",
                                    lineNumber: 126,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DashboardCard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    title: "Invested amount (active in pool)",
                                    value: format(convertFromUSD(investedUSD))
                                }, void 0, false, {
                                    fileName: "[project]/pages/dashboard.tsx",
                                    lineNumber: 127,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DashboardCard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    title: "Withdrawable profits",
                                    value: format(convertFromUSD(withdrawableUSD))
                                }, void 0, false, {
                                    fileName: "[project]/pages/dashboard.tsx",
                                    lineNumber: 128,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DashboardCard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    title: "Referral earnings",
                                    value: format(convertFromUSD(referralUSD))
                                }, void 0, false, {
                                    fileName: "[project]/pages/dashboard.tsx",
                                    lineNumber: 129,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DashboardCard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    title: "Estimated weekly ROI",
                                    value: format(convertFromUSD(weeklyRoiUSD)),
                                    sublabel: "Based on current plan"
                                }, void 0, false, {
                                    fileName: "[project]/pages/dashboard.tsx",
                                    lineNumber: 130,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/dashboard.tsx",
                            lineNumber: 123,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "glass rounded-2xl p-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between mb-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                            className: "text-lg font-semibold neon-text",
                                            children: "Actions"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/dashboard.tsx",
                                            lineNumber: 135,
                                            columnNumber: 15
                                        }, this),
                                        actionMsg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                            className: `text-sm ${actionErr ? 'text-red-500' : 'text-green-500'}`,
                                            children: actionMsg
                                        }, void 0, false, {
                                            fileName: "[project]/pages/dashboard.tsx",
                                            lineNumber: 136,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/dashboard.tsx",
                                    lineNumber: 134,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "grid md:grid-cols-2 gap-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "space-y-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                        className: "input-neon flex-1",
                                                        type: "number",
                                                        step: "0.01",
                                                        placeholder: "Deposit amount",
                                                        value: depositAmount,
                                                        onChange: (e)=>setDepositAmount(e.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/dashboard.tsx",
                                                        lineNumber: 141,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("select", {
                                                        className: "input-neon w-36",
                                                        value: depositProvider,
                                                        onChange: (e)=>setDepositProvider(e.target.value),
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                                value: "flutterwave",
                                                                children: "Flutterwave"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/dashboard.tsx",
                                                                lineNumber: 143,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                                value: "paystack",
                                                                children: "Paystack"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/dashboard.tsx",
                                                                lineNumber: 144,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                                value: "crypto",
                                                                children: "Crypto"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/dashboard.tsx",
                                                                lineNumber: 145,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/dashboard.tsx",
                                                        lineNumber: 142,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("select", {
                                                        className: "input-neon w-36",
                                                        value: depositPlan,
                                                        onChange: (e)=>setDepositPlan(e.target.value),
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                                value: "starter",
                                                                children: "Starter"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/dashboard.tsx",
                                                                lineNumber: 148,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                                value: "pro",
                                                                children: "Pro"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/dashboard.tsx",
                                                                lineNumber: 149,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                                value: "elite",
                                                                children: "Elite"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/dashboard.tsx",
                                                                lineNumber: 150,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/dashboard.tsx",
                                                        lineNumber: 147,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        className: "btn-neon",
                                                        onClick: async ()=>{
                                                            setActionErr('');
                                                            setActionMsg('');
                                                            const uid = userIdRef.current;
                                                            const amt = Number(depositAmount);
                                                            if (!uid || !amt || amt <= 0) {
                                                                setActionErr('Invalid deposit');
                                                                setActionMsg('');
                                                                return;
                                                            }
                                                            try {
                                                                const res = await fetch('/api/deposit', {
                                                                    method: 'POST',
                                                                    headers: {
                                                                        'Content-Type': 'application/json'
                                                                    },
                                                                    body: JSON.stringify({
                                                                        userId: uid,
                                                                        amount: amt,
                                                                        currency,
                                                                        provider: depositProvider,
                                                                        planId: depositPlan
                                                                    })
                                                                });
                                                                const json = await res.json();
                                                                if (!res.ok) {
                                                                    setActionErr(String(json?.error || 'Failed'));
                                                                    setActionMsg('');
                                                                    return;
                                                                }
                                                                setActionMsg(String(json?.message || 'Deposit recorded'));
                                                                setDepositAmount('');
                                                                setRefreshKey((k)=>k + 1);
                                                            } catch (e) {
                                                                setActionErr(String(e?.message || 'Error'));
                                                            }
                                                        },
                                                        children: "Deposit"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/dashboard.tsx",
                                                        lineNumber: 152,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/dashboard.tsx",
                                                lineNumber: 140,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/pages/dashboard.tsx",
                                            lineNumber: 139,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "space-y-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                        className: "input-neon flex-1",
                                                        type: "number",
                                                        step: "0.01",
                                                        placeholder: "Withdraw amount",
                                                        value: withdrawAmount,
                                                        onChange: (e)=>setWithdrawAmount(e.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/dashboard.tsx",
                                                        lineNumber: 171,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        className: "btn-neon",
                                                        onClick: async ()=>{
                                                            setActionErr('');
                                                            setActionMsg('');
                                                            const uid = userIdRef.current;
                                                            const amt = Number(withdrawAmount);
                                                            if (!uid || !amt || amt <= 0) {
                                                                setActionErr('Invalid withdraw');
                                                                setActionMsg('');
                                                                return;
                                                            }
                                                            try {
                                                                const res = await fetch('/api/withdraw', {
                                                                    method: 'POST',
                                                                    headers: {
                                                                        'Content-Type': 'application/json'
                                                                    },
                                                                    body: JSON.stringify({
                                                                        userId: uid,
                                                                        amount: amt,
                                                                        currency,
                                                                        cycleActive: false
                                                                    })
                                                                });
                                                                const json = await res.json();
                                                                if (res.status === 202) {
                                                                    setActionMsg(String(json?.message || 'Request submitted'));
                                                                    setWithdrawAmount('');
                                                                    return;
                                                                }
                                                                if (!res.ok) {
                                                                    setActionErr(String(json?.error || 'Failed'));
                                                                    setActionMsg('');
                                                                    return;
                                                                }
                                                                setActionMsg(String(json?.message || 'Withdrawal recorded'));
                                                                setWithdrawAmount('');
                                                                setRefreshKey((k)=>k + 1);
                                                            } catch (e) {
                                                                setActionErr(String(e?.message || 'Error'));
                                                            }
                                                        },
                                                        children: "Withdraw"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/dashboard.tsx",
                                                        lineNumber: 172,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/dashboard.tsx",
                                                lineNumber: 170,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/pages/dashboard.tsx",
                                            lineNumber: 169,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/dashboard.tsx",
                                    lineNumber: 138,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/dashboard.tsx",
                            lineNumber: 133,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "card-neon",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                    className: "font-semibold neon-text",
                                    children: "AI Assistant"
                                }, void 0, false, {
                                    fileName: "[project]/pages/dashboard.tsx",
                                    lineNumber: 194,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    className: "mt-2 text-sm text-white/80",
                                    children: "Live responses will appear here. Use the floating chatbot for now."
                                }, void 0, false, {
                                    fileName: "[project]/pages/dashboard.tsx",
                                    lineNumber: 195,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/dashboard.tsx",
                            lineNumber: 193,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/dashboard.tsx",
                    lineNumber: 106,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/pages/dashboard.tsx",
            lineNumber: 103,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/pages/dashboard.tsx",
        lineNumber: 102,
        columnNumber: 5
    }, this);
}
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__733baa13._.js.map