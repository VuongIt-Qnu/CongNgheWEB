import { motion } from 'framer-motion';

function SkeletonCard({ delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgba(10,26,54,0.07)] ring-1 ring-black/[0.04]"
    >
      <div className="aspect-[16/11] shimmer bg-gradient-to-br from-slate-200/90 to-slate-100" />
      <div className="space-y-3.5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <div className="h-5 w-3/5 shimmer rounded-lg bg-slate-200/80" />
            <div className="h-3.5 w-2/5 shimmer rounded-lg bg-slate-200/50" />
          </div>
          <div className="h-8 w-14 shimmer rounded-lg bg-slate-200/60" />
        </div>
        <div className="flex items-baseline gap-2">
          <div className="h-6 w-28 shimmer rounded-lg bg-slate-200/80" />
          <div className="h-4 w-10 shimmer rounded-lg bg-slate-200/40" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3.5 w-full shimmer rounded-lg bg-slate-200/50" />
          <div className="h-3.5 w-4/5 shimmer rounded-lg bg-slate-200/40" />
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((k) => (
            <div key={k} className="h-6 flex-1 rounded-full bg-slate-200/50 shimmer" />
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-10 flex-1 rounded-xl bg-slate-200/60 shimmer" />
          <div className="h-10 flex-1 rounded-xl bg-slate-200/70 shimmer" />
        </div>
      </div>
    </motion.div>
  );
}

export default function RoomsGridSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} delay={i * 0.05} />
      ))}
    </div>
  );
}
