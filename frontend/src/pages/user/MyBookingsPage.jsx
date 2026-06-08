import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  CreditCard, FileText, RefreshCw, Star, Info, XCircle, Loader2, AlertCircle
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { paymentStatusLabel, paymentMethodLabel, isPaidPaymentStatus, isAwaitingPaymentStatus } from '../../constants/labels';
import { hotelImages } from '../../constants/images';
import { Card, PageHeader, StatusBadge } from '../../components/ui';
import { bookingStatusLabel, displayRoomName } from '../../constants/labels';
import SafeImage from '../../components/SafeImage';
import InvoiceUI from '../../components/booking/InvoiceUI';
import api from '../../services/api';
import { formatDate } from '../../utils/dateFormat';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for Invoice and Refund modals
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  
  const [refundBooking, setRefundBooking] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const fetchBookings = () => {
    setLoading(true);
    api
      .get('/bookings')
      .then((res) => setBookings(res.data.bookings || []))
      .catch(() => toast.error('Không tải được danh sách booking'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenInvoice = (booking) => {
    // Cần match đúng format cho InvoiceUI
    setSelectedBooking({
      ...booking,
      room_price: booking.total_price, // fallback
      payment_method: booking.payment_method || 'momo'
    });
    setShowInvoice(true);
  };

  const handleRequestRefund = async (e) => {
    e.preventDefault();
    if (!refundBooking || !refundReason.trim()) return;

    try {
      setSubmittingRefund(true);
      
      // Gọi API refund của payment liên quan
      await api.post(`/payments/${refundBooking.payment_id}/refund`, {
        amount: refundBooking.total_price,
        reason: refundReason
      });

      toast.success('Yêu cầu hoàn tiền đã được xử lý thành công!');
      setRefundBooking(null);
      setRefundReason('');
      fetchBookings(); // Reload data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể yêu cầu hoàn tiền lúc này.');
    } finally {
      setSubmittingRefund(false);
    }
  };

  const renderPaymentBadge = (status) => {
    const s = String(status || 'pending').toLowerCase();

    if (isPaidPaymentStatus(s)) {
      return (
        <span className="inline-flex rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-500/30">
          {paymentStatusLabel(s)}
        </span>
      );
    }
    if (s === 'failed') {
      return (
        <span className="inline-flex rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-bold text-rose-800 ring-1 ring-rose-500/30">
          {paymentStatusLabel(s)}
        </span>
      );
    }
    if (s === 'refunded') {
      return (
        <span className="inline-flex rounded-full bg-slate-500/15 px-2.5 py-1 text-xs font-bold text-slate-800 ring-1 ring-slate-500/30">
          {paymentStatusLabel(s)}
        </span>
      );
    }
    if (s === 'processing') {
      return (
        <span className="inline-flex rounded-full bg-blue-500/15 px-2.5 py-1 text-xs font-bold text-blue-800 ring-1 ring-blue-500/30">
          {paymentStatusLabel(s)}
        </span>
      );
    }
    return (
      <span className="inline-flex rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-500/30">
        {paymentStatusLabel(s)}
      </span>
    );
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title="Lịch sử đặt phòng" subtitle="Theo dõi trạng thái đặt phòng, giao dịch và hóa đơn dịch vụ lưu trú." />

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gold-600" />
        </div>
      ) : bookings.length === 0 ? (
        <Card className="overflow-hidden p-0 text-center border border-slate-200">
          <SafeImage
            src={hotelImages.empty}
            alt=""
            aspectRatio=""
            containerClassName="mx-auto max-h-48 w-full max-w-md"
          />
          <div className="p-8">
            <h3 className="text-lg font-bold text-navy-900">Chưa có đặt phòng nào</h3>
            <p className="mt-2 text-sm text-slate-600">Khám phá các căn phòng sang trọng của chúng tôi và bắt đầu chuyến hành trình.</p>
            <Link
              to="/rooms"
              className="mt-6 inline-block rounded-full bg-navy-900 px-8 py-3 text-sm font-bold text-white transition hover:bg-navy-800 shadow-md"
            >
              Khám phá phòng
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0 border border-slate-200 shadow-soft">
          <table className="min-w-full divide-y divide-slate-200 text-sm font-medium">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide text-xs">
              <tr>
                <th className="px-4 py-4 text-left font-bold">Mã</th>
                <th className="px-4 py-4 text-left font-bold">Phòng</th>
                <th className="px-4 py-4 text-left font-bold">Check-in</th>
                <th className="px-4 py-4 text-left font-bold">Check-out</th>
                <th className="px-4 py-4 text-left font-bold">Mã GD</th>
                <th className="px-4 py-4 text-right font-bold">Tổng tiền (₫)</th>
                <th className="px-4 py-4 text-left font-bold">Trạng thái đặt phòng</th>
                <th className="px-4 py-4 text-left font-bold">Trạng thái thanh toán</th>
                <th className="px-4 py-4 text-center font-bold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {bookings.map((booking) => {
                const bStatus = String(booking.status || '').toLowerCase();
                const pStatus = String(booking.payment_status || 'pending').toLowerCase();
                const isPaid = isPaidPaymentStatus(pStatus);
                const isAwaiting = isAwaitingPaymentStatus(pStatus);
                const isRefunded = pStatus === 'refunded';
                const hasActivePayment = isPaid || isAwaiting;
                
                return (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-4 font-mono font-bold text-navy-900">BK-{String(booking.id).padStart(4, '0')}</td>
                    <td className="px-4 py-4 font-bold text-navy-950">{displayRoomName(booking.room_number || booking.room_id)}</td>
                    <td className="px-4 py-4 font-semibold">{formatDate(booking.check_in_date)}</td>
                    <td className="px-4 py-4 font-semibold">{formatDate(booking.check_out_date)}</td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-500">{booking.transaction_id || '—'}</td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-navy-900">
                      {Number(booking.total_price || 0).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge>{bookingStatusLabel(booking.status)}</StatusBadge>
                    </td>
                    <td className="px-4 py-4">{renderPaymentBadge(booking.payment_status)}</td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {/* 1. NÚT ĐÁNH GIÁ (Nếu đã hoàn thành check-out và chưa đánh giá) */}
                        {bStatus === 'completed' && Number(booking.booking_review_count || 0) === 0 && (
                          <Link
                            to={`/room/${booking.room_id}?bookingId=${booking.id}`}
                            className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-900 ring-1 ring-amber-500/30 transition hover:bg-amber-500/25"
                          >
                            <Star className="h-3.5 w-3.5" />
                            Đánh giá
                          </Link>
                        )}

                        {/* 2. THANH TOÁN NGAY (nếu chưa thanh toán và booking không hủy) */}
                        {!hasActivePayment && !isRefunded && bStatus !== 'cancelled' && (
                          <button
                            onClick={() => navigate(`/payment?bookingId=${booking.id}`)}
                            className="inline-flex items-center gap-1 rounded-full bg-navy-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-navy-800 shadow-sm"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            Thanh toán ngay
                          </button>
                        )}

                        {isAwaiting && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 ring-1 ring-amber-500/20">
                            <Info className="h-3.5 w-3.5" />
                            Chờ xác nhận
                          </span>
                        )}

                        {/* 3. XEM HÓA ĐƠN (Nếu đã thanh toán hoặc đã refund) */}
                        {(isPaid || isRefunded) && (
                          <button
                            onClick={() => handleOpenInvoice(booking)}
                            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-200"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Hóa đơn
                          </button>
                        )}

                        {/* 4. YÊU CẦU HOÀN TIỀN (nếu đã thanh toán và booking chưa bị hủy) */}
                        {isPaid && bStatus !== 'cancelled' && (
                          <button
                            onClick={() => setRefundBooking(booking)}
                            className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-800 ring-1 ring-rose-500/20 transition hover:bg-rose-100"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Hoàn tiền
                          </button>
                        )}
                        
                        {/* Fallback khi không có hành động nào */}
                        {!booking.booking_review_count && isRefunded && (
                          <span className="text-xs text-slate-400">Đã kết thúc</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* RENDER INVOICE MODAL */}
      <AnimatePresence>
        {showInvoice && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <InvoiceUI booking={selectedBooking} onClose={() => setShowInvoice(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER REFUND MODAL */}
      <AnimatePresence>
        {refundBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-luxury"
            >
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="h-6 w-6" />
                <h3 className="text-lg font-serif font-bold">Yêu cầu hoàn tiền đặt phòng</h3>
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">
                Bạn đang gửi yêu cầu hoàn tiền cho booking <span className="font-bold text-navy-950 font-mono">BK-{String(refundBooking.id).padStart(4, '0')}</span> phòng <span className="font-bold text-navy-950">{refundBooking.room_number}</span> với tổng số tiền <span className="font-bold text-rose-600 font-mono">{Number(refundBooking.total_price).toLocaleString('vi-VN')} ₫</span>.
              </p>

              <form onSubmit={handleRequestRefund} className="mt-4 space-y-4">
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold text-slate-700">Lý do yêu cầu hoàn tiền</span>
                  <textarea
                    rows={4}
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    required
                    placeholder="Vui lòng cho Resort biết lý do hủy phòng & yêu cầu hoàn tiền để xử lý nhanh chóng (ví dụ: thay đổi kế hoạch du lịch, có việc đột xuất,...)..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                  />
                </label>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => { setRefundBooking(null); setRefundReason(''); }}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRefund || !refundReason.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-50"
                  >
                    {submittingRefund ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Đang xử lý…
                      </>
                    ) : (
                      'Xác nhận hoàn tiền'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
