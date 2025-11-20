import React from 'react';

type Props = {
  title: string;
  value: string | number;
  sublabel?: string;
};

export default function DashboardCard({ title, value, sublabel }: Props) {
  return (
    <div className="card-neon">
      <div className="text-sm text-white/70">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {sublabel && <div className="mt-1 text-xs text-white/60">{sublabel}</div>}
    </div>
  );
}
