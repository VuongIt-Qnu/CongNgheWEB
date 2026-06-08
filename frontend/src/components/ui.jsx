import clsx from 'clsx';

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = '' }) {
  return <div className={clsx('rounded-2xl border border-slate-200 bg-white p-5 shadow-soft', className)}>{children}</div>;
}

export function Spinner() {
  return <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-navy-900" />;
}

export function SkeletonRow() {
  return <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200" />;
}

export function StatusBadge({ children }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
      {children}
    </span>
  );
}
