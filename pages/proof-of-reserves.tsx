import { useEffect, useState } from 'react';

type Transparency = {
  reserves: {
    trading_pool_usd: number;
    staking_pool_usd: number;
    ads_tasks_pool_usd: number;
    cold_wallets: { chain: string; address: string }[];
    last_updated: string | null;
  };
  emergencyFund: {
    balance_usd: number;
    policy: string;
    last_updated: string | null;
  };
};

export default function ProofOfReserves() {
  const [data, setData] = useState<Transparency | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/transparency');
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Failed to load');
        setData(json);
      } catch (e: any) {
        setError(e?.message || 'Error');
      }
    })();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold neon-text">Proof of Reserves</h1>
      <p className="mt-2 text-white/80">Transparent balances across trading, staking/yield, and ads/tasks pools.</p>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="card-neon">
          <h3 className="font-semibold">Trading Pool</h3>
          <p className="mt-1 text-2xl font-bold text-neon-blue">${data?.reserves.trading_pool_usd?.toLocaleString() || '—'}</p>
        </div>
        <div className="card-neon">
          <h3 className="font-semibold">Staking / Yield Pool</h3>
          <p className="mt-1 text-2xl font-bold text-neon-blue">${data?.reserves.staking_pool_usd?.toLocaleString() || '—'}</p>
        </div>
        <div className="card-neon">
          <h3 className="font-semibold">Ads & Tasks Pool</h3>
          <p className="mt-1 text-2xl font-bold text-neon-blue">${data?.reserves.ads_tasks_pool_usd?.toLocaleString() || '—'}</p>
        </div>
      </div>

      <div className="mt-8 card-neon">
        <h3 className="font-semibold">Cold Wallets</h3>
        <ul className="mt-2 text-sm text-white/80 space-y-1">
          {(data?.reserves.cold_wallets || []).map((w, i) => (
            <li key={i}>{w.chain}: {w.address}</li>
          ))}
          {(!data?.reserves.cold_wallets || data?.reserves.cold_wallets.length === 0) && (
            <li>No wallets available.</li>
          )}
        </ul>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold neon-text">Emergency Fund</h2>
        <div className="card-neon mt-3">
          <p className="text-white/80">Balance</p>
          <p className="mt-1 text-2xl font-bold text-neon-blue">${data?.emergencyFund.balance_usd?.toLocaleString() || '—'}</p>
          <p className="mt-2 text-sm text-white/60">Policy: {data?.emergencyFund.policy || '—'}</p>
        </div>
      </div>

      <p className="mt-6 text-xs text-white/60">Last updated: {data?.reserves.last_updated || '—'}</p>
    </div>
  );
}

