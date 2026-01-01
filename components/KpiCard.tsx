import { motion } from 'framer-motion';

export default function KpiCard({ title, value, sublabel }: { title: string; value: string | number; sublabel?: string }) {
  return (
    <motion.div
      className="card-neon"
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 text-2xl font-bold text-primary" aria-live="polite">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
    </motion.div>
  );
}
