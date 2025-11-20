module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@supabase/supabase-js", () => require("@supabase/supabase-js"));

module.exports = mod;
}),
"[project]/Documents/trae_projects/HYBRID TRADE AI/lib/supabase.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, cjs)");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://wdlcttgfwoejqynlylpv.supabase.co") || process.env.SUPABASE_URL;
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbGN0dGdmd29lanF5bmx5bHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODE0MzAsImV4cCI6MjA3ODQ1NzQzMH0.UZaY0iYoVRS5MioS5Clg6y_CVNdgzm-3OdB_cwWuB8E") || process.env.SUPABASE_ANON_KEY;
function makeStub() {
    const noop = async ()=>({
            data: null,
            error: new Error('Supabase not configured')
        });
    const auth = {
        getSession: async ()=>({
                data: {
                    session: null
                }
            }),
        onAuthStateChange: ()=>({
                data: {
                    subscription: {
                        unsubscribe: ()=>{}
                    }
                }
            }),
        signUp: async ()=>({
                data: null,
                error: new Error('Supabase not configured')
            }),
        signInWithPassword: async ()=>({
                data: null,
                error: new Error('Supabase not configured')
            })
    };
    const query = {
        select: ()=>({
                eq: ()=>({
                        limit: ()=>({
                                maybeSingle: noop
                            })
                    }),
                maybeSingle: noop
            }),
        upsert: ()=>({
                select: noop
            }),
        eq: ()=>({
                select: noop
            })
    };
    return {
        auth,
        from: ()=>query
    };
}
const supabase = ("TURBOPACK compile-time truthy", 1) ? (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__cjs$29$__["createClient"])(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true
    }
}) : "TURBOPACK unreachable";
}),
"[project]/Documents/trae_projects/HYBRID TRADE AI/pages/api/transparency.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/HYBRID TRADE AI/lib/supabase.ts [api] (ecmascript)");
;
async function handler(req, res) {
    try {
        // Try fetching from optional tables; fallback to demo data if missing
        const { data: reserves, error: rErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from('proof_reserves').select('*').limit(1).maybeSingle();
        const { data: emergency, error: eErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$lib$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from('emergency_fund').select('*').limit(1).maybeSingle();
        const payload = {
            reserves: reserves ? {
                trading_pool_usd: reserves.trading_pool_usd || 0,
                staking_pool_usd: reserves.staking_pool_usd || 0,
                ads_tasks_pool_usd: reserves.ads_tasks_pool_usd || 0,
                cold_wallets: reserves.cold_wallets || [],
                last_updated: reserves.updated_at || null
            } : {
                trading_pool_usd: 1250000,
                staking_pool_usd: 480000,
                ads_tasks_pool_usd: 220000,
                cold_wallets: [
                    {
                        chain: 'BTC',
                        address: 'bc1qexample...'
                    },
                    {
                        chain: 'USDT',
                        address: '0xexample...'
                    }
                ],
                last_updated: null
            },
            emergencyFund: emergency ? {
                balance_usd: emergency.balance_usd || 0,
                policy: emergency.policy || '2–3 months operating runway; used for volatility events.',
                last_updated: emergency.updated_at || null
            } : {
                balance_usd: 150000,
                policy: '2–3 months operating runway; used for volatility events.',
                last_updated: null
            }
        };
        res.status(200).json(payload);
    } catch (err) {
        res.status(200).json({
            reserves: {
                trading_pool_usd: 0,
                staking_pool_usd: 0,
                ads_tasks_pool_usd: 0,
                cold_wallets: [],
                last_updated: null
            },
            emergencyFund: {
                balance_usd: 0,
                policy: 'Unavailable',
                last_updated: null
            },
            error: err?.message || 'Failed to load transparency data'
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5f035c74._.js.map