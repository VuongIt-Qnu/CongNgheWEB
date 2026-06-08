import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Loader2, ShieldCheck, Gift, Clock, Users, CheckCircle2, X
} from 'lucide-react';
import api, { API_HOST } from '../../services/api';
import { buildRoomGallery } from '../../utils/roomMeta';
import { formatDateRange, nightsBetween } from '../../utils/dateFormat';

const containerClass = 'rounded-2xl border border-slate-200 bg-white p-6 md:p-8';
const sectionTitleClass = 'text-sm font-bold uppercase tracking-wider text-slate-600 mb-4';
const badgeClass = 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gold-100 text-gold-900';

export default function BookingSummaryPage() {
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      toast.error('Không tìm thấy thông tin đặt phòng');
      navigate('/rooms');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingRes, servicesRes] = await Promise.all([
          api.get(`/bookings/${bookingId}/summary`),
          api.get('/services'),
        ]);

        if (bookingRes.data.status !== 'draft') {
          toast.error('Booking không ở trạng thái draft');
          navigate('/my-bookings');
          return;
        }

        setBooking(bookingRes.data);
        setServices(bookingRes.data.services || []);
        setAllServices(servicesRes.data.services || []);
      } catch (error) {
        toast.error('Lỗi khi tải thông tin');
        navigate('/my-bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId, navigate]);

  const nights = useMemo(() => {
    if (!booking) return 0;
    return nightsBetween(booking.check_in_date, booking.check_out_date);
  }, [booking]);

  const selectedServiceIds = useMemo(() => {
    return new Set(services.map(s => s.service_id));
  }, [services]);

  const priceBreakdown = useMemo(() => {
    if (!booking) return { roomTotal: 0, serviceTotal: 0, subtotal: 0, tax: 0, grand: 0 };
    const roomTotal = booking.total_price;
    const serviceTotal = services.reduce((sum, s) => sum + (s.total_price || 0), 0);
    const subtotal = roomTotal + serviceTotal;
    const tax = subtotal * 0.1;
    const grand = subtotal + tax;
    return { roomTotal, serviceTotal, subtotal, tax, grand };
  }, [booking, services]);

  const addService = async (serviceId) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/services`, {
        service_id: serviceId,
        quantity: 1,
      });
      setServices(response.data.services || []);
      toast.success('Đã thêm dịch vụ');
    } catch (error) {
      toast.error('Lỗi khi thêm dịch vụ');
    }
  };

  const removeService = async (bookingServiceId) => {
    try {
      const response = await api.delete(`/bookings/${bookingId}/services/${bookingServiceId}`);
      setServices(response.data.services || []);
      toast.success('Đã xóa dịch vụ');
    } catch (error) {
      toast.error('Lỗi khi xóa dịch vụ');
    }
  };

  const handleContinue = async () => {
    try {
      setSubmitting(true);
      navigate(`/payment/${bookingId}`);
    } catch (error) {
      toast.error('Lỗi khi tiếp tục');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="page-container py-8 pb-16 lg:py-12">
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải thông tin...
        </div>
      </section>
    );
  }

  if (!booking) {
    return (
      <section className="page-container py-8 pb-16 lg:py-12">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800">
          Không tìm thấy thông tin đặt phòng
        </div>
      </section>
    );
  }

  const gallery = buildRoomGallery(booking, booking.images || [], API_HOST);

  return (
    <section className="page-container py-8 pb-16 lg:py-12">
      <Link
        to="/rooms"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-navy-900 transition hover:text-gold-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 max-w-2xl">
        <h1 className="text-heading-lg text-3xl font-bold text-navy-900 sm:text-4xl">
          Xác nhận đặt phòng
        </h1>
        <p className="text-body mt-2 text-slate-600">
          Chọn dịch vụ đi kèm và xem chi tiết thanh toán
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Room Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room Details */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={containerClass}>
            <div className={sectionTitleClass}>Thông tin phòng</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Phòng</p>
                <p className="text-lg font-bold text-navy-900">{booking.room_number}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Loại phòng</p>
                <p className="text-lg font-bold text-navy-900">{booking.room_type_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Nhận phòng</p>
                <p className="text-sm font-semibold text-navy-900">{booking.check_in_date}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Trả phòng</p>
                <p className="text-sm font-semibold text-navy-900">{booking.check_out_date}</p>
              </div>
              <div className="sm:col-span-2">
                <div className="flex gap-3 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {nights} đêm
                  </span>
                  {booking.room_capacity && (
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {booking.room_capacity} khách
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={containerClass}>
            <div className={sectionTitleClass}>Dịch vụ đi kèm</div>
            {allServices.length === 0 ? (
              <p className="text-sm text-slate-500">Không có dịch vụ khả dụng</p>
            ) : (
              <div className="space-y-3">
                {allServices.map((svc) => {
                  const isSelected = selectedServiceIds.has(svc.id);
                  return (
                    <motion.div
                      key={svc.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`rounded-xl border-2 p-4 transition cursor-pointer ${
                        isSelected
                          ? 'border-gold-500 bg-gold-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                      onClick={() => (isSelected ? removeService(services.find(s => s.service_id === svc.id)?.id) : addService(svc.id))}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-navy-900">{svc.name}</h4>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-gold-600" />}
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{svc.description}</p>
                        </div>
                        <span className="ml-4 whitespace-nowrap font-bold text-gold-600">
                          {svc.price.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Selected Services Summary */}
          {services.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={containerClass}>
              <div className={sectionTitleClass}>Dịch vụ đã chọn</div>
              <div className="space-y-2">
                {services.map((svc) => (
                  <motion.div
                    key={svc.id}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 10, opacity: 0 }}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                  >
                    <div>
                      <p className="font-medium text-navy-900">{svc.name}</p>
                      <p className="text-xs text-slate-600">Số lượng: {svc.quantity}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-navy-900">
                        {svc.total_price.toLocaleString('vi-VN')} ₫
                      </span>
                      <button
                        onClick={() => removeService(svc.id)}
                        className="text-slate-400 hover:text-rose-600 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Price Breakdown */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={containerClass}>
          <div className={sectionTitleClass}>Chi tiết thanh toán</div>

          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-slate-600">Tiền phòng ({nights} đêm)</span>
              <span className="font-semibold text-navy-900">
                {priceBreakdown.roomTotal.toLocaleString('vi-VN')} ₫
              </span>
            </div>

            {priceBreakdown.serviceTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">Tiền dịch vụ</span>
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

          <button
            onClick={handleContinue}
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-gold px-6 py-3 text-center font-bold text-navy-900 shadow-lg transition hover:shadow-xl disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            ) : (
              'Tiếp tục thanh toán'
            )}
          </button>

          <div className="mt-6 flex items-start gap-3 rounded-lg bg-blue-50 p-3">
            <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900">
              Thông tin của bạn được mã hóa và bảo vệ an toàn
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
