import type { Balance, Plan } from '../types';

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Entry plan allocating 70% Ads & Tasks and 30% Trading.',
    weeklyRoi: 30, // mid of 21–40% range; actual ROI comes from admin streams
    features: ['70% Ads & Tasks', '30% Trading', 'Task bonuses available']
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Balanced plan: 60% Trading, 25% Copy-Trading, 15% Ads & Tasks.',
    weeklyRoi: 35, // mid of 25–45% range
    features: ['60% Trading', '25% Copy-Trading', '15% Ads & Tasks', 'Premium education content']
  },
  {
    id: 'elite',
    name: 'Elite',
    description: 'High-tier: 50% Trading, 30% Staking/Yield, 20% AI/Copy-Trading.',
    weeklyRoi: 40, // mid of 30–50% range
    features: ['Priority withdrawals', 'Beta access to new features', '50% Trading', '30% Staking/Yield', '20% AI/Copy-Trading']
  }
];

export type ReferralConfig = {
  starter: number;
  pro: number;
  elite: number;
};

export const referralConfig: ReferralConfig = { starter: 5, pro: 7, elite: 10 };

export function calculateWeeklyROI(amountUSD: number, planId: string): number {
  const plan = PLANS.find(p => p.id === planId);
  if (!plan) return 0;
  const roi = amountUSD * (plan.weeklyRoi / 100);
  return Number(roi.toFixed(2));
}

export function calculateReferralCommission(downlineWeeklyRoiUSD: number, planId: string): number {
  const pct = planId === 'pro' ? referralConfig.pro : planId === 'elite' ? referralConfig.elite : referralConfig.starter;
  const commission = downlineWeeklyRoiUSD * (pct / 100);
  return Number(commission.toFixed(2));
}

// Placeholder for cron / scheduled profit distribution
export async function distributeWeeklyProfits() {
  // TODO: integrate with DB (Supabase) to: 
  // 1) fetch active investments
  // 2) compute ROI per plan
  // 3) credit wallets for profits and referrals
  // 4) record transactions and update balances
  return { ok: true, message: 'Scheduled distribution stub executed.' };
}
