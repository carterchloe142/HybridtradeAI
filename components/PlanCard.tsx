import React from 'react';
import { motion } from 'framer-motion';
import { Plan } from '@/types';

type Props = {
  plan: Plan;
  onInvest?: (planId: string) => void;
};

export default function PlanCard({ plan, onInvest }: Props) {
  return (
    <motion.div
      className="card-neon flex flex-col"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight text-foreground">{plan.name}</h3>
        <span className="text-neon-blue font-semibold">{plan.weeklyRoi}% weekly</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>

      <ul className="mt-4 space-y-2 text-sm text-muted-foreground list-disc list-inside">
        {plan.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <button
        className="btn-neon mt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue rounded-md"
        onClick={() => onInvest?.(plan.id)}
        aria-label={`Invest in ${plan.name}`}
      >
        Invest in {plan.name}
      </button>
    </motion.div>
  );
}
