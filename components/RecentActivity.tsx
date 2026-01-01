import React from 'react';
import { LogIn, DollarSign, Briefcase, Settings, ShieldCheck } from 'lucide-react';

export default function RecentActivity() {
  const activities = [
    { id: 1, type: 'login', text: 'Secure login from Windows 10', time: '2 mins ago', icon: LogIn, color: 'text-blue-500' },
    { id: 2, type: 'system', text: 'Daily profit calculation completed', time: '4 hours ago', icon: DollarSign, color: 'text-green-500' },
    { id: 3, type: 'security', text: '2FA verification successful', time: 'Yesterday', icon: ShieldCheck, color: 'text-purple-500' },
    { id: 4, type: 'plan', text: 'Cycle day 3/14 progress update', time: 'Yesterday', icon: Briefcase, color: 'text-orange-500' },
  ];

  return (
    <div className="glass p-6 rounded-2xl border border-border/50 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-sm text-muted-foreground">Account Activity</h3>
        <button className="text-xs text-primary hover:underline">View All</button>
      </div>

      <div className="relative border-l border-border ml-3 space-y-6">
        {activities.map((act) => (
          <div key={act.id} className="ml-6 relative">
            <div className={`absolute -left-[31px] bg-background border border-border p-1 rounded-full ${act.color}`}>
              <act.icon size={12} />
            </div>
            <div className="text-sm font-medium leading-none">{act.text}</div>
            <div className="text-xs text-muted-foreground mt-1">{act.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
