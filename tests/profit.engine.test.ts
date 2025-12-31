jest.mock('@lib/prisma', () => ({
  __esModule: true,
  default: {
    investment: {
      findMany: jest.fn(async () => [
        { id: 'i1', userId: 'u1', amount: 100, plan: { roiMinPct: 5, slug: 'starter' }, user: { currency: 'USD' } },
        { id: 'i2', userId: 'u2', amount: 200, plan: { roiMinPct: 3.2, slug: 'pro' }, user: { currency: 'USD' } },
      ]),
      aggregate: jest.fn(async () => ({ _sum: { amount: 300 } })),
    },
    reserveBuffer: { upsert: jest.fn(async () => ({})) },
    profitLog: { create: jest.fn(async () => ({})) },
    transaction: { create: jest.fn(async () => ({})) },
    wallet: {
      findUnique: jest.fn(async () => ({ id: 'w1', balance: 0 })),
      update: jest.fn(async () => ({})),
    },
    notification: { create: jest.fn(async () => ({ id: 'n1', type: 'profit', title: '', message: '', createdAt: new Date() })) },
  }
}))

jest.mock('@lib/sse', () => ({ publish: jest.fn(async () => {}) }))

import { runBaselineCycle } from '../src/lib/profit/engine'

describe('profit engine dry-run', () => {
  it('computes totals without side-effects when dryRun is true', async () => {
    const res = await runBaselineCycle({ weekEnding: new Date('2025-01-01'), dryRun: true })
    expect(res.ok).toBe(true)
    expect(res.dryRun).toBe(true)
    expect(res.count).toBe(2)
    expect(res.totalAUM).toBe(300)
    expect(res.totalProfit).toBeGreaterThan(0)
  })
})
