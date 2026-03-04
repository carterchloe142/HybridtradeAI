export const planConfig = {
  starter: { 
    referralRate: 5, 
    allocations: { ads_tasks: 70, trading: 30 },
    name: 'Starter Plan',
    min: 100,
    max: 500,
    description: 'Low-risk entry point for beginners and cautious investors.',
    expected_roi_weekly: '10–20%',
    risk: 'Low'
  },
  pro: { 
    referralRate: 7, 
    allocations: { trading: 50, staking_yield: 30, copy_trading_ai: 20 },
    name: 'Pro Plan',
    min: 501,
    max: 2000,
    description: 'Balanced growth for investors seeking higher returns with diversified risk.',
    expected_roi_weekly: '25–45%',
    risk: 'Medium'
  },
  elite: { 
    referralRate: 10, 
    allocations: { trading: 60, copy_trading: 25, ads_tasks: 15 },
    name: 'Elite Plan',
    min: 2001,
    max: 10000,
    description: 'Maximum earning potential for high-net-worth investors.',
    expected_roi_weekly: '15–30%',
    risk: 'High'
  },
  bigtime: {
    referralRate: 12,
    allocations: { trading: 70, copy_trading_ai: 20, staking_yield: 10 },
    name: 'HYDRA Plan',
    min: 50000,
    max: 200000,
    description: 'Designed for high net-worth investors with larger capital deployments.',
    expected_roi_weekly: '20–40%',
    risk: 'High'
  }
};

export const revenueStreams = {
  algo_trading: {
    name: 'Algorithmic Market Trading',
    description: 'AI bots trade Forex, Crypto, and Commodities based on market signals.',
    roi_range: '6–20% weekly',
    risk: 'Medium'
  },
  staking_yield: {
    name: 'Crypto Staking & Yield Farming',
    description: 'Locking assets to earn rewards from protocols.',
    roi_range: '2–8% weekly',
    risk: 'Low–Medium'
  },
  copy_trading: {
    name: 'Copy-Trading Network',
    description: 'Mirroring trades of verified expert traders.',
    roi_range: '8–30% weekly',
    risk: 'High'
  },
  ads_affiliate: {
    name: 'Ads & Affiliate Revenue',
    description: 'Income from platform traffic, banners, and partners.',
    roi_range: '1–5% weekly',
    risk: 'Low'
  },
  tasks: {
    name: 'Task & Engagement Revenue',
    description: 'Revenue from digital tasks completed by users.',
    roi_range: '0.5–3% weekly',
    risk: 'Low'
  },
  ai_allocation: {
    name: 'AI Capital Allocation',
    description: 'Reallocates capital to best-performing streams weekly.',
    roi_range: 'Dynamic',
    risk: 'Low'
  }
}
