import { motion } from 'framer-motion';

export default function KpiCard({ title, value, sublabel }: { title: string; value: string | number; sublabel?: string }) {
  return (
    <motion.div
      className="card-neon"
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-2xl font-bold text-neon-blue">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-white/60">{sublabel}</p>}
    </motion.div>
  );
}

