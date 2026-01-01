export interface PlanConfig {
  id: string;
  name: string;
  allocation: {
    name: string;
    percentage: number;
    description: string;
    color: string;
  }[];
  streams: string[];
}

export const PLANS: Record<string, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    allocation: [
      { name: 'Ads & Tasks', percentage: 70, description: 'Revenue from ad networks and micro-tasks', color: '#10b981' }, // emerald-500
      { name: 'Basic Algo Trading', percentage: 30, description: 'Low-risk algorithmic trading strategies', color: '#3b82f6' }, // blue-500
    ],
    streams: ['Ads', 'Tasks', 'Basic Trading']
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    allocation: [
      { name: 'Algo Trading', percentage: 60, description: 'Advanced algorithmic trading', color: '#8b5cf6' }, // violet-500
      { name: 'Copy-Trading', percentage: 25, description: 'Mirroring verified top traders', color: '#f59e0b' }, // amber-500
      { name: 'Ads & Tasks', percentage: 15, description: 'Supplemental revenue', color: '#10b981' }, // emerald-500
    ],
    streams: ['Algo Trading', 'Copy-Trading', 'Ads', 'Tasks']
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    allocation: [
      { name: 'Algo Trading', percentage: 50, description: 'High-frequency algorithmic trading', color: '#8b5cf6' }, // violet-500
      { name: 'Crypto Staking', percentage: 30, description: 'Yield farming and staking rewards', color: '#ec4899' }, // pink-500
      { name: 'AI Allocator', percentage: 20, description: 'AI-driven dynamic asset allocation', color: '#06b6d4' }, // cyan-500
    ],
    streams: ['Algo Trading', 'Staking', 'AI Allocator', 'Copy-Trading']
  }
};

export function getPlanConfig(planId: string): PlanConfig | null {
  return PLANS[planId.toLowerCase()] || null;
}
