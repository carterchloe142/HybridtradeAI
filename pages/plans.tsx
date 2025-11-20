import PlanCard from '../components/PlanCard';
import { PLANS } from '../backend/profit-engine';
import { getCurrentUserId } from '../lib/db';

export default function Plans() {
  const invest = async (planId: string) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        alert('Please login to invest.');
        return;
      }
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount: 100, currency: 'USD', provider: 'flutterwave', planId })
      });
      const data = await res.json();
      alert(data.message || 'Deposit initiated');
    } catch (e) {
      alert('Failed to initiate deposit');
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold neon-text mb-6">Choose your plan</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onInvest={invest} />
        ))}
      </div>
      <div className="mt-8 card-neon">
        <h3 className="font-semibold">Revenue Streams by Plan</h3>
        <ul className="mt-2 text-sm text-white/80 space-y-1 list-disc list-inside">
          <li>Starter: 70% Ads & Tasks, 30% Trading</li>
          <li>Pro: 60% Trading, 25% Copy-Trading, 15% Ads & Tasks</li>
          <li>Elite: 50% Trading, 30% Staking/Yield, 20% AI/Copy-Trading</li>
        </ul>
      </div>
    </div>
  );
}
