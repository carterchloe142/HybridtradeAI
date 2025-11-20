import { runBaselineCycle, runStreamDistribution } from '@lib/profit/engine'

jest.mock('@lib/prisma', () => {
  const investments = [
    { id: 'i1', userId: 'u1', amount: 100, plan: { slug: 'starter', roiMinPct: 4 }, user: { currency: 'USD' }, status: 'ACTIVE' },
    { id: 'i2', userId: 'u2', amount: 200, plan: { slug: 'pro', roiMinPct: 4 }, user: { currency: 'USD' }, status: 'ACTIVE' },
  ]
  return {
    __esModule: true,
    default: {
      investment: {
        findMany: jest.fn(async () => investments),
        aggregate: jest.fn(async () => ({ _sum: { amount: investments.reduce((a, b) => a + b.amount, 0) } })),
      },
      profitLog: { create: jest.fn() },
      transaction: { create: jest.fn() },
      wallet: { findUnique: jest.fn(), update: jest.fn() },
      notification: { create: jest.fn() },
      reserveBuffer: { upsert: jest.fn() },
    },
  }
})
jest.mock('@lib/prisma', () => {
  const investments = [
    { id: 'i1', userId: 'u1', amount: 100, plan: { slug: 'starter', roiMinPct: 4 }, user: { currency: 'USD' }, status: 'ACTIVE' },
    { id: 'i2', userId: 'u2', amount: 200, plan: { slug: 'pro', roiMinPct: 4 }, user: { currency: 'USD' }, status: 'ACTIVE' },
  ]
  return {
    __esModule: true,
    default: {
      investment: {
        findMany: jest.fn(async () => investments),
        aggregate: jest.fn(async () => ({ _sum: { amount: investments.reduce((a, b) => a + b.amount, 0) } })),
      },
      profitLog: { create: jest.fn() },
      transaction: { create: jest.fn() },
      wallet: { findUnique: jest.fn(), update: jest.fn() },
      notification: { create: jest.fn() },
      reserveBuffer: { upsert: jest.fn() },
    },
  }
})

import { runBaselineCycle, runStreamDistribution } from '@lib/profit/engine'

describe('profit engine', () => {
  beforeAll(() => { process.env.SERVICE_FEE_PCT = '5' })

  it('baseline dryRun computes totals', async () => {
    const res = await runBaselineCycle({ weekEnding: new Date(), dryRun: true })
    expect(res.ok).toBe(true)
    expect(res.count).toBe(2)
    expect(res.totalAUM).toBeCloseTo(300)
    expect(res.totalProfit).toBeCloseTo((100*0.04*(1-0.05)) + (200*0.04*(1-0.05)))
  })

  it('stream dryRun uses performance map', async () => {
    const res = await runStreamDistribution({ weekEnding: new Date(), performance: { starter: 1, pro: 2 }, dryRun: true })
    expect(res.ok).toBe(true)
    expect(res.count).toBe(2)
    expect(res.totalProfit).toBeCloseTo((100*0.01*(1-0.05)) + (200*0.02*(1-0.05)))
  })
})

