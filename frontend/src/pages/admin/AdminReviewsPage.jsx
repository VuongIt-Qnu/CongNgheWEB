import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, RefreshCw, Search, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, PageHeader, StatusBadge } from '../../components/ui';
import { displayRoomName } from '../../constants/labels';
import { formatDateTime } from '../../utils/dateFormat';

const limit = 15;

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [hiddenFilter, setHiddenFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/reviews', {
        params: {
          page,
          limit,
          search: search.trim() || undefined,
          hidden: hiddenFilter === '' ? undefined : hiddenFilter,
        },
      });
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không tải đánh giá');
    } finally {
      setLoading(false);
    }
  }, [page, search, hiddenFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const pages = Math.max(1, Math.ceil(total / limit));

  const toggleHide = async (r) => {
    const next = !Number(r.is_hidden);
    try {
      await api.patch(`/reviews/${r.id}/visibility`, { is_hidden: next });
      toast.success(next ? 'Đã ẩn đánh giá' : 'Đã hiện đánh giá');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Xóa vĩnh viễn đánh giá này?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success('Đã xóa');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không xóa được');
    }
  };

  return (
    <section className="space-y-6 p-4 md:p-8">
      <PageHeader title="Quản lý đánh giá" subtitle="Xem, ẩn hoặc xóa đánh giá vi phạm / spam." />

      <Card className="p-4 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm theo tên, nội dung, phòng…"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <select
              value={hiddenFilter}
              onChange={(e) => {
                setHiddenFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="0">Đang hiển thị</option>
              <option value="1">Đã ẩn</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => load()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          {loading && reviews.length === 0 ? (
            <div className="flex justify-center py-16 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="py-12 text-center text-slate-500">Không có đánh giá nào.</p>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-3 py-3 text-left">ID</th>
                  <th className="px-3 py-3 text-left">Khách</th>
                  <th className="px-3 py-3 text-left">Phòng</th>
                  <th className="px-3 py-3 text-left">Booking</th>
                  <th className="px-3 py-3 text-center">Sao</th>
                  <th className="px-3 py-3 text-left">Bình luận</th>
                  <th className="px-3 py-3 text-left">Ngày</th>
                  <th className="px-3 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reviews.map((r) => (
                  <tr key={r.id} className={Number(r.is_hidden) ? 'bg-slate-50/80 dark:bg-slate-900/30' : ''}>
                    <td className="px-3 py-3 font-mono text-xs">{r.id}</td>
                    <td className="max-w-[140px] px-3 py-3">
                      <div className="truncate font-medium">{r.user_name || '—'}</div>
                      <div className="truncate text-xs text-slate-500">{r.user_email || ''}</div>
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        to={`/room/${r.room_id}`}
                        className="font-medium text-amber-700 hover:underline dark:text-amber-400"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {displayRoomName(r.room_number || r.room_id)}
                      </Link>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">{r.booking_id ?? '—'}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center gap-0.5 font-bold text-amber-600">
                        {r.rating}
                        <Star className="h-3.5 w-3.5 fill-current" />
                      </span>
                    </td>
                    <td className="max-w-xs px-3 py-3">
                      <p className="line-clamp-3 text-slate-700 dark:text-slate-300">{r.comment}</p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-500">
                      {formatDateTime(r.created_at)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {Number(r.is_hidden) ? (
                          <button
                            type="button"
                            onClick={() => toggleHide(r)}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Hiện
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleHide(r)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold dark:border-slate-600"
                          >
                            <EyeOff className="h-3.5 w-3.5" />
                            Ẩn
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => remove(r.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-bold text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Xóa
                        </button>
                      </div>
                      {Number(r.is_hidden) ? (
                        <div className="mt-1 flex justify-end">
                          <StatusBadge>Đã ẩn</StatusBadge>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pages > 1 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="text-xs text-slate-500">
              Trang {page} / {pages} · {total} mục
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40 dark:border-slate-700"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40 dark:border-slate-700"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </Card>
    </section>
  );
}
