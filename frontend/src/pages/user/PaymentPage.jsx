import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  CreditCard, Calendar, ShieldCheck, ArrowLeft, Loader2,
  QrCode, Landmark, Building2, Wallet,
} from 'lucide-react';
import api, { API_HOST } from '../../services/api';
import { formatDateRange, nightsBetween } from '../../utils/dateFormat';
import { getDisplayPricing } from '../../utils/roomMeta';

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Receive booking data from BookingPage via React Router state ──
  // NO booking exists in the database yet at this point.
  const bookingState = location.state; // { roomId, checkIn, checkOut }

  const [room, setRoom] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState('cash');

  // ── Guard: redirect if no state (user navigated directly to /payment) ──
  useEffect(() => {
    if (!bookingState || !bookingState.roomId || !bookingState.checkIn || !bookingState.checkOut) {
      toast.error('Không tìm thấy thông tin đặt phòng. Vui lòng chọn phòng trước.');
      navigate('/rooms', { replace: true });
    }
  }, [bookingState, navigate]);

  // ── Load room info + available services ──
  useEffect(() => {
    if (!bookingState?.roomId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [roomRes, servicesRes] = await Promise.all([
          api.get(`/rooms/${bookingState.roomId}`),
          api.get('/services'),
        ]);
        setRoom(roomRes.data);
        setAllServices(servicesRes.data.services || servicesRes.data || []);
      } catch (error) {
        toast.error('Lỗi khi tải thông tin phòng');
        navigate('/rooms', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingState?.roomId, navigate]);

  // ── Computed values ──
  const checkIn = bookingState?.checkIn || '';
  const checkOut = bookingState?.checkOut || '';
  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);

  const selectedServicesArray = useMemo(() => {
    return allServices.filter(s => selectedServiceIds.has(s.id));
  }, [allServices, selectedServiceIds]);

  const priceBreakdown = useMemo(() => {
    if (!room) return { roomTotal: 0, serviceTotal: 0, subtotal: 0, tax: 0, grand: 0 };
    const { price } = getDisplayPricing(room);
    const roomTotal = price * Math.max(nights, 1);
    const serviceTotal = selectedServicesArray.reduce((sum, s) => sum + Number(s.price || 0), 0);
    const subtotal = roomTotal + serviceTotal;
    const tax = subtotal * 0.1;
    const grand = subtotal + tax;
    return { roomTotal, serviceTotal, subtotal, tax, grand };
  }, [room, nights, selectedServicesArray]);

  // ── Toggle service selection (local state only — no API calls) ──
  const toggleService = (service) => {
    setSelectedServiceIds(prev => {
      const next = new Set(prev);
      if (next.has(service.id)) {
        next.delete(service.id);
      } else {
        next.add(service.id);
      }
      return next;
    });
  };

  // ── Submit: THIS is where the booking is created for the first time ──
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // Build services array
      const services = selectedServicesArray.map(s => ({
        service_id: s.id,
        quantity: 1,
      }));

      // Single atomic API call — creates booking + payment together
      const response = await api.post('/bookings/complete', {
        room_id: Number(bookingState.roomId),
        check_in_date: checkIn,
        check_out_date: checkOut,
        payment_method: method,
        services,
      });

      const { booking } = response.data;

      if (method === 'cash') {
        toast.success('Đặt phòng thành công! Vui lòng thanh toán khi nhận phòng.');
      } else if (method === 'bank_transfer') {
        toast.success('Đặt phòng thành công! Vui lòng chuyển khoản theo thông tin bên dưới.');
      } else {
        toast.success('Xác nhận thanh toán thành công!');
      }

      navigate(`/payment-success/${booking.id}`, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi thanh toán');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="page-container flex min-h-[60vh] flex-col items-center justify-center gap-3 py-12">
        <Loader2 className="h-10 w-10 animate-spin text-gold-600" />
        <p className="text-sm font-semibold text-slate-500">Đang tải thông tin thanh toán…</p>
      </div>
    );
  }

  if (!room || !bookingState) {
    return (
      <section className="page-container py-8 pb-16 lg:py-12">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800">
          Không tìm thấy thông tin đặt phòng
        </div>
      </section>
    );
  }

  const paymentMethods = [
    {
      id: 'cash',
      label: 'Thanh toán tại khách sạn',
      icon: Building2,
      description: 'Thanh toán bằng tiền mặt khi nhận phòng',
    },
    {
      id: 'bank_transfer',
      label: 'Chuyển khoản ngân hàng',
      icon: Landmark,
      description: 'Chuyển khoản trực tiếp vào tài khoản khách sạn',
    },
    {
      id: 'wallet',
      label: 'Ví điện tử',
      icon: Wallet,
      description: 'Thanh toán qua ví điện tử (Momo, ZaloPay, ...)',
    },
    {
      id: 'credit_card',
      label: 'Thẻ tín dụng',
      icon: CreditCard,
      description: 'Thanh toán qua thẻ Visa, Mastercard, ...',
    },
  ];

  return (
    <section className="page-container py-8 pb-16 lg:py-12">
      <Link
        to={`/booking?roomId=${bookingState.roomId}&checkIn=${checkIn}&checkOut=${checkOut}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-navy-900 transition hover:text-gold-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại chọn ngày
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-navy-900 sm:text-4xl">
          Chọn phương thức thanh toán
        </h1>
        <p className="text-slate-600 mt-2">
          Chọn cách thức thanh toán phù hợp nhất cho bạn
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Payment Methods & Services */}
        <div className="lg:col-span-2 space-y-6">
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8"
          >
            <h2 className="text-lg font-bold text-navy-900 mb-6">Phương thức thanh toán</h2>

            <div className="space-y-3 mb-8">
              {paymentMethods.map((pm) => {
                const Icon = pm.icon;
                return (
                  <motion.label
                    key={pm.id}
                    className={`flex items-start gap-4 rounded-xl border-2 p-4 cursor-pointer transition ${
                      method === pm.id
                        ? 'border-gold-500 bg-gold-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value={pm.id}
                      checked={method === pm.id}
                      onChange={(e) => setMethod(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-gold-600" />
                        <span className="font-semibold text-navy-900">{pm.label}</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{pm.description}</p>
                    </div>
                  </motion.label>
                );
              })}
            </div>

            {/* Bank Transfer Info */}
            {method === 'bank_transfer' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-6"
              >
                <div className="flex items-start gap-3 mb-4">
                  <QrCode className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-blue-900">Thông tin chuyển khoản</h3>
                    <p className="text-sm text-blue-800 mt-1">
                      Vui lòng chuyển khoản để đặt phòng
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-slate-600">Tên ngân hàng:</span>
                    <p className="font-semibold text-navy-900">Ngân hàng Vietcombank</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Chủ tài khoản:</span>
                    <p className="font-semibold text-navy-900">AURORA RESORT QUY NHON</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Số tài khoản:</span>
                    <p className="font-mono font-semibold text-navy-900 bg-white rounded p-2">
                      0123456789
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Số tiền:</span>
                    <p className="font-mono font-bold text-gold-600 text-lg">
                      {priceBreakdown.grand.toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Available Services */}
            {allServices.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-navy-900 mb-4">Dịch vụ bổ sung</h2>
                <div className="space-y-2">
                  {allServices.map((service) => {
                    const isSelected = selectedServiceIds.has(service.id);
                    return (
                      <label
                        key={service.id}
                        className={`flex items-center gap-3 rounded-xl border-2 p-3 cursor-pointer transition ${
                          isSelected
                            ? 'border-gold-500 bg-gold-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleService(service)}
                          className="rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-navy-900 text-sm">{service.name}</span>
                          {service.description && (
                            <p className="text-xs text-slate-500 truncate">{service.description}</p>
                          )}
                        </div>
                        <span className="text-sm font-mono font-bold text-gold-600 whitespace-nowrap">
                          {Number(service.price || 0).toLocaleString('vi-VN')} ₫
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-gold px-6 py-3.5 text-center font-bold text-navy-900 shadow-lg transition hover:shadow-xl disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                'Xác nhận đặt phòng & thanh toán'
              )}
            </button>

            <div className="mt-6 flex items-start gap-3 rounded-lg bg-blue-50 p-3">
              <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900">
                Thông tin của bạn được mã hóa SSL 256-bit và bảo vệ hoàn toàn.
                Booking chỉ được tạo sau khi bạn xác nhận thanh toán.
              </p>
            </div>
          </motion.form>
        </div>

        {/* Price Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 h-fit"
        >
          <h3 className="text-lg font-bold text-navy-900 mb-6 pb-4 border-b border-slate-100">
            Chi tiết thanh toán
          </h3>

          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Tiền phòng ({nights} đêm)</span>
              <span className="font-semibold text-navy-900">
                {priceBreakdown.roomTotal.toLocaleString('vi-VN')} ₫
              </span>
            </div>

            {priceBreakdown.serviceTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">Dịch vụ ({selectedServicesArray.length})</span>
                <span className="font-semibold text-navy-900">
                  {priceBreakdown.serviceTotal.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            )}

            <div className="border-t border-slate-200 pt-3">
              <div className="flex justify-between mb-2">
                <span className="text-slate-600">Cộng</span>
                <span className="font-semibold text-navy-900">
                  {priceBreakdown.subtotal.toLocaleString('vi-VN')} ₫
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Thuế VAT (10%)</span>
                <span className="font-semibold text-navy-900">
                  {priceBreakdown.tax.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>

            <div className="border-t-2 border-gold-500 pt-3">
              <div className="flex justify-between">
                <span className="font-bold text-navy-900">Tổng cộng</span>
                <span className="text-xl font-bold text-gold-600">
                  {priceBreakdown.grand.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>
          </div>

          {/* Booking Info */}
          <div className="space-y-3 border-t border-slate-200 pt-6 text-sm">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-slate-600">
                  {formatDateRange(checkIn, checkOut, ' — ')}
                </p>
                <p className="text-xs text-slate-500">{nights} đêm</p>
              </div>
            </div>

            <div>
              <p className="text-slate-600">Phòng: <span className="font-semibold">{room.room_number}</span></p>
            </div>

            {selectedServicesArray.length > 0 && (
              <div>
                <p className="text-slate-600 mb-2">Dịch vụ:</p>
                <ul className="text-xs text-slate-600 space-y-1 ml-4">
                  {selectedServicesArray.map((svc) => (
                    <li key={svc.id}>• {svc.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
