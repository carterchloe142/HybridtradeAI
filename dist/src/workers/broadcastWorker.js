"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBroadcastWorker = startBroadcastWorker;
const bullmq_1 = require("bullmq");
// dynamic imports inside functions to avoid top-level crashes in tests/envs
const connection = { url: process.env.REDIS_URL || 'redis://localhost:6379' };
function logToRedis(client, jobId, entry) {
    try {
        client.lpush(`job_logs:broadcast:${jobId}`, JSON.stringify(entry));
        client.ltrim(`job_logs:broadcast:${jobId}`, 0, 500);
    }
    catch { }
}
async function processJob(job) {
    const { createClient } = await Promise.resolve().then(() => __importStar(require('../lib/redis')));
    const client = createClient();
    const jobId = String(job.id);
    try {
        logToRedis(client, jobId, { ts: Date.now(), status: 'started', data: job.data });
        const globalNotificationId = job.data?.globalNotificationId;
        if (!globalNotificationId)
            throw new Error('missing globalNotificationId');
        const { default: prisma } = await Promise.resolve().then(() => __importStar(require('../lib/prisma')));
        const g = await prisma.globalNotification.findUnique({ where: { id: globalNotificationId } });
        if (!g)
            throw new Error('global notification not found');
        const batchSize = 500;
        let cursor = null;
        let processed = 0;
        while (true) {
            const users = await prisma.user.findMany({
                select: { id: true },
                orderBy: { id: 'asc' },
                take: batchSize,
                ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            });
            if (!users.length)
                break;
            const { publish } = await Promise.resolve().then(() => __importStar(require('../lib/sse')));
            for (const u of users) {
                const note = await prisma.notification.create({ data: { userId: u.id, type: g.type, title: g.title, message: g.message } });
                await prisma.notificationDelivery.create({ data: { globalNotificationId: g.id, userId: u.id } });
                await publish(`user:${u.id}`, { id: note.id, type: note.type, title: note.title, message: note.message, createdAt: note.createdAt });
                processed += 1;
                if (processed % 100 === 0)
                    logToRedis(client, jobId, { ts: Date.now(), status: 'progress', processed });
            }
            cursor = users[users.length - 1].id;
            if (users.length < batchSize)
                break;
        }
        logToRedis(client, jobId, { ts: Date.now(), status: 'completed', processed });
        client.disconnect();
        return { ok: true, processed };
    }
    catch (err) {
        logToRedis(createClient(), jobId, { ts: Date.now(), status: 'failed', error: String(err) });
        throw err;
    }
}
let worker = null;
function startBroadcastWorker() {
    if (worker)
        return worker;
    if (process.env.NODE_ENV === 'test')
        return null;
    worker = new bullmq_1.Worker('broadcast', async (job) => processJob(job), { connection });
    worker.on('failed', (job, err) => console.error('broadcast job failed', job?.id, err));
    return worker;
}
if (process.env.NODE_ENV !== 'test' && process.env.START_BROADCAST_WORKER === '1') {
    startBroadcastWorker();
}
exports.default = startBroadcastWorker;
