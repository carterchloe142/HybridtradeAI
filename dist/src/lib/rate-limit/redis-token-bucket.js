"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRateLimit = exports.adminRateLimit = void 0;
exports.createTokenBucket = createTokenBucket;
const lua = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local tokens = tonumber(ARGV[2])
local capacity = tonumber(ARGV[3])
local refillRate = tonumber(ARGV[4])
local bucket = redis.call('HMGET', key, 'tokens', 'timestamp')
local current = tonumber(bucket[1])
local ts = tonumber(bucket[2])
if current == nil then current = capacity end
if ts == nil then ts = now end
local delta = math.max(0, now - ts)
local refill = delta * refillRate
current = math.min(capacity, current + refill)
local allowed = 0
if current >= tokens then
  current = current - tokens
  allowed = 1
end
redis.call('HMSET', key, 'tokens', current, 'timestamp', now)
redis.call('EXPIRE', key, 3600)
return {allowed, current}
`;
function createTokenBucket(opts) {
    let sha = null;
    async function allow(key, tokens = 1) {
        const k = `${opts.keyPrefix}${key}`;
        const now = Math.floor(Date.now() / 1000);
        if (!sha) {
            try {
                sha = (await opts.redis.script('LOAD', lua));
            }
            catch {
                sha = null;
            }
        }
        try {
            const res = await (sha
                ? opts.redis.evalsha(sha, 1, k, now, tokens, opts.capacity, opts.refillPerSecond)
                : opts.redis.eval(lua, 1, k, now, tokens, opts.capacity, opts.refillPerSecond));
            const allowed = Array.isArray(res) ? Number(res[0]) === 1 : Number(res) === 1;
            return allowed;
        }
        catch {
            return false;
        }
    }
    return { allow };
}
const redis_1 = require("../redis");
exports.adminRateLimit = createTokenBucket({
    redis: redis_1.redis,
    keyPrefix: 'rl:admin:',
    capacity: 60,
    refillPerSecond: 1,
});
exports.userRateLimit = createTokenBucket({
    redis: redis_1.redis,
    keyPrefix: 'rl:user:',
    capacity: 30,
    refillPerSecond: 1,
});
