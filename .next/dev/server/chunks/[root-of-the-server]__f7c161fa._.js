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
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!url || !serviceKey) {
    // Fail fast in server context: admin APIs need service role to bypass RLS
    throw new Error('Supabase server client misconfigured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}
const supabaseServer = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__cjs$29$__["createClient"])(url, serviceKey);
}),
"[project]/Documents/trae_projects/HYBRID TRADE AI/pages/api/user/wallets.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/HYBRID TRADE AI/lib/supabaseServer.ts [api] (ecmascript)");
;
async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({
        error: 'method_not_allowed'
    });
    try {
        const auth = String(req.headers.authorization || '');
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
        if (!token) return res.status(401).json({
            error: 'missing_token'
        });
        const { data: userData, error: userErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].auth.getUser(token);
        if (userErr || !userData?.user?.id) return res.status(401).json({
            error: 'invalid_token'
        });
        const userId = userData.user.id;
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabaseServer$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabaseServer"].from('wallets').select('id,user_id,currency,balance').eq('user_id', userId);
        if (error) {
            console.error('wallets api error', error);
            return res.status(500).json({
                error: 'wallets_fetch_failed'
            });
        }
        return res.json({
            wallets: data ?? []
        });
    } catch (e) {
        console.error('wallets api error', e);
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

//# sourceMappingURL=%5Broot-of-the-server%5D__f7c161fa._.js.map