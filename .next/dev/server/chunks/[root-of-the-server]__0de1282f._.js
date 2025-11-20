module.exports = [
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@supabase/supabase-js", () => require("@supabase/supabase-js"));

module.exports = mod;
}),
"[project]/lib/supabaseServer.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabaseServer",
    ()=>supabaseServer,
    "supabaseServiceReady",
    ()=>supabaseServiceReady
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, cjs)");
;
const url = process.env.SUPABASE_URL || ("TURBOPACK compile-time value", "https://wdlcttgfwoejqynlylpv.supabase.co") || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseServiceReady = Boolean(url && serviceKey);
function createDisabledClient() {
    const err = async ()=>{
        throw new Error('supabase_service_not_configured');
    };
    const from = ()=>({
            select: err,
            insert: err,
            update: err,
            delete: err,
            eq: ()=>({
                    select: err,
                    insert: err,
                    update: err,
                    delete: err
                }),
            order: ()=>({
                    select: err
                }),
            range: ()=>({
                    select: err
                }),
            maybeSingle: err
        });
    return {
        auth: {
            getUser: err
        },
        from
    };
}
const supabaseServer = supabaseServiceReady ? (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__cjs$29$__["createClient"])(url, serviceKey) : createDisabledClient();
}),
"[project]/lib/rateLimit.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createRateLimiter",
    ()=>createRateLimiter
]);
const store = new Map();
function getIp(req) {
    const xfwd = req.headers['x-forwarded-for'] || '';
    const ip = xfwd.split(',')[0].trim();
    return ip || req.socket?.remoteAddress || 'unknown';
}
function createRateLimiter(opts) {
    return async function check(req, res, key) {
        const ip = getIp(req);
        const id = `${ip}:${key}`;
        const now = Date.now();
        const hit = store.get(id);
        if (!hit || now > hit.resetAt) {
            store.set(id, {
                count: 1,
                resetAt: now + opts.windowMs
            });
            res.setHeader('X-RateLimit-Remaining', String(opts.max - 1));
            return true;
        }
        if (hit.count >= opts.max) {
            const retryMs = hit.resetAt - now;
            res.setHeader('Retry-After', String(Math.ceil(retryMs / 1000)));
            res.status(429).json({
                error: 'Too many requests'
            });
            return false;
        }
        hit.count += 1;
        store.set(id, hit);
        res.setHeader('X-RateLimit-Remaining', String(opts.max - hit.count));
        return true;
    };
}
}),
"[project]/lib/kyc.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getKycStatus",
    ()=>getKycStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseServer.ts [api] (ecmascript)");
;
async function getKycStatus(userId) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('profiles').select('kyc_status').eq('user_id', userId).maybeSingle();
    if (error) return null;
    return data?.kyc_status ?? null;
}
}),
"[externals]/zod [external] (zod, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("zod");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/pages/api/withdraw.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseServer.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rateLimit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rateLimit.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kyc$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/kyc.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const WithdrawSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$29$__["z"].object({
    userId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$29$__["z"].string().min(1),
    amount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$29$__["z"].number().positive(),
    currency: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$29$__["z"].enum([
        'USD',
        'EUR',
        'NGN',
        'BTC',
        'ETH'
    ]),
    cycleActive: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$29$__["z"].boolean().optional()
});
async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({
        error: 'Method not allowed'
    });
    const limiter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rateLimit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createRateLimiter"])({
        windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15_000),
        max: Number(process.env.RATE_LIMIT_MAX ?? 20)
    });
    const ok = await limiter(req, res, 'withdraw');
    if (!ok) return;
    const parsed = WithdrawSchema.safeParse(req.body || {});
    if (!parsed.success) return res.status(400).json({
        error: 'Invalid payload',
        issues: parsed.error.issues
    });
    const { userId, amount, currency, cycleActive } = parsed.data;
    // Enforce KYC approval before any withdrawal
    const kyc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kyc$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getKycStatus"])(userId);
    if (kyc !== 'approved') return res.status(403).json({
        error: 'KYC required. Please complete verification.'
    });
    // Enforce waiting period if investment cycle is ongoing
    if (cycleActive) return res.status(400).json({
        error: 'Withdrawal blocked: cycle in progress. Try after distribution.'
    });
    // Large withdrawal hold policy
    const holdThreshold = Number(process.env.WITHDRAW_HOLD_THRESHOLD_USD ?? 2000);
    if (Number(amount) > holdThreshold) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('transactions').insert({
            user_id: userId,
            type: 'withdraw_request',
            amount_usd: amount,
            meta: {
                currency,
                status: 'pending',
                reason: 'large_withdrawal_hold'
            }
        });
        return res.status(202).json({
            ok: true,
            message: 'Withdrawal request submitted and pending admin approval.'
        });
    }
    // Fetch wallet
    const { data: wallet, error: wErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('wallets').select('id,amount').eq('user_id', userId).eq('currency', currency).maybeSingle();
    if (wErr) return res.status(500).json({
        error: 'Wallet fetch failed'
    });
    if (!wallet || Number(wallet.amount) < Number(amount)) return res.status(400).json({
        error: 'Insufficient balance'
    });
    const { error: updErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('wallets').update({
        amount: Number(wallet.amount) - Number(amount)
    }).eq('id', wallet.id);
    if (updErr) return res.status(500).json({
        error: 'Failed to update wallet'
    });
    const { error: txErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('transactions').insert({
        user_id: userId,
        type: 'withdraw',
        amount_usd: amount,
        meta: {
            currency
        }
    });
    if (txErr) return res.status(500).json({
        error: 'Failed to record withdrawal'
    });
    return res.status(200).json({
        ok: true,
        message: `Withdrawal of ${amount} ${currency} recorded.`
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0de1282f._.js.map