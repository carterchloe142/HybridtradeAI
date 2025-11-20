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
"[project]/lib/adminAuth.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "requireAdmin",
    ()=>requireAdmin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseServer.ts [api] (ecmascript)");
;
async function requireAdmin(req) {
    try {
        const auth = String(req.headers.authorization || '');
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
        if (!token) return {
            ok: false,
            error: 'Missing Authorization bearer token'
        };
        const { data: userData, error: userErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].auth.getUser(token);
        if (userErr || !userData?.user?.id) return {
            ok: false,
            error: 'Invalid token'
        };
        const userId = userData.user.id;
        const { data: profile, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('profiles').select('role,is_admin').eq('user_id', userId).maybeSingle();
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
"[project]/pages/api/admin/kyc.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rateLimit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rateLimit.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$adminAuth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/adminAuth.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseServer.ts [api] (ecmascript)");
;
;
;
const limiter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rateLimit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createRateLimiter"])({
    windowMs: 60_000,
    max: 20
});
async function handler(req, res) {
    const admin = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$adminAuth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"])(req);
    if (!admin.ok) return res.status(401).json({
        error: admin.error || 'unauthorized'
    });
    if (req.method === 'GET') {
        const userId = String(req.query?.userId || '');
        const files = String(req.query?.files || '') === '1';
        if (files && userId) {
            try {
                const bucket = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].storage.from('kyc');
                const listRes = await bucket.list(userId, {
                    limit: 20
                });
                const entries = Array.isArray(listRes.data) ? listRes.data : [];
                const nameStartsWith = (p)=>entries.find((e)=>String(e.name).startsWith(p));
                const idEntry = nameStartsWith('id');
                const selfieNeutral = nameStartsWith('selfie_neutral');
                const selfieSmile = nameStartsWith('selfie_smile');
                const selfieLeft = nameStartsWith('selfie_left');
                const selfieRight = nameStartsWith('selfie_right');
                const dataEntry = entries.find((e)=>String(e.name) === 'data.json');
                async function signed(path) {
                    if (!path) return undefined;
                    const s = await bucket.createSignedUrl(`${userId}/${path}`, 3600);
                    return s.data?.signedUrl;
                }
                const idUrl = idEntry ? await signed(idEntry.name) : undefined;
                const neutralUrl = await signed(selfieNeutral?.name);
                const smileUrl = await signed(selfieSmile?.name);
                const leftUrl = await signed(selfieLeft?.name);
                const rightUrl = await signed(selfieRight?.name);
                let details = null;
                if (dataEntry) {
                    const { data: download } = await bucket.download(`${userId}/data.json`);
                    if (download) {
                        const txt = await download.text();
                        try {
                            details = JSON.parse(txt);
                        } catch  {
                            details = {
                                raw: txt
                            };
                        }
                    }
                }
                return res.json({
                    ok: true,
                    files: {
                        idUrl,
                        neutralUrl,
                        smileUrl,
                        leftUrl,
                        rightUrl
                    },
                    details
                });
            } catch (e) {
                return res.status(500).json({
                    error: e?.message || 'files_failed'
                });
            }
        }
        // Fetch without email first to avoid schema differences
        const base = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('profiles').select('*');
        if (base.error) return res.status(500).json({
            error: base.error.message || 'list_failed'
        });
        const items = base.data || [];
        // Enrich with email via Admin API
        try {
            const adminRes = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].auth?.admin?.listUsers?.({
                page: 1,
                perPage: 1000
            });
            const users = adminRes?.data?.users || adminRes?.users || [];
            const map = new Map();
            for (const u of users){
                const id = String(u?.id || '');
                const email = String(u?.email || '');
                if (id && email) map.set(id, email);
            }
            for (const it of items){
                const email = map.get(String(it.user_id)) || null;
                it.email = email;
            }
        } catch  {}
        return res.json({
            ok: true,
            items
        });
    }
    if (req.method !== 'PATCH') return res.status(405).json({
        error: 'method_not_allowed'
    });
    if (!await limiter(req, res, 'admin-kyc')) return;
    const userId = String(req.body?.userId || '');
    const status = String(req.body?.status || '').toLowerCase();
    const levelRaw = req.body?.level;
    const level = typeof levelRaw === 'number' ? levelRaw : undefined;
    if (!userId || ![
        'approved',
        'rejected',
        'pending'
    ].includes(status)) return res.status(400).json({
        error: 'invalid_payload'
    });
    const now = new Date().toISOString();
    const minimal = {
        kyc_status: status
    };
    const optional = {
        kyc_decision_at: now
    };
    if (status === 'rejected') optional.kyc_reject_reason = String(req.body?.reason || '');
    if (typeof level === 'number') optional.kyc_level = level;
    // First: minimal update by user_id
    let u = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('profiles').update(minimal).eq('user_id', userId).select('user_id').maybeSingle();
    if (!u.error && u.data) {
        // best-effort optional fields
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('profiles').update(optional).eq('user_id', userId);
        return res.json({
            ok: true
        });
    }
    // No 'id' column in this schema; skip id-based update
    // If still failing, attempt full object by user_id, then by id
    const full = {
        ...minimal,
        ...optional
    };
    let f = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('profiles').update(full).eq('user_id', userId).select('user_id').maybeSingle();
    if (!f.error && f.data) return res.json({
        ok: true
    });
    const errMsg = u.error?.message || f.error?.message || 'update_failed';
    return res.status(500).json({
        error: errMsg
    });
}
const config = {
    api: {
        bodyParser: true
    }
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__546b4965._.js.map