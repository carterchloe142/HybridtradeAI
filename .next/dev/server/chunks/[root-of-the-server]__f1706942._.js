module.exports = [
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@supabase/supabase-js", () => require("@supabase/supabase-js"));

module.exports = mod;
}),
"[project]/Documents/trae_projects/HYBRID TRADE AI/lib/supabaseServer.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabaseServer",
    ()=>supabaseServer
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, cjs)");
;
const url = process.env.SUPABASE_URL || ("TURBOPACK compile-time value", "https://wdlcttgfwoejqynlylpv.supabase.co") || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbGN0dGdmd29lanF5bmx5bHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODE0MzAsImV4cCI6MjA3ODQ1NzQzMH0.UZaY0iYoVRS5MioS5Clg6y_CVNdgzm-3OdB_cwWuB8E") || '';
const supabaseServer = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__cjs$29$__["createClient"])(url, serviceKey);
}),
"[project]/Documents/trae_projects/HYBRID TRADE AI/backend/profit-engine.ts [api] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/Documents/trae_projects/HYBRID TRADE AI/lib/adminAuth.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "requireAdmin",
    ()=>requireAdmin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/HYBRID TRADE AI/lib/supabaseServer.ts [api] (ecmascript)");
;
async function requireAdmin(req) {
    try {
        const auth = String(req.headers.authorization || '');
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
        if (!token) return {
            ok: false,
            error: 'Missing Authorization bearer token'
        };
        const { data: userData, error: userErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].auth.getUser(token);
        if (userErr || !userData?.user?.id) return {
            ok: false,
            error: 'Invalid token'
        };
        const userId = userData.user.id;
        const { data: profile, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('profiles').select('role,is_admin').eq('user_id', userId).maybeSingle();
        if (error) return {
            ok: false,
            error: 'Profile lookup failed'
        };
        const role = String(profile?.role || '').toLowerCase();
        const isAdmin = Boolean(profile?.is_admin) || role === 'admin';
        if (!isAdmin) return {
            ok: false,
            error: 'Forbidden'
        };
        return {
            ok: true,
            userId
        };
    } catch (e) {
        return {
            ok: false,
            error: e?.message || 'Admin check failed'
        };
    }
}
}),
"[project]/Documents/trae_projects/HYBRID TRADE AI/pages/api/admin/run-cycle.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/HYBRID TRADE AI/lib/supabaseServer.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$backend$2f$profit$2d$engine$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/HYBRID TRADE AI/backend/profit-engine.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$adminAuth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/HYBRID TRADE AI/lib/adminAuth.ts [api] (ecmascript)");
;
;
;
function addDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d;
}
function getPlanRoiPct(planId) {
    const plan = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$backend$2f$profit$2d$engine$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["PLANS"].find((p)=>p.id === planId);
    return plan?.weeklyRoi ?? 0;
}
async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({
        error: 'Method not allowed'
    });
    const admin = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$adminAuth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"])(req);
    if (!admin.ok) return res.status(401).json({
        error: admin.error || 'Unauthorized'
    });
    const serviceFeePct = Number(process.env.SERVICE_FEE_PCT ?? 5);
    const { data: investments, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('investments').select('id,user_id,plan_id,amount_usd,status,created_at').eq('status', 'active');
    if (error) return res.status(500).json({
        error: 'Failed to fetch investments'
    });
    const now = new Date();
    const results = [];
    for (const inv of investments || []){
        const start = new Date(inv.created_at);
        const profitDate = addDays(inv.created_at, 7);
        const maturityDate = addDays(inv.created_at, 14);
        // Check if ROI already credited
        const { data: roiTx } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('transactions').select('id').eq('user_id', inv.user_id).eq('type', 'roi').contains('meta', {
            investment_id: inv.id
        }).limit(1);
        // Credit ROI at day 7
        if (now >= profitDate && (!roiTx || roiTx.length === 0)) {
            const roiPct = getPlanRoiPct(inv.plan_id);
            const gross = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$backend$2f$profit$2d$engine$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["calculateWeeklyROI"])(inv.amount_usd, inv.plan_id);
            const net = Number((gross * (1 - serviceFeePct / 100)).toFixed(2));
            // Upsert USD wallet
            const { data: wallet } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('wallets').select('id,amount').eq('user_id', inv.user_id).eq('currency', 'USD').maybeSingle();
            if (wallet?.id) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('wallets').update({
                    amount: Number(wallet.amount) + net
                }).eq('id', wallet.id);
            } else {
                await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('wallets').insert({
                    user_id: inv.user_id,
                    currency: 'USD',
                    amount: net
                });
            }
            await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('transactions').insert({
                user_id: inv.user_id,
                type: 'roi',
                amount_usd: net,
                meta: {
                    investment_id: inv.id,
                    applied_weekly_roi: roiPct,
                    service_fee_pct: serviceFeePct
                }
            });
            results.push({
                investmentId: inv.id,
                action: 'roi_credited',
                net
            });
        }
        // Release principal at day 14 if not yet released
        const { data: relTx } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('transactions').select('id').eq('user_id', inv.user_id).eq('type', 'principal_release').contains('meta', {
            investment_id: inv.id
        }).limit(1);
        if (now >= maturityDate && (!relTx || relTx.length === 0)) {
            // Credit principal to wallet
            const { data: wallet2 } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('wallets').select('id,amount').eq('user_id', inv.user_id).eq('currency', 'USD').maybeSingle();
            if (wallet2?.id) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('wallets').update({
                    amount: Number(wallet2.amount) + Number(inv.amount_usd)
                }).eq('id', wallet2.id);
            } else {
                await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('wallets').insert({
                    user_id: inv.user_id,
                    currency: 'USD',
                    amount: inv.amount_usd
                });
            }
            await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('transactions').insert({
                user_id: inv.user_id,
                type: 'principal_release',
                amount_usd: inv.amount_usd,
                meta: {
                    investment_id: inv.id
                }
            });
            await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('investments').update({
                status: 'completed'
            }).eq('id', inv.id);
            results.push({
                investmentId: inv.id,
                action: 'principal_released',
                amount: inv.amount_usd
            });
        }
    }
    return res.status(200).json({
        ok: true,
        results
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f1706942._.js.map