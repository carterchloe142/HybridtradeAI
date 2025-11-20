import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Try fetching from optional tables; fallback to demo data if missing
    const { data: reserves, error: rErr } = await supabase
      .from('proof_reserves')
      .select('*')
      .limit(1)
      .maybeSingle();

    const { data: emergency, error: eErr } = await supabase
      .from('emergency_fund')
      .select('*')
      .limit(1)
      .maybeSingle();

    const payload = {
      reserves: reserves ? {
        trading_pool_usd: reserves.trading_pool_usd || 0,
        staking_pool_usd: reserves.staking_pool_usd || 0,
        ads_tasks_pool_usd: reserves.ads_tasks_pool_usd || 0,
        cold_wallets: reserves.cold_wallets || [],
        last_updated: reserves.updated_at || null
      } : {
        trading_pool_usd: 1250000,
        staking_pool_usd: 480000,
        ads_tasks_pool_usd: 220000,
        cold_wallets: [
          { chain: 'BTC', address: 'bc1qexample...' },
          { chain: 'USDT', address: '0xexample...' }
        ],
        last_updated: null
      },
      emergencyFund: emergency ? {
        balance_usd: emergency.balance_usd || 0,
        policy: emergency.policy || '2–3 months operating runway; used for volatility events.',
        last_updated: emergency.updated_at || null
      } : {
        balance_usd: 150000,
        policy: '2–3 months operating runway; used for volatility events.',
        last_updated: null
      }
    };

    res.status(200).json(payload);
  } catch (err: any) {
    res.status(200).json({
      reserves: {
        trading_pool_usd: 0,
        staking_pool_usd: 0,
        ads_tasks_pool_usd: 0,
        cold_wallets: [],
        last_updated: null
      },
      emergencyFund: {
        balance_usd: 0,
        policy: 'Unavailable',
        last_updated: null
      },
      error: err?.message || 'Failed to load transparency data'
    });
  }
}

