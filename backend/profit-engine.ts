import { planConfig } from '@/config/planConfig';

// Mock weekly performance of each stream (in percentage)
// In a real system, these would come from the database based on actual results
const MOCK_STREAM_PERFORMANCE = {
  ads_tasks: 2.5,       // Low risk, low return
  trading: 14.5,        // Medium risk, high return
  staking_yield: 4.2,   // Low risk, stable
  copy_trading: 18.0,   // High risk, very high return
  copy_trading_ai: 22.0 // Combined AI + Copy
};

// Stream mapping to handle different naming conventions between code and config
const STREAM_MAPPING: Record<string, keyof typeof MOCK_STREAM_PERFORMANCE> = {
  'ads_tasks': 'ads_tasks',
  'trading': 'trading',
  'staking_yield': 'staking_yield',
  'copy_trading': 'copy_trading',
  'copy_trading_ai': 'copy_trading_ai',
  // Aliases from config
  'algo_trading': 'trading',
  'ads_affiliate': 'ads_tasks',
  'tasks': 'ads_tasks',
  'ai_allocation': 'copy_trading_ai'
};

const MANAGEMENT_FEE_PERCENT = 10;

export function calculateWeeklyROI(amountUSD: number, planId: string): number {
  const plan = planConfig[planId as keyof typeof planConfig];
  if (!plan) return 0;

  // Step 1 & 2: Calculate Weighted Contributions
  let weightedRate = 0;
  
  for (const [stream, percentage] of Object.entries(plan.allocations)) {
    // Map stream name to performance key using mapping or direct key
    const perfKey = (STREAM_MAPPING[stream] || stream) as keyof typeof MOCK_STREAM_PERFORMANCE;
    const performance = MOCK_STREAM_PERFORMANCE[perfKey] || 0;
    
    // Example: 12% perf * 50% allocation = 6% contribution
    const contribution = performance * (percentage / 100);
    weightedRate += contribution;
  }

  // Step 3: Add All Weighted Contributions -> weightedRate is now the total weekly %

  // Step 4: Apply to User Capital
  const grossProfit = amountUSD * (weightedRate / 100);

  // Step 5: Deduct Management Fee
  const fee = grossProfit * (MANAGEMENT_FEE_PERCENT / 100);
  const netProfit = grossProfit - fee;

  return Number(netProfit.toFixed(2));
}

export function calculateReferralCommission(downlineWeeklyRoiUSD: number, planId: string): number {
  const plan = planConfig[planId as keyof typeof planConfig];
  if (!plan) return 0;
  
  const commission = downlineWeeklyRoiUSD * (plan.referralRate / 100);
  return Number(commission.toFixed(2));
}

// Placeholder for cron / scheduled profit distribution
export async function distributeWeeklyProfits() {
  // TODO: integrate with DB (Supabase) to: 
  // 1) fetch active investments
  // 2) compute ROI per plan using calculateWeeklyROI
  // 3) credit wallets for profits and referrals
  // 4) record transactions and update balances
  return { ok: true, message: 'Scheduled distribution stub executed.' };
}
