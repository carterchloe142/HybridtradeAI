module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/zod [external] (zod, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("zod");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
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
"[project]/Documents/trae_projects/HYBRID TRADE AI/pages/api/admin/users/promote.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/HYBRID TRADE AI/lib/supabaseServer.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$adminAuth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/HYBRID TRADE AI/lib/adminAuth.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const BodySchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$29$__["z"].object({
    userId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$29$__["z"].string().uuid()
});
async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({
        error: 'Method not allowed'
    });
    const admin = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$adminAuth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"])(req);
    if (!admin.ok) return res.status(401).json({
        error: admin.error || 'Unauthorized'
    });
    const parse = BodySchema.safeParse(req.body || {});
    if (!parse.success) return res.status(400).json({
        error: 'Invalid payload',
        issues: parse.error.issues
    });
    const { userId } = parse.data;
    try {
        const payload = {
            user_id: userId,
            role: 'admin',
            is_admin: true
        };
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('profiles').upsert(payload, {
            onConflict: 'user_id'
        }).select().maybeSingle();
        if (error) return res.status(500).json({
            ok: false,
            error: 'Failed to promote user',
            details: error.message
        });
        return res.status(200).json({
            ok: true,
            profile: data
        });
    } catch (e) {
        return res.status(500).json({
            ok: false,
            error: e?.message || 'Promotion failed'
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7027fd0c._.js.map