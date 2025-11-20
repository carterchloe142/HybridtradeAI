import prisma from '@lib/prisma'
import { publish } from '@lib/sse'
import * as Sentry from '@sentry/node'
import { logInfo, logError } from '../observability/logger'

type BaselineInput = { weekEnding: string | Date; dryRun?: boolean }
type StreamInput = { weekEnding: string | Date; performance: Record<string, number>; dryRun?: boolean }

function toDate(value: string | Date) {
  return typeof value === 'string' ? new Date(value) : value
}

function feePct() {
  const v = Number(process.env.SERVICE_FEE_PCT || process.env.SERVICE_FEE_PCT?.toString() || '0')
  return Math.max(0, v)
}

async function upsertReserveBuffer(currentAmountDelta: number, totalAUM: number) {
  await prisma.reserveBuffer.upsert({
    where: { id: 'main' },
    create: { id: 'main', currentAmount: currentAmountDelta, totalAUM },
    update: { currentAmount: { increment: currentAmountDelta }, totalAUM },
  })
}

export async function runBaselineCycle(input: BaselineInput) {
  const week = toDate(input.weekEnding)
  const active = await prisma.investment.findMany({
    where: { status: 'ACTIVE', OR: [{ maturedAt: null }, { maturedAt: { gt: week } }] },
    include: { plan: true, user: true },
  })
  const f = feePct()
  let totalProfit = 0
  for (const inv of active) {
    const roi = Number(inv.plan.roiMinPct)
    const gross = Number(inv.amount) * roi / 100
    const net = gross * (1 - f / 100)
    totalProfit += net
  }
  const totalAUM = await prisma.investment.aggregate({ _sum: { amount: true }, where: { status: 'ACTIVE' } })
  if (input.dryRun) {
    logInfo('profit_engine.baseline.dry_run', { count: active.length, totalProfit, totalAUM: Number(totalAUM._sum.amount || 0) })
    return { ok: true, totalProfit, totalAUM: Number(totalAUM._sum.amount || 0), count: active.length, dryRun: true }
  }
  let created = 0
  let creditedProfit = 0
  for (const inv of active) {
    const roi = Number(inv.plan.roiMinPct)
    const gross = Number(inv.amount) * roi / 100
    const net = gross * (1 - f / 100)
    try {
      await prisma.profitLog.create({ data: { investmentId: inv.id, amount: net, weekEnding: week } })
    } catch (e: any) {
      if ((e as any).code === 'P2002') continue
      logError('profit_engine.baseline.error', { investmentId: inv.id, step: 'create_profit_log', error: e?.message })
      Sentry.captureException(e)
      throw e
    }
    await prisma.transaction.create({ data: { userId: inv.userId, investmentId: inv.id, type: 'PROFIT', amount: net, status: 'COMPLETED', metadata: { weekEnding: week } } })
    const currency = String((inv.user as any).currency || 'USD')
    const wallet = await prisma.wallet.findUnique({ where: { userId_currency: { userId: inv.userId, currency } } })
    if (wallet) await prisma.wallet.update({ where: { id: wallet.id }, data: { balance: Number(wallet.balance) + net } })
    try {
      const n = await prisma.notification.create({ data: { userId: inv.userId, type: 'profit', title: 'Weekly ROI', message: `Credited ${net.toFixed(2)}`, read: false } })
      await publish(`user:${String(inv.userId)}`, { id: n.id, type: n.type, title: n.title, message: n.message, createdAt: n.createdAt })
    } catch {}
    created++
    creditedProfit += net
  }
  await upsertReserveBuffer(creditedProfit, Number(totalAUM._sum.amount || 0))
  logInfo('profit_engine.baseline.complete', { count: created, totalProfit, totalAUM: Number(totalAUM._sum.amount || 0) })
  return { ok: true, totalProfit, totalAUM: Number(totalAUM._sum.amount || 0), count: created }
}

export async function runStreamDistribution(input: StreamInput) {
  const week = toDate(input.weekEnding)
  const perf = input.performance || {}
  const active = await prisma.investment.findMany({
    where: { status: 'ACTIVE', OR: [{ maturedAt: null }, { maturedAt: { gt: week } }] },
    include: { plan: true, user: true },
  })
  const f = feePct()
  let totalProfit = 0
  for (const inv of active) {
    const slug = inv.plan.slug
    const roi = Number(perf[slug] ?? 0)
    const gross = Number(inv.amount) * roi / 100
    const net = gross * (1 - f / 100)
    totalProfit += net
  }
  const totalAUM = await prisma.investment.aggregate({ _sum: { amount: true }, where: { status: 'ACTIVE' } })
  if (input.dryRun) {
    logInfo('profit_engine.stream.dry_run', { count: active.length, totalProfit, totalAUM: Number(totalAUM._sum.amount || 0) })
    return { ok: true, totalProfit, totalAUM: Number(totalAUM._sum.amount || 0), count: active.length, dryRun: true }
  }
  let created = 0
  let creditedProfit = 0
  for (const inv of active) {
    const roi = Number(perf[inv.plan.slug] ?? 0)
    const gross = Number(inv.amount) * roi / 100
    const net = gross * (1 - f / 100)
    try {
      await prisma.profitLog.create({ data: { investmentId: inv.id, amount: net, weekEnding: week } })
    } catch (e: any) {
      if ((e as any).code === 'P2002') continue
      logError('profit_engine.stream.error', { investmentId: inv.id, step: 'create_profit_log', error: e?.message })
      Sentry.captureException(e)
      throw e
    }
    await prisma.transaction.create({ data: { userId: inv.userId, investmentId: inv.id, type: 'PROFIT', amount: net, status: 'COMPLETED', metadata: { weekEnding: week } } })
    const currency = String((inv.user as any).currency || 'USD')
    const wallet = await prisma.wallet.findUnique({ where: { userId_currency: { userId: inv.userId, currency } } })
    if (wallet) await prisma.wallet.update({ where: { id: wallet.id }, data: { balance: Number(wallet.balance) + net } })
    try {
      const n = await prisma.notification.create({ data: { userId: inv.userId, type: 'profit', title: 'Performance ROI', message: `Credited ${net.toFixed(2)}`, read: false } })
      await publish(`user:${String(inv.userId)}`, { id: n.id, type: n.type, title: n.title, message: n.message, createdAt: n.createdAt })
    } catch {}
    created++
    creditedProfit += net
  }
  await upsertReserveBuffer(creditedProfit, Number(totalAUM._sum.amount || 0))
  logInfo('profit_engine.stream.complete', { count: created, totalProfit, totalAUM: Number(totalAUM._sum.amount || 0) })
  return { ok: true, totalProfit, totalAUM: Number(totalAUM._sum.amount || 0), count: created }
}
