import { useEffect, useMemo, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import api from '../../services/api';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

function getValue(item, key) {
  return key.split('.').reduce((prev, part) => prev?.[part], item) ?? '-';
}

function Badge({ children }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-700 ring-1 ring-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:ring-slate-600">
      {children}
    </span>
  );
}

export default function AdminResourcePage({ title, subtitle, endpoint, columns, pageSize = 12, badgeKey }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoint, { params: { search: search.trim() || undefined, page, limit: pageSize } });
      const d = response.data;
      const rows =
        d?.rooms ||
        d?.bookings ||
        d?.customers ||
        d?.services ||
        d?.payments ||
        d?.users ||
        d ||
        [];
      setItems(Array.isArray(rows) ? rows : []);
      setTotal(typeof d.total === 'number' ? d.total : rows.length || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || `Không tải được ${title}`);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, search, title, pageSize]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const header = (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-900 dark:text-white">{title}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
      </div>
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Tìm kiếm realtime…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-medium outline-none ring-gold-500/20 focus:ring-2 dark:border-slate-600 dark:bg-slate-800"
        />
      </div>
    </div>
  );

  const tableBody = useMemo(() => items, [items]);

  return (
    <section>
      {header}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900/70">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={columns.length} className="px-4 py-4">
                      <div className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                    </td>
                  </tr>
                ))
              ) : tableBody.length ? (
                tableBody.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    {columns.map((column) => {
                      const raw = getValue(item, column.key);
                      const useBadge = column.badge || badgeKey?.(column.key, item);
                      return (
                        <td key={`${item.id}-${column.key}`} className="px-4 py-3 text-slate-700 dark:text-slate-200">
                          {useBadge ? <Badge>{raw}</Badge> : typeof column.render === 'function' ? column.render(item) : raw}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                    Không có dữ liệu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="text-xs font-medium text-slate-500">
              Hiển thị trang <span className="font-bold text-navy-900 dark:text-white">{page}</span> / {totalPages} ·{' '}
              <span>{total}</span> bản ghi
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={clsx(
                  'rounded-lg px-3 py-1.5 text-sm font-bold text-navy-900 dark:text-white',
                  'border border-slate-200 disabled:opacity-40 dark:border-slate-600'
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={clsx(
                  'rounded-lg px-3 py-1.5 text-sm font-bold text-navy-900 dark:text-white',
                  'border border-slate-200 disabled:opacity-40 dark:border-slate-600'
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
