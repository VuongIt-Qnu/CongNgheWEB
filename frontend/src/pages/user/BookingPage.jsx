import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarRange, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import api, { API_HOST } from '../../services/api';
import { amenitiesForRoomType, buildRoomGallery, getDisplayPricing } from '../../utils/roomMeta';
import BookingSummaryCard from '../../components/booking/BookingSummaryCard';
import VnDateInput from '../../components/common/VnDateInput';
import { localTodayISO, addDaysISO, nightsBetween, isCheckOutAfterCheckIn } from '../../utils/dateFormat';

/**
 * Validate ISO date (YYYY-MM-DD) is a real calendar date.
 */
function isValidISODate(isoStr) {
  if (!isoStr || typeof isoStr !== 'string') return false;
  const match = isoStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20';

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qpRoomId = searchParams.get('roomId') || '';

  const [roomId, setRoomId] = useState(qpRoomId);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [room, setRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(Boolean(qpRoomId));

  useEffect(() => {
    const idFromUrl = searchParams.get('roomId') || '';
    if (idFromUrl) setRoomId(idFromUrl);
  }, [searchParams]);

  useEffect(() => {
    const ci = searchParams.get('checkIn');
    const co = searchParams.get('checkOut');
    const d0 = localTodayISO();
    setCheckIn(ci || d0);
    setCheckOut(co || addDaysISO(ci || d0, 2));
  }, [searchParams]);

  useEffect(() => {
    let cancel = false;
    if (!roomId) {
      setRoom(null);
      setLoadingRoom(false);
      return undefined;
    }
    setLoadingRoom(true);
    api
      .get(`/rooms/${roomId}`)
      .then(({ data }) => {
        if (!cancel) setRoom(data);
      })
      .catch(() => {
        if (!cancel) {
          toast.error('Không tải được thông tin phòng.');
          setRoom(null);
        }
      })
      .finally(() => {
        if (!cancel) setLoadingRoom(false);
      });
    return () => {
      cancel = true;
    };
  }, [roomId]);

  // ── Date validation ──
  const today = localTodayISO();
  const validationErrors = useMemo(() => {
    const errors = {};
    if (!checkIn) {
      errors.checkIn = 'Vui lòng chọn ngày nhận phòng';
    } else if (!isValidISODate(checkIn)) {
      errors.checkIn = 'Ngày nhận phòng không hợp lệ';
    } else if (checkIn < today) {
      errors.checkIn = 'Ngày nhận phòng không thể ở quá khứ';
    }

    if (!checkOut) {
      errors.checkOut = 'Vui lòng chọn ngày trả phòng';
    } else if (!isValidISODate(checkOut)) {
      errors.checkOut = 'Ngày trả phòng không hợp lệ';
    } else if (checkIn && isValidISODate(checkIn) && !isCheckOutAfterCheckIn(checkIn, checkOut)) {
      errors.checkOut = 'Ngày trả phòng phải sau ngày nhận phòng';
    }

    // nights check
    if (!errors.checkIn && !errors.checkOut) {
      const n = nightsBetween(checkIn, checkOut);
      if (n <= 0) {
        errors.checkOut = 'Khoảng thời gian lưu trú phải ít nhất 1 đêm';
      }
    }

    return errors;
  }, [checkIn, checkOut, today]);

  const isFormValid = useMemo(() => {
    return (
      roomId &&
      room &&
      !loadingRoom &&
      Object.keys(validationErrors).length === 0
    );
  }, [roomId, room, loadingRoom, validationErrors]);

  const nights = nightsBetween(checkIn, checkOut);
  const estimates = useMemo(() => {
    if (!room) return { line: '', lineNum: 0 };
    const { price } = getDisplayPricing(room);
    const n = Math.max(nights || 1, 1);
    const lineNum = price * n;
    return {
      line: `${price.toLocaleString('vi-VN')} ₫ × ${n} đêm`,
      lineNum,
    };
  }, [room, nights]);

  const galleryThumb = room ? buildRoomGallery(room, room.images || [], API_HOST)[0] : null;
  const amenities = room ? amenitiesForRoomType(room.room_type_name).slice(0, 6) : [];

  // ── Submit: NO API call — just navigate with state ──
  const submit = (event) => {
    event.preventDefault();
    if (!isFormValid) {
      toast.error('Vui lòng kiểm tra lại thông tin đặt phòng');
      return;
    }
    // Navigate to payment page with booking data in React Router state
    // NO booking is created in the database at this step
    navigate('/payment', {
      state: {
        roomId: Number(roomId),
        checkIn,
        checkOut,
      },
    });
  };

  return (
    <section className="page-container py-8 pb-16 lg:py-12">
      <Link
        to={room?.id ? `/room/${room.id}` : '/rooms'}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-navy-900 transition hover:text-gold-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 max-w-2xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-600">
          <CalendarRange className="h-4 w-4" />
          Xác nhận đặt phòng
        </div>
        <h1 className="text-heading-lg mt-2 text-3xl font-bold text-navy-900 sm:text-4xl">
          Hoàn tất lịch lưu trú
        </h1>
        <p className="text-body mt-2 text-slate-600">
          Kiểm tra thông tin phòng và chọn ngày. Hệ thống tự tính tạm tính theo số đêm.
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="space-y-6 lg:col-span-5">
          {loadingRoom && (
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải phòng…
            </div>
          )}
          {!loadingRoom && room && (
            <BookingSummaryCard room={room} imageSrc={galleryThumb} amenities={amenities} />
          )}
          {!loadingRoom && !room && roomId && (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              Không tìm thấy phòng. Kiểm tra lại mã hoặc{' '}
              <Link to="/rooms" className="font-semibold underline">
                chọn phòng khác
              </Link>
              .
            </p>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8 lg:col-span-7"
        >
          <form onSubmit={submit} className="grid gap-5">
            {!qpRoomId && (
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-800">Mã phòng (ID hệ thống)</span>
                <input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="VD: 3"
                  required
                  className={inputClass}
                />
                <span className="text-xs text-slate-500">
                  Lấy từ URL chi tiết phòng: <code className="rounded bg-slate-100 px-1">/room/3</code> → 3
                </span>
              </label>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-800">Nhận phòng</span>
                <VnDateInput
                  value={checkIn}
                  min={today}
                  onChange={setCheckIn}
                  required
                  className={inputClass}
                />
                {validationErrors.checkIn && (
                  <span className="flex items-center gap-1 text-xs font-medium text-rose-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {validationErrors.checkIn}
                  </span>
                )}
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-800">Trả phòng</span>
                <VnDateInput
                  value={checkOut}
                  min={checkIn || today}
                  onChange={setCheckOut}
                  required
                  className={inputClass}
                />
                {validationErrors.checkOut && (
                  <span className="flex items-center gap-1 text-xs font-medium text-rose-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {validationErrors.checkOut}
                  </span>
                )}
              </label>
            </div>

            {room && nights > 0 && !validationErrors.checkIn && !validationErrors.checkOut && (
              <div className="rounded-2xl border border-gold-500/25 bg-gradient-to-br from-navy-900/[0.04] to-gold-500/5 p-5">
                <p className="text-sm font-bold text-navy-900">Tạm tính</p>
                <p className="mt-1 text-sm text-slate-600">{estimates.line}</p>
                <p className="mt-2 text-2xl font-bold text-navy-900">
                  {estimates.lineNum.toLocaleString('vi-VN')} ₫
                </p>
                <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" />
                  Giá cuối cùng có thể điều chỉnh khi check-in tại quầy lễ tân.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!isFormValid}
              className="rounded-xl bg-gradient-to-r from-navy-900 to-navy-800 py-3.5 text-sm font-bold text-white shadow-lg transition hover:shadow-luxury disabled:cursor-not-allowed disabled:opacity-60"
            >
              Tiếp tục
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
