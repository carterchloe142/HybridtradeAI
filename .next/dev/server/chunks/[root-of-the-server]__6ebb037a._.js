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
"[project]/pages/api/admin/storage/kyc-init.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$adminAuth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/adminAuth.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseServer.ts [api] (ecmascript)");
;
;
async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({
        error: 'method_not_allowed'
    });
    const admin = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$adminAuth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"])(req);
    if (!admin.ok) return res.status(401).json({
        error: admin.error || 'unauthorized'
    });
    try {
        const name = 'kyc';
        const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].storage.getBucket?.(name);
        if (existing?.data?.name === name) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].storage.updateBucket?.(name, {
                public: false,
                fileSizeLimit: '10MB',
                allowedMimeTypes: [
                    'image/jpeg',
                    'image/png',
                    'application/pdf',
                    'application/json',
                    'text/plain'
                ]
            });
            return res.json({
                ok: true,
                bucket: name,
                updated: true
            });
        }
        const created = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].storage.createBucket?.(name, {
            public: false,
            fileSizeLimit: '10MB',
            allowedMimeTypes: [
                'image/jpeg',
                'image/png',
                'application/pdf',
                'application/json',
                'text/plain'
            ]
        });
        if (created?.error) return res.status(500).json({
            error: String(created.error.message || 'create_failed')
        });
        return res.json({
            ok: true,
            bucket: name,
            created: true
        });
    } catch (e) {
        return res.status(500).json({
            error: e?.message || 'server_error'
        });
    }
}
const config = {
    api: {
        bodyParser: false
    }
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6ebb037a._.js.map