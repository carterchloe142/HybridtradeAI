"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastQueue = void 0;
exports.getBroadcastQueue = getBroadcastQueue;
const bullmq_1 = require("bullmq");
const connection = { url: process.env.REDIS_URL || 'redis://localhost:6379' };
let q = null;
function getBroadcastQueue() {
    if (!q)
        q = new bullmq_1.Queue('broadcast', { connection });
    return q;
}
exports.broadcastQueue = getBroadcastQueue();
