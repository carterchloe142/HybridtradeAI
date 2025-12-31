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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBaselineCycle = runBaselineCycle;
exports.runStreamDistribution = runStreamDistribution;
const prisma_1 = __importDefault(require("@lib/prisma"));
const sse_1 = require("@lib/sse");
const Sentry = __importStar(require("@sentry/node"));
const logger_1 = require("../observability/logger");
function toDate(value) {
    return typeof value === 'string' ? new Date(value) : value;
}
function feePct() {
    const v = Number(process.env.SERVICE_FEE_PCT || process.env.SERVICE_FEE_PCT?.toString() || '0');
    return Math.max(0, v);
}
async function upsertReserveBuffer(currentAmountDelta, totalAUM) {
    await prisma_1.default.reserveBuffer.upsert({
        where: { id: 'main' },
        create: { id: 'main', currentAmount: currentAmountDelta, totalAUM },
        update: { currentAmount: { increment: currentAmountDelta }, totalAUM },
    });
}
async function runBaselineCycle(input) {
    const week = toDate(input.weekEnding);
    const active = await prisma_1.default.investment.findMany({
        where: { status: 'ACTIVE', OR: [{ maturedAt: null }, { maturedAt: { gt: week } }] },
        include: { plan: true, user: true },
    });
    const f = feePct();
    let totalProfit = 0;
    for (const inv of active) {
        const roi = Number(inv.plan.roiMinPct);
        const gross = Number(inv.amount) * roi / 100;
        const net = gross * (1 - f / 100);
        totalProfit += net;
    }
    const totalAUM = await prisma_1.default.investment.aggregate({ _sum: { amount: true }, where: { status: 'ACTIVE' } });
    if (input.dryRun) {
        (0, logger_1.logInfo)('profit_engine.baseline.dry_run', { count: active.length, totalProfit, totalAUM: Number(totalAUM._sum.amount || 0) });
        return { ok: true, totalProfit, totalAUM: Number(totalAUM._sum.amount || 0), count: active.length, dryRun: true };
    }
    let created = 0;
    let creditedProfit = 0;
    for (const inv of active) {
        const roi = Number(inv.plan.roiMinPct);
        const gross = Number(inv.amount) * roi / 100;
        const net = gross * (1 - f / 100);
        try {
            await prisma_1.default.profitLog.create({ data: { investmentId: inv.id, amount: net, weekEnding: week } });
        }
        catch (e) {
            if (e.code === 'P2002')
                continue;
            (0, logger_1.logError)('profit_engine.baseline.error', { investmentId: inv.id, step: 'create_profit_log', error: e?.message });
            Sentry.captureException(e);
            throw e;
        }
        await prisma_1.default.transaction.create({ data: { userId: inv.userId, investmentId: inv.id, type: 'PROFIT', amount: net, status: 'COMPLETED', metadata: { weekEnding: week } } });
        const currency = String(inv.user.currency || 'USD');
        const wallet = await prisma_1.default.wallet.findUnique({ where: { userId_currency: { userId: inv.userId, currency } } });
        if (wallet)
            await prisma_1.default.wallet.update({ where: { id: wallet.id }, data: { balance: Number(wallet.balance) + net } });
        try {
            const n = await prisma_1.default.notification.create({ data: { userId: inv.userId, type: 'profit', title: 'Weekly ROI', message: `Credited ${net.toFixed(2)}`, read: false } });
            await (0, sse_1.publish)(`user:${String(inv.userId)}`, { id: n.id, type: n.type, title: n.title, message: n.message, createdAt: n.createdAt });
        }
        catch { }
        created++;
        creditedProfit += net;
    }
    await upsertReserveBuffer(creditedProfit, Number(totalAUM._sum.amount || 0));
    (0, logger_1.logInfo)('profit_engine.baseline.complete', { count: created, totalProfit, totalAUM: Number(totalAUM._sum.amount || 0) });
    return { ok: true, totalProfit, totalAUM: Number(totalAUM._sum.amount || 0), count: created };
}
async function runStreamDistribution(input) {
    const week = toDate(input.weekEnding);
    const perf = input.performance || {};
    const active = await prisma_1.default.investment.findMany({
        where: { status: 'ACTIVE', OR: [{ maturedAt: null }, { maturedAt: { gt: week } }] },
        include: { plan: true, user: true },
    });
    const f = feePct();
    let totalProfit = 0;
    for (const inv of active) {
        const slug = inv.plan.slug;
        const roi = Number(perf[slug] ?? 0);
        const gross = Number(inv.amount) * roi / 100;
        const net = gross * (1 - f / 100);
        totalProfit += net;
    }
    const totalAUM = await prisma_1.default.investment.aggregate({ _sum: { amount: true }, where: { status: 'ACTIVE' } });
    if (input.dryRun) {
        (0, logger_1.logInfo)('profit_engine.stream.dry_run', { count: active.length, totalProfit, totalAUM: Number(totalAUM._sum.amount || 0) });
        return { ok: true, totalProfit, totalAUM: Number(totalAUM._sum.amount || 0), count: active.length, dryRun: true };
    }
    let created = 0;
    let creditedProfit = 0;
    for (const inv of active) {
        const roi = Number(perf[inv.plan.slug] ?? 0);
        const gross = Number(inv.amount) * roi / 100;
        const net = gross * (1 - f / 100);
        try {
            await prisma_1.default.profitLog.create({ data: { investmentId: inv.id, amount: net, weekEnding: week } });
        }
        catch (e) {
            if (e.code === 'P2002')
                continue;
            (0, logger_1.logError)('profit_engine.stream.error', { investmentId: inv.id, step: 'create_profit_log', error: e?.message });
            Sentry.captureException(e);
            throw e;
        }
        await prisma_1.default.transaction.create({ data: { userId: inv.userId, investmentId: inv.id, type: 'PROFIT', amount: net, status: 'COMPLETED', metadata: { weekEnding: week } } });
        const currency = String(inv.user.currency || 'USD');
        const wallet = await prisma_1.default.wallet.findUnique({ where: { userId_currency: { userId: inv.userId, currency } } });
        if (wallet)
            await prisma_1.default.wallet.update({ where: { id: wallet.id }, data: { balance: Number(wallet.balance) + net } });
        try {
            const n = await prisma_1.default.notification.create({ data: { userId: inv.userId, type: 'profit', title: 'Performance ROI', message: `Credited ${net.toFixed(2)}`, read: false } });
            await (0, sse_1.publish)(`user:${String(inv.userId)}`, { id: n.id, type: n.type, title: n.title, message: n.message, createdAt: n.createdAt });
        }
        catch { }
        created++;
        creditedProfit += net;
    }
    await upsertReserveBuffer(creditedProfit, Number(totalAUM._sum.amount || 0));
    (0, logger_1.logInfo)('profit_engine.stream.complete', { count: created, totalProfit, totalAUM: Number(totalAUM._sum.amount || 0) });
    return { ok: true, totalProfit, totalAUM: Number(totalAUM._sum.amount || 0), count: created };
}
