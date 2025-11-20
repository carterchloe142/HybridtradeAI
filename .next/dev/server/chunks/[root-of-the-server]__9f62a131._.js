module.exports = [
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
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
"[project]/pages/api/kyc/submit.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rateLimit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rateLimit.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseServer.ts [api] (ecmascript)");
;
;
const limiter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rateLimit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createRateLimiter"])({
    windowMs: 60_000,
    max: 10
});
async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({
        error: 'method_not_allowed'
    });
    if (!await limiter(req, res, 'kyc-submit')) return;
    try {
        const auth = String(req.headers.authorization || '');
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
        if (!token) return res.status(401).json({
            error: 'unauthorized'
        });
        const { data: userData, error: userErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].auth.getUser(token);
        if (userErr || !userData?.user?.id) return res.status(401).json({
            error: 'invalid_token'
        });
        const userId = String(userData.user.id);
        const levelRaw = req.body?.level;
        const level = typeof levelRaw === 'number' ? levelRaw : 1;
        const now = new Date().toISOString();
        const base = {
            user_id: userId,
            kyc_status: 'pending',
            kyc_submitted_at: now
        };
        const full = typeof level === 'number' ? {
            ...base,
            kyc_level: level
        } : base;
        const minimal = {
            user_id: userId,
            kyc_status: 'pending'
        };
        let upsert = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('profiles').upsert(full, {
            onConflict: 'user_id'
        }).select('user_id').maybeSingle();
        if (!upsert.error && upsert.data) return res.json({
            ok: true
        });
        upsert = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('profiles').upsert(base, {
            onConflict: 'user_id'
        }).select('user_id').maybeSingle();
        if (!upsert.error && upsert.data) return res.json({
            ok: true
        });
        upsert = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('profiles').upsert(minimal, {
            onConflict: 'user_id'
        }).select('user_id').maybeSingle();
        if (!upsert.error && upsert.data) return res.json({
            ok: true
        });
        let tryUpdateUser = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('profiles').update(full).eq('user_id', userId).select('user_id').maybeSingle();
        if (!tryUpdateUser.error && tryUpdateUser.data) return res.json({
            ok: true
        });
        tryUpdateUser = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('profiles').update(base).eq('user_id', userId).select('user_id').maybeSingle();
        if (!tryUpdateUser.error && tryUpdateUser.data) return res.json({
            ok: true
        });
        tryUpdateUser = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('profiles').update(minimal).eq('user_id', userId).select('user_id').maybeSingle();
        if (!tryUpdateUser.error && tryUpdateUser.data) return res.json({
            ok: true
        });
        // Skip update by primary key 'id' — not present in this schema
        let insert = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('profiles').insert(full).select('user_id').maybeSingle();
        if (!insert.error && insert.data) return res.json({
            ok: true
        });
        insert = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('profiles').insert(base).select('user_id').maybeSingle();
        if (!insert.error && insert.data) return res.json({
            ok: true
        });
        insert = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('profiles').insert(minimal).select('user_id').maybeSingle();
        if (!insert.error && insert.data) return res.json({
            ok: true
        });
        const message = upsert.error?.message || tryUpdateUser.error?.message || insert.error?.message || 'unknown';
        return res.status(500).json({
            error: `submit_failed:${message}`
        });
    } catch (e) {
        return res.status(500).json({
            error: e?.message || 'server_error'
        });
    }
}
const config = {
    api: {
        bodyParser: true
    }
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9f62a131._.js.map