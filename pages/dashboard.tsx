import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import RequireAuth from '../components/RequireAuth';
import { useCurrency } from '../hooks/useCurrency';
import { calculateWeeklyROI } from '../backend/profit-engine';
import { getCurrentUserId, getUserInvestments, getUserWallets } from '../lib/db';
import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUserNotifications } from '../src/hooks/useUserNotifications';

export default function Dashboard() {
  const { currency, setCurrency, format, convertFromUSD, convertToUSD } = useCurrency('USD');
  const [walletAmount, setWalletAmount] = useState(0);
  const [walletTotalUSD, setWalletTotalUSD] = useState(0);
  const [investedUSD, setInvestedUSD] = useState(0);
  const [withdrawableUSD, setWithdrawableUSD] = useState(0);
  const [referralUSD, setReferralUSD] = useState(0);
  const [weeklyRoiUSD, setWeeklyRoiUSD] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const userIdRef = useRef<string | null>(null);
  const { items: notifications } = useUserNotifications();
  const [depositAmount, setDepositAmount] = useState('');
  const [depositProvider, setDepositProvider] = useState('flutterwave');
  const [depositPlan, setDepositPlan] = useState<'starter' | 'pro' | 'elite'>('starter');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [actionMsg, setActionMsg] = useState<string>('');
  const [actionErr, setActionErr] = useState<string>('');

  const latest = useMemo(() => notifications[0], [notifications]);
  useEffect(() => {
    if (!latest) return;
    const t = String((latest as any)?.type || '');
    if (t === 'manual_credit' || t === 'profit' || t === 'investment_status' || t === 'withdrawal_status') {
      setRefreshKey((k) => k + 1);
    }
  }, [latest]);

  useEffect(() => {
    async function fetchData() {
      const userId = await getCurrentUserId();
      if (!userId) return;
      userIdRef.current = userId;
      // Prefer user's profile currency if present
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('currency')
          .eq('user_id', userId)
          .maybeSingle();
        const preferred = (profile?.currency as any) || 'USD';
        setCurrency((prev) => prev || preferred);
      } catch {}
      const [wallets, investments] = await Promise.all([
        getUserWallets(userId),
        getUserInvestments(userId)
      ]);
      const totalWalletSelected = wallets
        .filter(w => w.currency === currency)
        .reduce((sum, w) => sum + (Number(w.balance) || 0), 0);
      setWalletAmount(Number(totalWalletSelected.toFixed(2)));
      const totalUSD = wallets.reduce((sum, w) => {
        const amt = Number(w.balance) || 0;
        return sum + convertToUSD(amt, w.currency as any);
      }, 0);
      setWalletTotalUSD(Number(totalUSD.toFixed(2)));
      const activeInvestments = investments.filter(i => i.status === 'active');
      const totalInvested = activeInvestments.reduce((sum, i) => sum + i.amount_usd, 0);
      setInvestedUSD(totalInvested);
      const withdrawable = totalInvested * 0.12;
      setWithdrawableUSD(Number(withdrawable.toFixed(2)));
      const roi = calculateWeeklyROI(totalInvested, activeInvestments[0]?.plan_id || 'starter');
      setWeeklyRoiUSD(roi);
      setReferralUSD(Number((roi * 0.05).toFixed(2)));
    }
    fetchData();
  }, [currency, refreshKey]);

  useEffect(() => {
    // Subscribe to realtime wallet changes for the current user
    (async () => {
      const userId = await getCurrentUserId();
      if (!userId) return;
      userIdRef.current = userId;
      const channel = supabase
        .channel(`wallets_user_${userId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'wallets',
          filter: `user_id=eq.${userId}`,
        }, () => {
          setRefreshKey((k) => k + 1);
        })
        .subscribe();
      return () => {
        try { channel.unsubscribe(); } catch {}
      };
    })();
  }, []);

  return (
    <RequireAuth>
      <div className="grid md:grid-cols-[auto,1fr] gap-6">
        <Sidebar />

        <div className="space-y-6">
          <div className="glass rounded-2xl p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold neon-text">Overview</h2>
            <div className="flex items-center gap-2 text-sm">
              <label className="text-white/70">Currency:</label>
              <select
                className="input-neon w-32"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
              >
                {['USD', 'EUR', 'NGN', 'BTC', 'ETH'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard title="Wallet balance (selected)" value={format(walletAmount)} />
            <DashboardCard title="All wallets total (USD)" value={`$${walletTotalUSD.toFixed(2)}`} />
            <DashboardCard title={`All wallets total (${currency})`} value={format(convertFromUSD(walletTotalUSD))} />
            <DashboardCard title="Invested amount (active in pool)" value={format(convertFromUSD(investedUSD))} />
            <DashboardCard title="Withdrawable profits" value={format(convertFromUSD(withdrawableUSD))} />
            <DashboardCard title="Referral earnings" value={format(convertFromUSD(referralUSD))} />
            <DashboardCard title="Estimated weekly ROI" value={format(convertFromUSD(weeklyRoiUSD))} sublabel="Based on current plan" />
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold neon-text">Actions</h3>
              {actionMsg && <span className={`text-sm ${actionErr ? 'text-red-500' : 'text-green-500'}`}>{actionMsg}</span>}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input className="input-neon flex-1" type="number" step="0.01" placeholder="Deposit amount" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
                  <select className="input-neon w-36" value={depositProvider} onChange={(e) => setDepositProvider(e.target.value)}>
                    <option value="flutterwave">Flutterwave</option>
                    <option value="paystack">Paystack</option>
                    <option value="crypto">Crypto</option>
                  </select>
                  <select className="input-neon w-36" value={depositPlan} onChange={(e) => setDepositPlan(e.target.value as any)}>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="elite">Elite</option>
                  </select>
                  <button className="btn-neon" onClick={async () => {
                    setActionErr('');
                    setActionMsg('');
                    const uid = userIdRef.current;
                    const amt = Number(depositAmount);
                    if (!uid || !amt || amt <= 0) { setActionErr('Invalid deposit'); setActionMsg(''); return; }
                    try {
                      const res = await fetch('/api/deposit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid, amount: amt, currency, provider: depositProvider, planId: depositPlan }) })
                      const json = await res.json()
                      if (!res.ok) { setActionErr(String(json?.error || 'Failed')); setActionMsg(''); return }
                      setActionMsg(String(json?.message || 'Deposit recorded'))
                      setDepositAmount('')
                      setRefreshKey((k) => k + 1)
                    } catch (e: any) { setActionErr(String(e?.message || 'Error')) }
                  }}>Deposit</button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input className="input-neon flex-1" type="number" step="0.01" placeholder="Withdraw amount" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
                  <button className="btn-neon" onClick={async () => {
                    setActionErr('');
                    setActionMsg('');
                    const uid = userIdRef.current;
                    const amt = Number(withdrawAmount);
                    if (!uid || !amt || amt <= 0) { setActionErr('Invalid withdraw'); setActionMsg(''); return; }
                    try {
                      const res = await fetch('/api/withdraw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid, amount: amt, currency, cycleActive: false }) })
                      const json = await res.json()
                      if (res.status === 202) { setActionMsg(String(json?.message || 'Request submitted')); setWithdrawAmount(''); return }
                      if (!res.ok) { setActionErr(String(json?.error || 'Failed')); setActionMsg(''); return }
                      setActionMsg(String(json?.message || 'Withdrawal recorded'))
                      setWithdrawAmount('')
                      setRefreshKey((k) => k + 1)
                    } catch (e: any) { setActionErr(String(e?.message || 'Error')) }
                  }}>Withdraw</button>
                </div>
              </div>
            </div>
          </div>

          <div className="card-neon">
            <h3 className="font-semibold neon-text">AI Assistant</h3>
            <p className="mt-2 text-sm text-white/80">Live responses will appear here. Use the floating chatbot for now.</p>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
