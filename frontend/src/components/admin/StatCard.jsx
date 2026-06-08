import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, hint, icon: Icon, trend, accent = 'gold', delay = 0 }) {
  const ring =
    accent === 'emerald'
      ? 'ring-emerald-500/15 dark:ring-emerald-400/25'
      : accent === 'blue'
        ? 'ring-blue-500/15 dark:ring-blue-400/25'
        : accent === 'rose'
          ? 'ring-rose-500/15 dark:ring-rose-400/25'
          : 'ring-gold-500/20 dark:ring-gold-400/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={clsx(
        'rounded-2xl border border-slate-200 bg-white p-5 shadow-soft ring-1 dark:border-slate-700 dark:bg-slate-800/70',
        ring
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-navy-900 dark:text-white sm:text-3xl">{value}</p>
          {hint && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
          {trend && (
            <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">{trend}</p>
          )}
        </div>
        {Icon && (
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-navy-900 to-navy-800 text-gold-500 shadow-inner dark:from-slate-700 dark:to-slate-900">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
