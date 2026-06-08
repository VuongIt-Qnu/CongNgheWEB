import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Compass, ShieldCheck, Award, Phone } from 'lucide-react';
import { BRAND, LOCATION } from '../../constants/branding';
import api from '../../services/api';
import { hotelImages } from '../../constants/images';
import RoomCard from '../../components/rooms/RoomCard';
import RoomPagination from '../../components/rooms/RoomPagination';
import RoomSearchFilter, { typeIdsMatchingAmenities } from '../../components/rooms/RoomSearchFilter';
import RoomsGridSkeleton from '../../components/rooms/RoomsGridSkeleton';
import SafeImage from '../../components/SafeImage';
import { localTodayISO, addDaysISO } from '../../utils/dateFormat';

const PAGE_LIMIT = 9;
const SUPPORT_TEL = 'tel:+842563848888';

function defaultFilters() {
  const ci = localTodayISO();
  return {
    checkIn: ci,
    checkOut: addDaysISO(ci, 3),
    guests: '2',
    roomSlotCount: '1',
    search: '',
    roomTypeId: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    amenities: [],
  };
}

export default function RoomsPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => {
    const ci = searchParams.get('checkIn') || localTodayISO();
    const co = searchParams.get('checkOut') || addDaysISO(ci, 3);
    const guests = searchParams.get('guests') || '2';
    const roomTypeId = searchParams.get('roomTypeId') || '';
    return {
      checkIn: ci,
      checkOut: co,
      guests,
      roomSlotCount: '1',
      search: '',
      roomTypeId,
      minPrice: '',
      maxPrice: '',
      minRating: '',
      amenities: [],
    };
  });
  const [rooms, setRooms] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pulse, setPulse] = useState(0);
  const [loading, setLoading] = useState(true);
  const [roomTypes, setRoomTypes] = useState([]);

  useEffect(() => {
    api
      .get('/room-types')
      .then((res) => setRoomTypes(res.data || []))
      .catch(() => setRoomTypes([]));
  }, []);

  const loadRooms = useCallback(async () => {
    const { typesParam, impossible } = typeIdsMatchingAmenities(filters.amenities, roomTypes);
    if (impossible) {
      setRooms([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    const params = {
      page,
      limit: PAGE_LIMIT,
      search: filters.search.trim() || undefined,
      min_price: filters.minPrice !== '' ? Number(filters.minPrice) : undefined,
      max_price: filters.maxPrice !== '' ? Number(filters.maxPrice) : undefined,
      min_capacity: filters.guests ? Number(filters.guests) : undefined,
      min_rating: filters.minRating !== '' ? Number(filters.minRating) : undefined,
    };

    if (filters.roomTypeId) params.type = filters.roomTypeId;
    if (typesParam) params.types = typesParam;

    const useAvail =
      filters.checkIn &&
      filters.checkOut &&
      filters.checkOut > filters.checkIn;

    try {
      setLoading(true);
      const response = await api.get(useAvail ? '/rooms/available' : '/rooms', {
        params: useAvail ? { ...params, check_in_date: filters.checkIn, check_out_date: filters.checkOut } : params,
      });
      setRooms(response.data.rooms || []);
      setTotal(response.data.total ?? 0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không tải được danh sách phòng');
      setRooms([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page, roomTypes, pulse]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const totalPages = Math.ceil(Number(total || 0) / PAGE_LIMIT) || 1;

  return (
    <div className="min-h-screen scroll-smooth">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[min(72vh,640px)] overflow-hidden">
        <div className="absolute inset-0">
          <SafeImage src={hotelImages.hero} alt="" aspectRatio="" containerClassName="h-full w-full" priority />
          <div className="absolute inset-0 bg-gradient-to-br from-navy-900/95 via-navy-900/85 to-navy-800/80" />
          {/* Decorative gradient orbs */}
          <div className="absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute -right-20 bottom-1/4 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pt-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-500 backdrop-blur-sm">
              {BRAND.full} · Coastal Collection
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-[3.5rem] lg:leading-tight">
              Chọn không gian sống
              <br />
              <span className="bg-gradient-to-r from-gold-500 to-[#e6c882] bg-clip-text text-transparent">
                theo đúng ý của bạn
              </span>
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-blue-50/80 md:text-xl">
              Trải nghiệm đặt phòng kiểu resort 5★ — ảnh thật studio, badge giảm giá thông minh, bộ lọc linh hoạt và chỉ báo phòng trống theo thời gian thực.
            </p>
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-white">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4 text-gold-500" /> Cam kết giá tốt
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Compass className="h-4 w-4 text-gold-500" /> Bản đồ & chauffeur
              </span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <RoomSearchFilter
              roomTypes={roomTypes}
              values={filters}
              onChange={setFilters}
              loading={loading}
              onSearch={() => {
                if (filters.checkOut && filters.checkIn && filters.checkOut <= filters.checkIn) {
                  toast.error('Ngày trả phòng phải sau ngày nhận phòng.');
                  return;
                }
                setPage(1);
                setPulse((n) => n + 1);
              }}
              className="shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* ===== ROOMS LISTING ===== */}
      <section className="relative z-[1] -mt-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {/* Results header — compact glass chips */}
        <div className="flex flex-col items-stretch gap-2.5 pb-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
            className="inline-flex items-center gap-3 rounded-xl border border-white/60 bg-white/90 px-4 py-2.5 shadow-[0_4px_20px_rgba(15,23,42,0.1)] backdrop-blur-md sm:py-3"
          >
            <div className="min-w-0 text-center sm:text-left">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#475569]">
                Kết quả tìm kiếm
              </p>
              <p className="font-display mt-0.5 text-base font-bold uppercase leading-snug text-[#0F172A] sm:text-lg">
                <span className="tabular-nums text-[#0F172A]">{loading ? '…' : total}</span>{' '}
                <span className="text-[13px] font-semibold sm:text-sm">phòng phù hợp</span>
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.4, ease: 'easeOut' }}
            className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/60 bg-white/90 px-4 py-2.5 shadow-[0_4px_20px_rgba(15,23,42,0.1)] backdrop-blur-md sm:justify-start sm:py-3"
          >
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-gold-500/15 bg-gold-500/10">
              <Phone className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={2.25} />
            </div>
            <div className="min-w-0 text-center sm:text-left">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#475569]">
                Hỗ trợ 24/7
              </p>
              <a
                href={SUPPORT_TEL}
                className="mt-0.5 inline-block font-display text-sm font-bold tracking-tight text-[#D4AF37] transition-colors duration-200 hover:text-[#b8962e] sm:text-[15px]"
              >
                {LOCATION.phoneIntl}
              </a>
            </div>
          </motion.div>
        </div>

        {/* Room grid */}
        {loading ? (
          <RoomsGridSkeleton count={PAGE_LIMIT} />
        ) : rooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-dashed border-slate-200 bg-white p-14 text-center shadow-[0_8px_30px_rgba(10,26,54,0.05)]"
          >
            <SafeImage
              src={hotelImages.empty}
              alt=""
              aspectRatio=""
              containerClassName="mx-auto h-52 w-52 rounded-3xl opacity-95 shadow-xl"
            />
            <h3 className="mt-10 text-xl font-bold text-navy-900">Chưa tìm thấy căn phòng phù hợp</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
              Đổi bộ lọc ngày, mở rộng khoảng giá hoặc bớt tiện nghi mong muốn — chúng tôi luôn có các phòng mới mở bán trong ngày.
            </p>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setFilters(defaultFilters());
                setPage(1);
                setPulse((n) => n + 1);
              }}
              className="mt-8 rounded-full bg-navy-900 px-10 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-navy-800"
            >
              Đặt lại tiêu chí
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room, i) => (
              <RoomCard key={room.id} room={room} delay={Math.min(i, 12) * 0.045} />
            ))}
          </div>
        )}

        {!loading && Number(total) > 0 && totalPages > 1 && (
          <RoomPagination page={page} totalPages={totalPages} disabled={loading} onPageChange={setPage} />
        )}
      </section>
    </div>
  );
}
