import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RoomPagination({ page, totalPages, onPageChange, disabled }) {
  if (totalPages <= 1) return null;

  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  let end = Math.min(totalPages, start + windowSize - 1);
  if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);

  const pages = [];
  for (let p = start; p <= end; p += 1) pages.push(p);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center justify-center gap-2 pt-10"
    >
      <button
        type="button"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={clsx(
          'inline-flex items-center gap-1 rounded-full border border-navy-900/10 bg-white px-4 py-2 text-sm font-semibold text-navy-900 shadow-sm transition',
          'hover:border-gold-500/50 hover:shadow-md hover:shadow-gold-500/10',
          'disabled:pointer-events-none disabled:opacity-40'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        Trước
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            disabled={disabled}
            onClick={() => onPageChange(p)}
            className={clsx(
              'relative min-w-[2.5rem] rounded-full px-3 py-2 text-sm font-semibold transition-all',
              p === page
                ? 'text-navy-900'
                : 'text-slate-500 hover:bg-slate-100 hover:text-navy-900'
            )}
          >
            {p === page && (
              <motion.span
                layoutId="page-pill"
                className="absolute inset-0 rounded-full bg-gold-500/25 ring-2 ring-gold-500/50"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-[1]">{p}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={clsx(
          'inline-flex items-center gap-1 rounded-full border border-navy-900/10 bg-white px-4 py-2 text-sm font-semibold text-navy-900 shadow-sm transition',
          'hover:border-gold-500/50 hover:shadow-md hover:shadow-gold-500/10',
          'disabled:pointer-events-none disabled:opacity-40'
        )}
      >
        Sau
        <ChevronRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
