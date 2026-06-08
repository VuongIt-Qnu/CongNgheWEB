import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BadgeCheck,
  Bath,
  BedDouble,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crown,
  Dumbbell,
  MapPin,
  Share2,
  Shield,
  Sparkles,
  Star,
  Tv,
  UtensilsCrossed,
  Users,
  Wind,
  Wine,
  Waves,
  Wifi,
  Camera,
  X,
} from 'lucide-react';
import RoomCard from './RoomCard';
import RoomImage from './RoomImage';
import RoomReviews from './RoomReviews';
import { hotelImages } from '../../constants/images';
import { BRAND, LOCATION, GOOGLE_MAPS_EMBED_URL } from '../../constants/branding';
import {
  amenitiesForRoomType,
  buildRoomGallery,
  getDisplayPricing,
} from '../../utils/roomMeta';
import { displayRoomName } from '../../constants/labels';
import { API_HOST } from '../../services/api';

const amiIcon = {
  wifi: Wifi,
  tv: Tv,
  air: Wind,
  pool: Waves,
  breakfast: UtensilsCrossed,
  view: Star,
  minibar: Wine,
  bath: Bath,
  gym: Dumbbell,
  spa: Sparkles,
  balcony: MapPin,
  room: BedDouble,
  extra: Users,
};

function DetailGallery({ images, title }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [active, setActive] = useState(0);

  // Guarantee we always have 5 images to show in the asymmetric grid by using beautiful fallbacks
  const displayImages = useMemo(() => {
    const arr = [...images];
    const fallbacks = [
      hotelImages.bedroom,
      hotelImages.pool,
      hotelImages.resort,
      hotelImages.hotel,
      hotelImages.spa,
    ];
    let fallbackIdx = 0;
    while (arr.length < 5 && fallbackIdx < fallbacks.length) {
      if (!arr.includes(fallbacks[fallbackIdx])) {
        arr.push(fallbacks[fallbackIdx]);
      }
      fallbackIdx++;
    }
    return arr.slice(0, 5);
  }, [images]);

  const openLightbox = (idx) => {
    setActive(idx);
    setLightboxOpen(true);
  };

  const next = () => setActive((i) => (i + 1) % displayImages.length);
  const prev = () => setActive((i) => (i - 1 + displayImages.length) % displayImages.length);

  return (
    <div className="space-y-4">
      {/* 5-Photo Asymmetric Mosaic Grid for Desktop / Tablet */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 relative rounded-3xl overflow-hidden shadow-soft ring-1 ring-black/5 bg-slate-100 aspect-[21/11] max-h-[480px]">
        {/* Large main photo (Left - spans 2 columns and 2 rows) */}
        <div
          className="col-span-2 row-span-2 relative overflow-hidden cursor-pointer group"
          onClick={() => openLightbox(0)}
        >
          <RoomImage
            src={displayImages[0]}
            alt={title}
            aspectRatio=""
            containerClassName="w-full h-full"
            hoverZoom={true}
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition duration-300 pointer-events-none" />
        </div>

        {/* Small photos (Right - 2x2 grid) */}
        {displayImages.slice(1, 5).map((src, idx) => (
          <div
            key={`${src}-${idx}`}
            className="relative overflow-hidden cursor-pointer group"
            onClick={() => openLightbox(idx + 1)}
          >
            <RoomImage
              src={src}
              alt=""
              aspectRatio=""
              containerClassName="w-full h-full"
              hoverZoom={true}
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition duration-300 pointer-events-none" />
          </div>
        ))}

        {/* View All Photos Button */}
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2.5 text-xs font-bold text-slate-800 shadow-md backdrop-blur-sm hover:bg-white hover:scale-105 transition duration-300"
        >
          <Camera className="h-4 w-4 text-gold-600" />
          Xem tất cả hình ảnh
        </button>
      </div>

      {/* Simple slider fallback for Mobile view */}
      <div className="block md:hidden relative overflow-hidden rounded-2xl bg-slate-100 shadow-soft">
        <RoomImage
          src={displayImages[active] || displayImages[0]}
          alt={title}
          aspectRatio="aspect-[16/10]"
        />
        <div className="absolute bottom-3 right-3 z-20 rounded-full bg-black/45 px-3 py-1 text-xs font-bold text-white">
          {active + 1} / {displayImages.length}
        </div>
        <button
          type="button"
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 grid h-8 w-8 place-items-center rounded-full bg-white/80 shadow text-slate-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 grid h-8 w-8 place-items-center rounded-full bg-white/80 shadow text-slate-800"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* DYNAMIC LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 p-4 sm:p-6 backdrop-blur-md">
            {/* Lightbox Header */}
            <div className="flex items-center justify-between text-white border-b border-white/10 pb-4">
              <div>
                <h3 className="text-title text-lg font-bold">{title}</h3>
                <p className="text-xs text-slate-400">Hình ảnh thực tế tại {BRAND.full}</p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Lightbox Main Image Area */}
            <div className="relative flex flex-1 items-center justify-center py-8">
              <button
                type="button"
                onClick={prev}
                className="absolute left-2 sm:left-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="max-h-[70vh] w-full max-w-4xl"
              >
                <RoomImage
                  src={displayImages[active]}
                  alt=""
                  aspectRatio=""
                  containerClassName="rounded-2xl max-h-[70vh]"
                  objectFit="contain"
                />
              </motion.div>

              <button
                type="button"
                onClick={next}
                className="absolute right-2 sm:right-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Lightbox Thumbnail Slider */}
            <div className="flex justify-center gap-2 overflow-x-auto py-4 border-t border-white/10">
              {displayImages.map((src, idx) => (
                <button
                  key={`${src}-thumb-${idx}`}
                  type="button"
                  onClick={() => setActive(idx)}
                  className={clsx(
                    'relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition',
                    idx === active ? 'border-gold-500 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                >
                  <RoomImage
                    src={src}
                    alt=""
                    aspectRatio=""
                    containerClassName="w-full h-full"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Policies() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-heading text-xl font-bold text-navy-900">Chính sách lưu trú</h2>
      <ul className="mt-4 space-y-3 text-sm text-slate-600">
        {[
          'Nhận phòng từ 14:00 — trả phòng trước 11:30. Hỗ trợ nhận muộn tùy tình trạng phòng.',
          'Hủy miễn phí trong vòng 24h trước ngày nhận phòng.',
          'Bảo lãnh cọc hoặc thanh toán bằng thẻ tín dụng / chuyển khoản an toàn.',
          'Không gian hoàn toàn không hút thuốc trong phòng; có khu vực ban công riêng bên ngoài.',
        ].map((t) => (
          <li key={t} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HotelMapEmbed() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gold-600" />
          <div>
            <p className="text-title text-navy-900 font-bold">Vị trí resort</p>
            <p className="text-xs text-slate-500">{LOCATION.mapLabel}</p>
          </div>
        </div>
      </div>
      <iframe
        title={`Bản đồ ${BRAND.full}`}
        className="aspect-[21/9] min-h-[220px] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        src={GOOGLE_MAPS_EMBED_URL}
      />
    </div>
  );
}

function BookingSidebar({ room }) {
  const { price, listPrice, discountPct } = useMemo(() => getDisplayPricing(room), [room]);
  const nights = 3;

  return (
    <div className="rounded-3xl border border-gold-500/20 bg-white/95 p-6 shadow-[0_25px_50px_rgba(10,26,54,0.08)] backdrop-blur-md lg:sticky lg:top-24 space-y-6">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-600">
          <Shield className="h-3 w-3" /> Đặt trực tiếp VIP
        </span>
        <h3 className="mt-3 text-heading text-lg font-bold text-navy-900">Thông tin đặt phòng</h3>
        <p className="text-xs text-slate-500 mt-1">Đã bao gồm phí resort, đưa đón sân bay và buffet.</p>
      </div>

      <div className="border-y border-dashed border-slate-200 py-5">
        <div className="flex flex-wrap items-end gap-2">
          <span className="text-3xl font-bold text-navy-900 tracking-tight">{price.toLocaleString('vi-VN')} ₫</span>
          <span className="text-xs font-semibold uppercase text-slate-400">/ đêm</span>
        </div>
        {listPrice > price && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-slate-400 line-through">{listPrice.toLocaleString('vi-VN')} ₫</span>
            {discountPct > 0 && (
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                Tiết kiệm {discountPct}%
              </span>
            )}
          </div>
        )}
        <div className="mt-4 bg-slate-50 rounded-xl p-3 text-xs text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span>Tạm tính ({nights} đêm):</span>
            <span className="font-bold text-navy-900">{(price * nights).toLocaleString('vi-VN')} ₫</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Phí đưa đón & buffet:</span>
            <span className="font-medium text-emerald-600">Miễn phí</span>
          </div>
        </div>
      </div>

      <ul className="space-y-3 text-xs font-semibold text-slate-600">
        {[
          { icon: Shield, label: 'Đảm bảo giá tốt nhất khi đặt trực tiếp' },
          { icon: BadgeCheck, label: 'Miễn phí hủy phòng trước 24h' },
          { icon: Crown, label: 'Ưu tiên nâng hạng phòng VIP (nếu trống)' },
        ].map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2.5">
            <Icon className="h-4 w-4 shrink-0 text-gold-600" />
            <span>{label}</span>
          </li>
        ))}
      </ul>

      <div className="pt-2">
        <Link
          to={`/booking?roomId=${room.id}`}
          className="block w-full rounded-2xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 bg-[length:200%_100%] py-4 text-center text-sm font-bold text-navy-900 shadow-lg shadow-gold-500/20 hover:shadow-xl hover:shadow-gold-500/35 hover:bg-right hover:scale-[1.01] transition-all duration-500"
        >
          Đặt phòng ngay
        </Link>
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200/80 py-3 text-xs font-bold text-navy-900 transition hover:border-gold-500/40 hover:bg-slate-50"
        onClick={() => {
          const url = window.location.href;
          const p = navigator.clipboard?.writeText?.(url);
          if (p) {
            p
              .then(() => toast.success('Đã sao chép liên kết phòng.'))
              .catch(() => toast.error('Không thể sao chép — hãy copy thủ công.'));
          } else {
            toast.error('Trình duyệt không hỗ trợ sao chép nhanh.');
          }
        }}
      >
        <Share2 className="h-4 w-4 text-gold-600" />
        Chia sẻ phòng này
      </button>
    </div>
  );
}

export default function RoomDetail({ room, relatedRooms, onReviewsUpdated }) {
  const images = useMemo(() => buildRoomGallery(room, room?.images || [], API_HOST), [room]);
  const amenities = amenitiesForRoomType(room.room_type_name);

  // Grouping amenities dynamically into elegant categories
  const categorizedAmenities = useMemo(() => {
    const categories = [
      {
        title: '🛏️ Không gian sống & Ban công',
        ids: ['room', 'balcony', 'view', 'extra'],
        items: [],
      },
      {
        title: '🚿 Phòng tắm & Chăm sóc sức khỏe',
        ids: ['bath', 'pool', 'spa'],
        items: [],
      },
      {
        title: '🍷 Ẩm thực & Dịch vụ kèm',
        ids: ['minibar', 'breakfast'],
        items: [],
      },
      {
        title: '🔌 Công nghệ & Giải trí',
        ids: ['wifi', 'tv', 'air', 'gym'],
        items: [],
      },
    ];

    amenities.forEach((a) => {
      let matched = false;
      categories.forEach((cat) => {
        if (cat.ids.includes(a.id)) {
          cat.items.push(a);
          matched = true;
        }
      });
      if (!matched) {
        // Fallback matched
        categories[0].items.push(a);
      }
    });

    return categories.filter((cat) => cat.items.length > 0);
  }, [amenities]);

  return (
    <div className="space-y-10 pb-20 pt-24">
      <div className="mx-auto grid max-w-7xl min-w-0 gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="min-w-0 space-y-8 lg:col-span-8 lg:space-y-10">
          <DetailGallery images={images} title={displayRoomName(room.room_number)} />

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="break-words-safe text-heading-xl text-3xl font-bold tracking-tight text-navy-900 md:text-4xl">
              {displayRoomName(room.room_number)}
            </h1>
            <span className="rounded-full bg-slate-100 px-4 py-1 text-sm font-semibold text-slate-700">
              {room.room_type_name}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
              <Wifi className="h-4 w-4 shrink-0" /> Wifi gigabit
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-900">
              <Waves className="h-4 w-4 shrink-0" /> Pool & Beach club
            </span>
          </div>

          <p className="text-base leading-relaxed text-slate-600">
            {room.description ||
              `Căn hộ ${room.room_type_name} sở hữu lối thiết kế tối giản sang trọng theo triết lý "Quiet Luxury". Nội thất là sự kết hợp tinh tế giữa vật liệu gỗ sồi tự nhiên, đá cẩm thạch trắng mờ và drapery mềm nhẹ đón trọn ánh sáng dịu lành của buổi sớm bình minh.`}
          </p>

          {/* Categorized Premium Amenities Grid */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <h2 className="text-heading text-xl font-bold text-navy-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold-500 animate-pulse shrink-0" /> Tiện nghi cao cấp của phòng
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {categorizedAmenities.map((cat) => (
                <div key={cat.title} className="space-y-3">
                  <h3 className="text-badge text-xs font-bold uppercase tracking-wide text-gold-600">
                    {cat.title}
                  </h3>
                  <div className="space-y-2">
                    {cat.items.map((a) => {
                      const Icon = amiIcon[a.id] || Sparkles;
                      return (
                        <div
                          key={a.id}
                          className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-2.5 text-xs font-semibold text-slate-800"
                        >
                          <Icon className="h-4 w-4 text-gold-600 shrink-0" />
                          {a.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <RoomReviews room={room} onReviewsUpdated={onReviewsUpdated} />
          <Policies />
          <HotelMapEmbed />
        </div>

        <div className="lg:col-span-4">
          <BookingSidebar room={room} />
        </div>
      </div>

      {relatedRooms?.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 pt-14">
          <h2 className="text-heading text-2xl font-bold text-navy-900">Phòng nghỉ tương tự bạn có thể thích</h2>
          <p className="mt-1 text-sm text-slate-600">Cùng phân khúc, diện tích và dịch vụ đưa đón tương đương.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedRooms.map((r, i) => (
              <RoomCard key={r.id} room={r} delay={i * 0.06} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function RoomDetailHeroFallback() {
  return (
    <div className="relative h-[38vh] min-h-[280px] w-full overflow-hidden">
      <RoomImage src={hotelImages.resort} alt="" aspectRatio="" containerClassName="w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/40 to-transparent pointer-events-none" />
    </div>
  );
}
