import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Calendar, Search, ShieldCheck, Sparkles, Star, Users, Waves } from 'lucide-react';
import api, { API_HOST } from '../../services/api';
import { hotelImages, roomGallery } from '../../constants/images';
import { Card } from '../../components/ui';
import { buildRoomGallery, getDisplayPricing } from '../../utils/roomMeta';
import { displayRoomName } from '../../constants/labels';
import toast from 'react-hot-toast';
import SafeImage from '../../components/SafeImage';
import ImageCard from '../../components/ImageCard';
import HeroSection from '../../components/layout/HeroSection';
import { BRAND, LOCATION } from '../../constants/branding';
import VnDateInput from '../../components/common/VnDateInput';
import { localTodayISO, addDaysISO, isCheckOutAfterCheckIn } from '../../utils/dateFormat';

const SLIDES = [
  {
    image: hotelImages.hero,
    title: BRAND.full,
    subtitle: 'Resort cao cấp ven biển Quy Nhơn — nơi thiên nhiên hòa quyện cùng sự tinh tế thượng lưu',
  },
  {
    image: hotelImages.resort,
    title: 'Kỳ nghỉ dưỡng ven biển Quy Nhơn',
    subtitle: 'Tận hưởng trọn vẹn từng khoảnh khắc thanh bình bên bờ biển Bình Định',
  },
  {
    image: hotelImages.pool,
    title: 'Hồ bơi vô cực hướng biển',
    subtitle: 'Đắm mình trong làn nước xanh mát ngắm hoàng hôn rực rỡ trên vịnh Quy Nhơn',
  },
];

const services = [
  { name: 'Buffet quốc tế', image: hotelImages.buffet, desc: 'Hương vị ẩm thực đỉnh cao từ các đầu bếp 5 sao quốc tế.' },
  { name: 'Spa thư giãn', image: hotelImages.spa, desc: 'Liệu trình massage đá nóng hồi phục năng lượng toàn diện.' },
  { name: 'Gym 24/7', image: hotelImages.gym, desc: 'Trang thiết bị hiện đại chuẩn tập luyện chuyên nghiệp.' },
  { name: 'Đưa đón sân bay', image: hotelImages.airport, desc: 'Dịch vụ đưa đón bằng xe limousine riêng tư.' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomTypes, setRoomTypes] = useState([]);
  const [checkIn, setCheckIn] = useState(localTodayISO());
  const [checkOut, setCheckOut] = useState(addDaysISO(localTodayISO(), 2));
  const [guests, setGuests] = useState('2');
  const [roomTypeId, setRoomTypeId] = useState('');

  useEffect(() => {
    api.get('/room-types').then((res) => setRoomTypes(res.data || [])).catch(() => setRoomTypes([]));
  }, []);

  useEffect(() => {
    api
      .get('/rooms', { params: { limit: 3, page: 1 } })
      .then((res) => setFeatured(res.data.rooms || []))
      .catch(() => setFeatured([]))
      .finally(() => setLoadingRooms(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!isCheckOutAfterCheckIn(checkIn, checkOut)) {
      toast.error('Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }
    navigate(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&roomTypeId=${roomTypeId}`);
  };

  return (
    <div className="relative w-full overflow-x-hidden">
      <HeroSection slides={SLIDES} fullScreen />

      <div id="hero-scroll-target" className="relative z-20 mx-auto -mt-16 max-w-5xl px-4 sm:-mt-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-white/60 bg-white/95 p-5 shadow-luxury backdrop-blur-xl sm:p-6"
        >
          <form onSubmit={handleSearch} className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <label className="grid gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-gold-500" /> Nhận phòng</span>
              <VnDateInput
                value={checkIn}
                min={localTodayISO()}
                onChange={setCheckIn}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pr-3 text-sm font-semibold text-slate-800 outline-none focus:border-gold-500 focus:bg-white"
              />
            </label>
            <label className="grid gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-gold-500" /> Trả phòng</span>
              <VnDateInput
                value={checkOut}
                min={checkIn || localTodayISO()}
                onChange={setCheckOut}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pr-3 text-sm font-semibold text-slate-800 outline-none focus:border-gold-500 focus:bg-white"
              />
            </label>
            <label className="grid gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-gold-500" /> Khách</span>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-gold-500"
              >
                <option value="1">1 người lớn</option>
                <option value="2">2 người lớn</option>
                <option value="3">3 người lớn</option>
                <option value="4">4+ người lớn</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <span className="flex items-center gap-1"><Waves className="h-3.5 w-3.5 text-gold-500" /> Hạng phòng</span>
              <select
                value={roomTypeId}
                onChange={(e) => setRoomTypeId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-gold-500"
              >
                <option value="">Tất cả</option>
                {roomTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-navy-900 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-gold-600"
            >
              <Search className="h-4 w-4" />
              Tìm phòng
            </button>
          </form>
        </motion.div>
      </div>

      <section className="page-container py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 lg:col-span-6"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
              <Award className="h-4 w-4" /> Bản sắc Aurora
            </div>
            <h2 className="text-heading-lg text-3xl font-bold text-navy-900 sm:text-4xl">
              Nơi sự sang trọng gặp gỡ thiên nhiên
            </h2>
            <p className="text-body text-slate-600">
              {BRAND.full} tọa lạc bên bãi biển {LOCATION.city}, {LOCATION.province} — thiên đường nghỉ dưỡng
              5 sao với suite view biển và dịch vụ coastal resort hiện đại.
            </p>
            <div className="flex flex-wrap gap-8 pt-2">
              {[
                ['100%', 'View biển'],
                ['24/7', 'Concierge VIP'],
                ['5 sao', 'Tiêu chuẩn QT'],
              ].map(([val, label]) => (
                <div key={label}>
                  <p className="text-heading text-3xl font-bold text-gold-600">{val}</p>
                  <p className="text-[11px] font-bold uppercase text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative lg:col-span-6"
          >
            <div className="aspect-[4/3] overflow-hidden rounded-3xl shadow-luxury">
              <SafeImage src={hotelImages.hotel} alt="Resort" aspectRatio="" containerClassName="h-full w-full" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-luxury-mist/80 py-20">
        <div className="page-container">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
                <Sparkles className="h-4 w-4" /> Lựa chọn thượng lưu
              </div>
              <h2 className="text-heading-lg mt-2 text-3xl font-bold text-navy-900">Phòng yêu thích</h2>
            </div>
            <Link to="/rooms" className="inline-flex items-center gap-1.5 text-sm font-bold text-navy-900 hover:text-gold-600">
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {loadingRooms ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((k) => (
                <div key={k} className="aspect-[4/5] shimmer rounded-3xl bg-slate-200" />
              ))}
            </div>
          ) : featured.length ? (
            <div className="grid gap-6 md:grid-cols-3">
              {featured.map((room, i) => {
                const img = buildRoomGallery(room, room.images || [], API_HOST)[0];
                const { price, listPrice, discountPct } = getDisplayPricing(room);
                const rating = Number(room.avg_rating || 0).toFixed(1);
                return (
                  <motion.article
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="group overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-luxury"
                  >
                    <Link to={`/room/${room.id}`} className="block">
                      <div className="relative overflow-hidden">
                        <SafeImage src={img} alt={displayRoomName(room.room_number)} aspectRatio="aspect-[16/11]" hoverZoom />
                        {discountPct > 0 && (
                          <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-bold text-white">
                            −{discountPct}%
                          </span>
                        )}
                        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-navy-900/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
                          <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
                          {rating}
                        </div>
                      </div>
                      <div className="space-y-2 p-5">
                        <h3 className="text-title truncate text-lg font-bold text-navy-900">
                          {displayRoomName(room.room_number)}
                        </h3>
                        <p className="truncate text-xs font-bold uppercase tracking-widest text-slate-400">
                          {room.room_type_name}
                        </p>
                        <div className="flex flex-wrap items-baseline gap-2 border-t border-slate-100 pt-3">
                          <span className="text-xl font-bold text-navy-900">
                            {price.toLocaleString('vi-VN')} ₫
                          </span>
                          <span className="text-xs text-slate-400">/ đêm</span>
                          {listPrice > price && (
                            <span className="text-xs text-slate-400 line-through">
                              {listPrice.toLocaleString('vi-VN')} ₫
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
              Đang cập nhật danh sách phòng.
            </p>
          )}
        </div>
      </section>

      <section className="page-container py-24">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
            <ShieldCheck className="h-4 w-4" /> Tiện nghi đỉnh cao
          </div>
          <h2 className="text-heading-lg mt-2 text-3xl font-bold text-navy-900">Trải nghiệm resort</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, idx) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
            >
              <Card className="overflow-hidden rounded-3xl p-0 shadow-card transition hover:shadow-luxury">
                <div className="relative h-44 overflow-hidden">
                  <SafeImage src={service.image} alt={service.name} aspectRatio="" containerClassName="h-full w-full" hoverZoom />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900/50 to-transparent" />
                </div>
                <div className="space-y-2 p-5">
                  <h3 className="text-title font-bold text-navy-900">{service.name}</h3>
                  <p className="text-body-sm text-slate-500">{service.desc}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-navy-900 py-24 text-white">
        <div className="page-container">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400">Khoảnh khắc Aurora</span>
            <h2 className="text-heading-lg mt-3 text-3xl font-bold">Góc nhìn nghệ thuật</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {roomGallery.map((image, idx) => {
              const titles = [
                { title: 'Biệt thự biển', subtitle: 'Oceanfront' },
                { title: 'Suite phòng khách', subtitle: 'Royal Living' },
                { title: 'Spa & thư giãn', subtitle: 'Zen Bath' },
                { title: 'Ban công vô cực', subtitle: 'Terrace' },
              ];
              const info = titles[idx] || { title: 'Không gian sống', subtitle: 'Suite' };
              return (
                <ImageCard
                  key={image}
                  src={image}
                  alt={info.title}
                  title={info.title}
                  subtitle={info.subtitle}
                  aspectRatio="aspect-[4/3]"
                />
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
