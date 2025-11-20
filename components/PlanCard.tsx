import React from 'react';
import { motion } from 'framer-motion';
import { Plan } from '../types';

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
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold neon-text">{plan.name}</h3>
        <span className="text-neon-blue font-semibold">{plan.weeklyRoi}% weekly</span>
      </div>
      <p className="mt-2 text-sm text-white/70">{plan.description}</p>

      <ul className="mt-4 space-y-1 text-sm text-white/80 list-disc list-inside">
        {plan.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <button
        className="btn-neon mt-6"
        onClick={() => onInvest?.(plan.id)}
      >
        Invest in {plan.name}
      </button>
    </motion.div>
  );
}
