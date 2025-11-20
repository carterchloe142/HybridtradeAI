module.exports = [
"[externals]/framer-motion [external] (framer-motion, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("framer-motion");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/components/PlanCard.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>PlanCard
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/framer-motion [external] (framer-motion, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function PlanCard({ plan, onInvest }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$29$__["motion"].div, {
        className: "card-neon flex flex-col",
        initial: {
            opacity: 0,
            y: 12
        },
        animate: {
            opacity: 1,
            y: 0
        },
        whileHover: {
            scale: 1.02
        },
        transition: {
            duration: 0.4,
            ease: 'easeOut'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                        className: "text-xl font-bold neon-text",
                        children: plan.name
                    }, void 0, false, {
                        fileName: "[project]/components/PlanCard.tsx",
                        lineNumber: 20,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                        className: "text-neon-blue font-semibold",
                        children: [
                            plan.weeklyRoi,
                            "% weekly"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/PlanCard.tsx",
                        lineNumber: 21,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/PlanCard.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                className: "mt-2 text-sm text-white/70",
                children: plan.description
            }, void 0, false, {
                fileName: "[project]/components/PlanCard.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("ul", {
                className: "mt-4 space-y-1 text-sm text-white/80 list-disc list-inside",
                children: plan.features.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                        children: f
                    }, f, false, {
                        fileName: "[project]/components/PlanCard.tsx",
                        lineNumber: 27,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/PlanCard.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                className: "btn-neon mt-6",
                onClick: ()=>onInvest?.(plan.id),
                children: [
                    "Invest in ",
                    plan.name
                ]
            }, void 0, true, {
                fileName: "[project]/components/PlanCard.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/PlanCard.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
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
"[project]/pages/plans.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>Plans
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PlanCard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/PlanCard.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$profit$2d$engine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/backend/profit-engine.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PlanCard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PlanCard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
function Plans() {
    const invest = async (planId)=>{
        try {
            const userId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["getCurrentUserId"])();
            if (!userId) {
                alert('Please login to invest.');
                return;
            }
            const res = await fetch('/api/deposit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    amount: 100,
                    currency: 'USD',
                    provider: 'flutterwave',
                    planId
                })
            });
            const data = await res.json();
            alert(data.message || 'Deposit initiated');
        } catch (e) {
            alert('Failed to initiate deposit');
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                className: "text-3xl font-bold neon-text mb-6",
                children: "Choose your plan"
            }, void 0, false, {
                fileName: "[project]/pages/plans.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$profit$2d$engine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["PLANS"].map((plan)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PlanCard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                        plan: plan,
                        onInvest: invest
                    }, plan.id, false, {
                        fileName: "[project]/pages/plans.tsx",
                        lineNumber: 30,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/pages/plans.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "mt-8 card-neon",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                        className: "font-semibold",
                        children: "Revenue Streams by Plan"
                    }, void 0, false, {
                        fileName: "[project]/pages/plans.tsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("ul", {
                        className: "mt-2 text-sm text-white/80 space-y-1 list-disc list-inside",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                                children: "Starter: 70% Ads & Tasks, 30% Trading"
                            }, void 0, false, {
                                fileName: "[project]/pages/plans.tsx",
                                lineNumber: 36,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                                children: "Pro: 60% Trading, 25% Copy-Trading, 15% Ads & Tasks"
                            }, void 0, false, {
                                fileName: "[project]/pages/plans.tsx",
                                lineNumber: 37,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                                children: "Elite: 50% Trading, 30% Staking/Yield, 20% AI/Copy-Trading"
                            }, void 0, false, {
                                fileName: "[project]/pages/plans.tsx",
                                lineNumber: 38,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/plans.tsx",
                        lineNumber: 35,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/plans.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/pages/plans.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__95ac322a._.js.map