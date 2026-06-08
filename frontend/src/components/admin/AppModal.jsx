import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import clsx from 'clsx';

export default function AppModal({ open, title, subtitle, children, footer, size = 'md', onClose }) {
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (open) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const widths = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm dark:bg-black/70"
        onClick={() => onClose?.()}
      />
      <div
        className={clsx(
          'relative z-[1] flex max-h-[90vh] w-full flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900',
          widths[size]
        )}
      >
        <div className="flex-shrink-0 border-b border-slate-100 px-5 py-4 dark:border-slate-700">
          <div className="flex items-start justify-between gap-4">
            <div>
              {title && <h2 className="text-lg font-bold text-navy-900 dark:text-white">{title}</h2>}
              {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
            </div>
            <button
              type="button"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-navy-900 dark:hover:bg-slate-800 dark:hover:text-white"
              onClick={() => onClose?.()}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex-shrink-0 border-t border-slate-100 px-5 py-4 dark:border-slate-700">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
}
