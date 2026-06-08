import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Activity, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import clsx from 'clsx';
import { formatDateTime } from '../../utils/dateFormat';

export default function AdminActivityPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/activity-logs', { params: { page, limit } });
      setRows(data.activities || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Không tải được nhật ký hoạt động');
    } finally {
      setLoading(false);
    }
  }, [limit, page]);

  useEffect(() => {
    load();
  }, [load]);

  const pages = Math.max(1, Math.ceil(total / limit));

  const line = (log) =>
    `${log.actor_name ? `${log.actor_name} · ` : ''}${log.detail || log.action}`.trim();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900 dark:text-white lg:text-3xl">Activity log</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Activity className="h-4 w-4 text-gold-500" />
            Admin &amp; nhân viên — thao tác quan trọng trên hệ thống.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold dark:border-slate-600 dark:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900/70">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-5">
                <div className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              </div>
            ))
          ) : rows.length === 0 ? (
            <p className="p-12 text-center text-sm text-slate-500">Chưa có ghi nhận hoạt động.</p>
          ) : (
            rows.map((log, idx) => (
              <article
                key={`${log.id}-${idx}`}
                className="group flex gap-4 p-5 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <span className="mt-1.5 grid h-2.5 w-2.5 flex-shrink-0 place-items-center">
                  <span className="h-2 w-2 rounded-full bg-gold-500 shadow-[0_0_0_4px_rgba(198,169,106,0.2)]" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-semibold text-navy-900 dark:text-white">{line(log)}</p>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {log.action}{' '}
                    {log.entity_type && (
                      <span className="text-gold-600">
                        · {log.entity_type} {log.entity_id != null ? `#${log.entity_id}` : ''}
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400">{formatDateTime(log.created_at)}</p>
                </div>
              </article>
            ))
          )}
        </div>

        {pages > 1 && (
          <div className={clsx('flex justify-end gap-2 border-t border-slate-100 p-4 dark:border-slate-800')}>
            <button
              type="button"
              disabled={page <= 1}
              className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-40 dark:border-slate-600"
              onClick={() => setPage((p) => p - 1)}
            >
              Trước
            </button>
            <span className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              {page} / {pages}
            </span>
            <button
              type="button"
              disabled={page >= pages}
              className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-40 dark:border-slate-600"
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
