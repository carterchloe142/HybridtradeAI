import React, { useEffect, useState } from 'react';
import { LogIn, DollarSign, Briefcase, Settings, ShieldCheck, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { getCurrentUserId, getUserRecentTransactions } from '@/src/lib/db';
import { useCurrency } from '@/hooks/useCurrency';

export default function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { format } = useCurrency();

  useEffect(() => {
    async function load() {
      const userId = await getCurrentUserId();
      if (!userId) return;
      const txs = await getUserRecentTransactions(userId, 5);
      setActivities(txs);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="text-sm text-muted-foreground p-4">Loading activity...</div>;
  if (activities.length === 0) return <div className="text-sm text-muted-foreground p-4">No recent activity</div>;

  return (
    <div className="relative border-l border-border ml-3 space-y-6 mt-2">
      {activities.map((act) => {
        let Icon = DollarSign;
        let color = 'text-blue-500';
        let text = act.metadata?.description || act.description || act.type;
        
        const type = String(act.type).toUpperCase();
        if (type === 'DEPOSIT') {
            Icon = ArrowDownLeft;
            color = 'text-green-500';
            text = text === 'DEPOSIT' ? `Deposit ${format(act.amount, act.currency)}` : text;
        } else if (type === 'WITHDRAWAL') {
            Icon = ArrowUpRight;
            color = 'text-orange-500';
            text = text === 'WITHDRAWAL' ? `Withdrawal ${format(act.amount, act.currency)}` : text;
        } else if (type === 'INVESTMENT' || (type === 'TRANSFER' && act.amount < 0)) {
            Icon = Briefcase;
            color = 'text-purple-500';
            text = text === 'TRANSFER' ? `Invested ${format(Math.abs(act.amount), act.currency)}` : text;
        } else if (type === 'PROFIT') {
            Icon = DollarSign;
            color = 'text-emerald-500';
            text = text === 'PROFIT' ? `Profit Payout` : text;
        }

        return (
          <div key={act.id} className="ml-6 relative">
            <div className={`absolute -left-[31px] bg-background border border-border p-1 rounded-full ${color}`}>
              <Icon size={12} />
            </div>
            <div className="text-sm font-medium leading-none">{text}</div>
            <div className="text-xs text-muted-foreground mt-1">
                {new Date(act.createdAt).toLocaleDateString()} {new Date(act.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        );
      })}
    </div>
  );
}
