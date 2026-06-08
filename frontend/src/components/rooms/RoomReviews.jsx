import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  MessageSquareText,
  Pencil,
  Send,
  Star,
  Trash2,
  User,
  X,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { displayRoomName } from '../../constants/labels';
import { formatDate, formatDateRange } from '../../utils/dateFormat';

const STAR_LABELS = {
  1: 'Rất tệ',
  2: 'Tệ',
  3: 'Bình thường',
  4: 'Tốt',
  5: 'Tuyệt vời',
};

function StarRatingInput({ value, onChange, disabled }) {
  const [hover, setHover] = useState(null);
  const active = hover ?? value;

  return (
    <div className="space-y-2">
      <div
        className="flex flex-wrap items-center gap-1.5"
        onMouseLeave={() => setHover(null)}
        role="radiogroup"
        aria-label="Chọn số sao"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(null)}
            onClick={() => onChange(n)}
            className={clsx(
              'rounded-lg p-1.5 transition-all duration-200 ease-out',
              'hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60',
              disabled && 'pointer-events-none opacity-50'
            )}
            aria-checked={value === n}
            role="radio"
          >
            <Star
              className={clsx(
                'h-9 w-9 transition-colors duration-200 sm:h-10 sm:w-10',
                n <= active ? 'fill-amber-400 text-amber-400 drop-shadow-sm' : 'text-slate-300 dark:text-slate-600'
              )}
            />
          </button>
        ))}
      </div>
      <p className="min-h-[1.25rem] text-sm font-semibold text-amber-600 dark:text-amber-400">
        {active ? `⭐ ${active} — ${STAR_LABELS[active]}` : 'Chọn số sao'}
      </p>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col gap-6 rounded-2xl bg-slate-100/80 p-6 dark:bg-slate-800/40 md:flex-row">
        <div className="mx-auto h-24 w-28 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="flex-1 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-3 w-10 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-8 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex gap-3">
              <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-5/6 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RoomReviews({ room, onReviewsUpdated }) {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const roomId = room?.id;

  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [avgRating, setAvgRating] = useState(0);
  const [distribution, setDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  const [eligible, setEligible] = useState([]);
  const [eligibleLoading, setEligibleLoading] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editing, setEditing] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  const limit = 15;

  const loadReviews = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/reviews/room/${roomId}`, { params: { page: 1, limit: 200 } });
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
      setAvgRating(Number(data.avg_rating || 0));
      setDistribution(data.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
      setPage(1);
    } catch {
      toast.error('Không tải được đánh giá.');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    if (!isAuthenticated || !roomId) {
      setEligible([]);
      return;
    }
    let cancelled = false;
    setEligibleLoading(true);
    api
      .get(`/reviews/eligible/room/${roomId}`)
      .then(({ data }) => {
        if (!cancelled) setEligible(data.bookings || []);
      })
      .catch(() => {
        if (!cancelled) setEligible([]);
      })
      .finally(() => {
        if (!cancelled) setEligibleLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, roomId, reviews.length]);

  const paramBookingId = searchParams.get('bookingId');
  useEffect(() => {
    if (!paramBookingId || !eligible.length) return;
    const found = eligible.some((b) => String(b.id) === String(paramBookingId));
    if (found) setBookingId(String(paramBookingId));
  }, [paramBookingId, eligible]);

  const visibleSlice = useMemo(() => reviews.slice(0, page * limit), [reviews, page, limit]);
  const hasMore = visibleSlice.length < reviews.length;

  const refreshAll = useCallback(async () => {
    await loadReviews();
    onReviewsUpdated?.();
  }, [loadReviews, onReviewsUpdated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bookingId) {
      toast.error('Chọn booking để đánh giá.');
      return;
    }
    const c = comment.trim();
    if (!c) {
      toast.error('Vui lòng nhập bình luận.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/reviews', {
        room_id: Number(roomId),
        booking_id: Number(bookingId),
        rating,
        comment: c,
      });
      toast.success('Cảm ơn bạn đã đánh giá!');
      setComment('');
      setRating(5);
      setBookingId('');
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('bookingId');
      setSearchParams(nextParams, { replace: true });
      await refreshAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gửi đánh giá thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (r) => {
    setEditing(r.id);
    setEditRating(Number(r.rating));
    setEditComment(r.comment || '');
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditComment('');
  };

  const saveEdit = async () => {
    const c = editComment.trim();
    if (!c) {
      toast.error('Bình luận không được để trống.');
      return;
    }
    try {
      await api.put(`/reviews/${editing}`, { rating: editRating, comment: c });
      toast.success('Đã cập nhật đánh giá.');
      cancelEdit();
      await refreshAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không lưu được.');
    }
  };

  const removeReview = async (id) => {
    if (!window.confirm('Xóa đánh giá này?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success('Đã xóa đánh giá.');
      if (editing === id) cancelEdit();
      await refreshAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không xóa được.');
    }
  };

  if (!roomId) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/30 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-navy-900 dark:text-white">Đánh giá từ khách</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Chỉ khách đã hoàn thành lưu trú mới có thể đánh giá — điểm trung bình cập nhật theo thời gian thực.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-8">
          <ReviewsSkeleton />
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 ring-1 ring-slate-100 dark:from-slate-900/60 dark:to-slate-900/20 dark:ring-slate-800 md:flex-row md:items-stretch">
            <div className="flex flex-col items-center justify-center border-b border-slate-200 pb-8 md:w-[220px] md:border-b-0 md:border-r md:pb-0 dark:border-slate-800">
              <div className="text-5xl font-black tabular-nums text-navy-900 dark:text-white">
                {avgRating > 0 ? avgRating.toFixed(1) : '—'}
              </div>
              <div className="mt-2 flex gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={clsx(
                      'h-5 w-5 transition-transform',
                      s <= Math.round(avgRating) ? 'fill-current scale-100' : 'text-slate-300 dark:text-slate-600'
                    )}
                  />
                ))}
              </div>
              <p className="mt-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                {total > 0 ? (
                  <>
                    <span className="font-bold text-navy-900 dark:text-slate-200">{total}</span> đánh giá
                  </>
                ) : (
                  'Chưa có đánh giá'
                )}
              </p>
            </div>

            <div className="flex flex-1 flex-col justify-center space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = distribution[star] || 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <span className="flex w-12 shrink-0 items-center gap-0.5 font-semibold text-slate-600 dark:text-slate-300">
                      {star}
                      <Star className="h-3.5 w-3.5 text-amber-400" />
                    </span>
                    <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <motion.div
                        initial={false}
                        animate={{ width: `${pct}%` }}
                        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                      />
                    </div>
                    <span className="w-11 shrink-0 text-right text-xs font-semibold text-slate-500">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {isAuthenticated && (
            <div className="mt-8 rounded-2xl border border-amber-200/60 bg-amber-50/40 p-6 dark:border-amber-900/30 dark:bg-amber-950/20">
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">Viết đánh giá</h3>
              {eligibleLoading ? (
                <div className="mt-4 flex items-center gap-2 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang kiểm tra quyền đánh giá…
                </div>
              ) : eligible.length === 0 ? (
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Bạn cần có booking <strong>đã hoàn thành</strong> tại phòng {displayRoomName(room.room_number)} và chưa đánh giá booking đó.{' '}
                  <Link to="/my-bookings" className="font-semibold text-amber-700 underline dark:text-amber-400">
                    Xem lịch sử booking
                  </Link>
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Booking hoàn thành
                    </label>
                    <select
                      value={bookingId}
                      onChange={(e) => setBookingId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-navy-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      required
                    >
                      <option value="">— Chọn mã booking —</option>
                      {eligible.map((b) => (
                        <option key={b.id} value={b.id}>
                          #{b.id} · {formatDateRange(b.check_in_date, b.check_out_date)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <StarRatingInput value={rating} onChange={setRating} disabled={submitting} />
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Bình luận
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      placeholder="Chia sẻ trải nghiệm: độ sạch, tiện nghi, nhân viên…"
                      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-navy-900 placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy-900 to-navy-800 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:from-navy-800 hover:to-navy-700 disabled:opacity-60"
                  >
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4" />}
                    Gửi đánh giá
                  </button>
                </form>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-6 text-center dark:border-slate-800 dark:bg-slate-900/40">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <Link to="/login" className="font-bold text-amber-700 underline dark:text-amber-400">
                  Đăng nhập
                </Link>{' '}
                để xem quyền đánh giá sau kỳ nghỉ của bạn.
              </p>
            </div>
          )}

          <div className="mt-10">
            <h3 className="text-lg font-bold text-navy-900 dark:text-white">Nhận xét gần đây</h3>
            {reviews.length === 0 ? (
              <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center dark:border-slate-800 dark:bg-slate-900/20">
                <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-white shadow-inner dark:bg-slate-800">
                  <MessageSquareText className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-lg font-bold text-navy-900 dark:text-white">Chưa có nhận xét nào</p>
                <p className="mt-2 max-w-md text-sm text-slate-500">
                  Hãy là người đầu tiên chia sẻ trải nghiệm sau khi hoàn tất lưu trú tại phòng này.
                </p>
              </div>
            ) : (
              <ul className="mt-6 space-y-5">
                <AnimatePresence initial={false}>
                  {visibleSlice.map((r, index) => {
                    const isMine = user && Number(r.user_id) === Number(user.id);
                    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.user_name || 'K')}&background=11254d&color=c6a96a&size=128`;
                    return (
                      <motion.li
                        key={r.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/60 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 sm:p-6"
                      >
                        <div className="flex gap-4">
                          <img
                            src={avatarUrl}
                            alt=""
                            className="h-12 w-12 shrink-0 rounded-full border-2 border-white object-cover shadow-md dark:border-slate-700 bg-navy-900"
                            onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=K&background=11254d&color=c6a96a&size=128`; }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <p className="font-bold text-navy-900 dark:text-white">{r.user_name || 'Khách'}</p>
                                <p className="text-xs text-slate-500">
                                  {formatDate(r.created_at)}
                                  {r.updated_at && r.updated_at !== r.created_at && (
                                    <span className="ml-2 text-slate-400">· đã chỉnh sửa</span>
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 text-amber-400">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={clsx('h-4 w-4', s <= r.rating ? 'fill-current' : 'text-slate-200 dark:text-slate-700')}
                                  />
                                ))}
                              </div>
                            </div>
                            {editing === r.id ? (
                              <div className="mt-4 space-y-4 rounded-xl border border-amber-200/50 bg-white p-4 dark:border-amber-900/40 dark:bg-slate-950">
                                <StarRatingInput value={editRating} onChange={setEditRating} disabled={false} />
                                <textarea
                                  value={editComment}
                                  onChange={(e) => setEditComment(e.target.value)}
                                  rows={3}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                />
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={saveEdit}
                                    className="rounded-lg bg-navy-900 px-4 py-2 text-xs font-bold text-white"
                                  >
                                    Lưu
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold dark:border-slate-600"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                    Hủy
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                “{r.comment}”
                              </p>
                            )}
                            {isMine && editing !== r.id && (
                              <div className="mt-4 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEdit(r)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-navy-900 shadow-sm transition hover:border-amber-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Sửa
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeReview(r.id)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-800 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Xóa
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            )}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-navy-900 transition hover:border-amber-400 hover:bg-amber-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
                >
                  Xem thêm
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
