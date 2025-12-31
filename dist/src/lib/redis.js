"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sub = exports.pub = exports.redis = void 0;
exports.createClient = createClient;
exports.duplicate = duplicate;
exports.createSubscriber = createSubscriber;
const ioredis_1 = __importDefault(require("ioredis"));
function createClient(url = process.env.REDIS_URL || 'redis://localhost:6379') {
    const tlsOpts = url.startsWith('rediss://') ? { tls: { rejectUnauthorized: false } } : {};
    const client = new ioredis_1.default(url, tlsOpts);
    client.on('error', () => { });
    client.on('connect', () => { });
    client.on('ready', () => { });
    client.on('end', () => { });
    return client;
}
exports.redis = createClient();
function duplicate(client) {
    const dup = client.duplicate();
    dup.on('error', () => { });
    dup.on('connect', () => { });
    dup.on('ready', () => { });
    dup.on('end', () => { });
    return dup;
}
exports.pub = duplicate(exports.redis);
exports.sub = duplicate(exports.redis);
function createSubscriber(url = process.env.REDIS_URL || 'redis://localhost:6379') {
    return duplicate(createClient(url));
}
