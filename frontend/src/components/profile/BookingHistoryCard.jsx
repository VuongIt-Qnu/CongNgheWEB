import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatDateRange } from '../../utils/dateFormat';
import { ArrowRight, Calendar, ClipboardList, CreditCard, Star } from 'lucide-react';
import { bookingStatusLabel, bookingStatusBadgeClass, displayRoomName } from '../../constants/labels';

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((k) => (
        <div key={k} className="h-20 animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}

export default function BookingHistoryCard({ bookings, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-card sm:p-8"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-gold-500" />
          <h2 className="text-heading text-lg font-bold text-navy-900">Booking gần đây</h2>
        </div>
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gold-600 transition hover:text-gold-500"
        >
          Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <SkeletonRows />
      ) : !bookings || bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">Chưa có booking nào</p>
          <Link
            to="/rooms"
            className="mt-4 inline-block rounded-full bg-navy-900 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-navy-800"
          >
            Khám phá phòng
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.slice(0, 5).map((b) => (
            <div
              key={b.id}
              className="group flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3 transition hover:border-gold-500/20 hover:bg-slate-50/80"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-navy-900">
                    {displayRoomName(b.room_number || b.room_id)}
                  </p>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${bookingStatusBadgeClass(
                      b.status
                    )}`}
                  >
                    {bookingStatusLabel(b.status)}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDateRange(b.check_in_date, b.check_out_date)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    {Number(b.total_price || 0).toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {String(b.status || '').toLowerCase() === 'completed' &&
                Number(b.booking_review_count || 0) === 0 ? (
                  <Link
                    to={`/room/${b.room_id}?bookingId=${b.id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1.5 text-[11px] font-bold text-amber-800 ring-1 ring-amber-500/30 transition hover:bg-amber-500/25"
                  >
                    <Star className="h-3 w-3" />
                    Đánh giá
                  </Link>
                ) : String(b.status || '').toLowerCase() === 'completed' &&
                  Number(b.booking_review_count || 0) > 0 ? (
                  <span className="text-[11px] font-semibold text-emerald-600">✓ Đã đánh giá</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
