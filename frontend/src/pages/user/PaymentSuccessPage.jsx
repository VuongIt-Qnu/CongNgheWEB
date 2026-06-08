import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, FileText, Home, Printer, ShieldCheck, HelpCircle, QrCode, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import InvoiceUI from '../../components/booking/InvoiceUI';
import { paymentMethodLabel, isPaidPaymentStatus, isAwaitingPaymentStatus } from '../../constants/labels';
import { formatDateTime } from '../../utils/dateFormat';

export default function PaymentSuccessPage() {
  const { bookingId } = useParams();

  const [payment, setPayment] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const { data: bookingData } = await api.get(`/bookings/${bookingId}`);
        setBooking(bookingData);

        // Get payment info
        if (bookingData.payment_id) {
          const { data: paymentData } = await api.get(`/payments/${bookingData.payment_id}`);
          setPayment(paymentData);
        }
      } catch {
        toast.error('Không tìm thấy dữ liệu giao dịch liên quan.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-gold-600" />
        <p className="text-sm font-semibold text-slate-500">Đang tải thông tin giao dịch…</p>
      </div>
    );
  }

  const method = payment?.payment_method || 'credit_card';
  const status = String(payment?.payment_status || 'pending').toLowerCase();
  const isPaid = isPaidPaymentStatus(status);
  const isAwaiting = isAwaitingPaymentStatus(status);
  const isCash = method === 'cash';
  const amount = Number(payment?.amount || 0);

  const title = isPaid
    ? 'Thanh toán thành công!'
    : isCash
      ? 'Đặt phòng thành công!'
      : 'Đang chờ xác nhận thanh toán';

  const subtitle = isPaid
    ? 'Giao dịch của bạn đã được xác nhận thành công.'
    : isCash
      ? 'Đặt phòng của bạn đã được xác nhận. Vui lòng thanh toán trực tiếp khi check-in tại quầy lễ tân.'
      : method === 'bank_transfer'
        ? 'Vui lòng hoàn tất chuyển khoản theo thông tin bên dưới. Admin sẽ xác nhận sau khi nhận được tiền.'
        : 'Yêu cầu thanh toán của bạn đang được xử lý. Vui lòng chờ admin xác nhận giao dịch.';

  const statusBadge = isPaid
    ? { label: 'Đã thanh toán', className: 'text-emerald-700 bg-emerald-500/10' }
    : status === 'failed'
      ? { label: 'Thất bại', className: 'text-rose-700 bg-rose-500/10' }
      : status === 'processing'
        ? { label: 'Đang xử lý', className: 'text-blue-700 bg-blue-500/10' }
        : { label: 'Chờ thanh toán', className: 'text-amber-700 bg-amber-500/10' };

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 pb-24 text-center sm:px-6">
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 100 }}
        className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
          isPaid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
        }`}
      >
        {isPaid ? <CheckCircle2 className="h-12 w-12" /> : <Clock className="h-12 w-12" />}
      </motion.div>

      <motion.h1
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="font-serif text-3xl font-bold text-navy-900 mt-6"
      >
        {title}
      </motion.h1>
      <motion.p
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-slate-500 text-sm mt-2 max-w-md mx-auto"
      >
        {subtitle}
      </motion.p>

      {isAwaiting && method === 'bank_transfer' && (
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left text-sm"
        >
          <h4 className="text-xs font-bold uppercase tracking-wider text-navy-950 mb-3">Thông tin chuyển khoản</h4>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="mx-auto flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white">
              <QrCode className="h-14 w-14 text-slate-800" />
            </div>
            <div className="space-y-1.5 text-slate-700 font-medium">
              <p>Chủ tài khoản: <span className="font-bold text-navy-900">CONG TY TNHH AURORA RESORT</span></p>
              <p>Số tài khoản: <span className="font-mono font-bold text-navy-900">1029 3848 5960</span></p>
              <p>Ngân hàng: <span className="font-bold text-navy-900">Vietcombank - CN Bình Định</span></p>
              <p>Số tiền: <span className="font-mono font-bold text-gold-600">{amount.toLocaleString('vi-VN')} ₫</span></p>
              <p>Nội dung CK: <span className="font-mono font-bold text-gold-600 bg-gold-500/10 px-2 py-0.5 rounded">AUR BK{payment?.booking_id || bookingId}</span></p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card text-left text-sm font-medium"
      >
        <h3 className="font-bold text-navy-950 text-base pb-3 border-b border-slate-100 flex items-center justify-between">
          <span>Thông tin giao dịch</span>
          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded uppercase ${statusBadge.className}`}>
            {statusBadge.label}
          </span>
        </h3>

        <div className="mt-4 space-y-3 text-slate-600 font-medium">
          <div className="flex justify-between">
            <span>Mã đặt phòng (Booking ID):</span>
            <span className="font-mono font-bold text-navy-950">BK-{String(payment?.booking_id || bookingId).padStart(4, '0')}</span>
          </div>
          <div className="flex justify-between">
            <span>Mã giao dịch (Transaction ID):</span>
            <span className="font-mono font-bold text-navy-950">{payment?.transaction_id || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span>Tổng tiền:</span>
            <span className="font-mono font-bold text-navy-950">{amount.toLocaleString('vi-VN')} ₫</span>
          </div>
          <div className="flex justify-between">
            <span>Phương thức thanh toán:</span>
            <span className="font-bold text-navy-950">{paymentMethodLabel(method)}</span>
          </div>
          <div className="flex justify-between">
            <span>Trạng thái đặt phòng:</span>
            <span className="font-bold text-navy-950 capitalize">{booking?.status || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span>Thời gian tạo giao dịch:</span>
            <span className="font-bold text-navy-950">
              {formatDateTime(payment?.created_at || new Date())}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-400">
          <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0" />
          Hóa đơn điện tử Aurora Resort Quy Nhơn được ký số bảo mật.
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
      >
        <Link
          to="/my-bookings"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-navy-900 to-navy-800 px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:shadow-luxury"
        >
          <FileText className="h-4 w-4" />
          Xem booking của tôi
        </Link>

        {isPaid && (
          <button
            onClick={() => setShowInvoice(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            In hóa đơn chi tiết
          </button>
        )}

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          <Home className="h-4 w-4 text-slate-500" />
          Về trang chủ
        </Link>
      </motion.div>

      <p className="mt-8 text-xs font-medium text-slate-400 flex items-center justify-center gap-1">
        <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
        Cần trợ giúp? Liên hệ hotline bộ phận CSKH Resort: <span className="font-bold text-navy-900">1900 6868</span>
      </p>

      <AnimatePresence>
        {showInvoice && booking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <InvoiceUI booking={booking} onClose={() => setShowInvoice(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
