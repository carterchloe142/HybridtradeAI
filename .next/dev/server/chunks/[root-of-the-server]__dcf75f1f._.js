module.exports = [
"[externals]/ioredis [external] (ioredis, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("ioredis", () => require("ioredis"));

module.exports = mod;
}),
"[project]/Documents/trae_projects/HYBRID TRADE AI/src/lib/redis.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createRedis",
    ()=>createRedis,
    "duplicate",
    ()=>duplicate,
    "pub",
    ()=>pub,
    "redis",
    ()=>redis,
    "sub",
    ()=>sub
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$ioredis__$5b$external$5d$__$28$ioredis$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/ioredis [external] (ioredis, cjs)");
;
function createRedis(url = process.env.REDIS_URL || 'redis://localhost:6379') {
    const tlsOpts = url.startsWith('rediss://') ? {
        tls: {
            rejectUnauthorized: false
        }
    } : {};
    const client = new __TURBOPACK__imported__module__$5b$externals$5d2f$ioredis__$5b$external$5d$__$28$ioredis$2c$__cjs$29$__["default"](url, tlsOpts);
    client.on('error', ()=>{});
    client.on('connect', ()=>{});
    client.on('ready', ()=>{});
    client.on('end', ()=>{});
    return client;
}
const redis = createRedis();
function duplicate(client) {
    const dup = client.duplicate();
    dup.on('error', ()=>{});
    dup.on('connect', ()=>{});
    dup.on('ready', ()=>{});
    dup.on('end', ()=>{});
    return dup;
}
const pub = duplicate(redis);
const sub = duplicate(redis);
}),
"[project]/Documents/trae_projects/HYBRID TRADE AI/src/lib/sse.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "publish",
    ()=>publish,
    "subscribe",
    ()=>subscribe
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$src$2f$lib$2f$redis$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/HYBRID TRADE AI/src/lib/redis.ts [api] (ecmascript)");
;
async function publish(channel, payload) {
    const data = JSON.stringify(payload);
    await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$src$2f$lib$2f$redis$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["pub"].publish(channel, data);
}
function subscribe(channel, handler, client = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$HYBRID__TRADE__AI$2f$src$2f$lib$2f$redis$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["sub"]) {
    client.subscribe(channel);
    const onMessage = (ch, message)=>{
        if (ch !== channel) return;
        try {
            handler(JSON.parse(message));
        } catch  {
            handler(message);
        }
    };
    client.on('message', onMessage);
    return ()=>{
        client.off('message', onMessage);
        client.unsubscribe(channel);
    };
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__dcf75f1f._.js.map