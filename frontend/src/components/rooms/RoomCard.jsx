import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bath,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Heart,
  Sparkles,
  Star,
  Tv,
  UtensilsCrossed,
  Users,
  Wind,
  Wine,
  Wifi,
  ArrowRight,
} from 'lucide-react';
import { API_HOST } from '../../services/api';
import {
  amenitiesForRoomType,
  buildRoomGallery,
  getDisplayPricing,
  getRoomStatusPresentation,
  isRoomWishlisted,
  toggleWishlistRoom,
} from '../../utils/roomMeta';
import { displayRoomName } from '../../constants/labels';
import RoomImage from './RoomImage';

const amenityIcon = {
  wifi: Wifi,
  tv: Tv,
  air: Wind,
  pool: Bath,
  breakfast: UtensilsCrossed,
  view: Star,
  minibar: Wine,
  bath: Bath,
  gym: Dumbbell,
  spa: Sparkles,
  balcony: Star,
  room: BedDouble,
  extra: Users,
  default: Sparkles,
};

export default function RoomCard({ room, delay = 0, onWishlistChange }) {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [liked, setLiked] = useState(() => isRoomWishlisted(room.id));

  const images = useMemo(() => buildRoomGallery(room, room?.images || [], API_HOST), [room]);
  const imageCount = images?.length ? images.length : 1;

  const { price, listPrice, discountPct } = useMemo(() => getDisplayPricing(room), [room]);
  const amenities = useMemo(() => amenitiesForRoomType(room.room_type_name).slice(0, 5), [room.room_type_name]);
  const statusUi = useMemo(
    () => getRoomStatusPresentation(room.status, room.rooms_available_same_type),
    [room.status, room.rooms_available_same_type]
  );

  const rating = Number(room.avg_rating || 0).toFixed(1);
  const reviews = Number(room.review_count || 0);

  const shortDesc =
    room.description?.slice(0, 100) ||
    `${room.room_type_name} cao cấp — không gian tối giản, tone ấm và ánh sáng dịu nhẹ, lý tưởng cho kỳ nghỉ.`;

  const next = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setGalleryIndex((i) => (Number.isFinite(i) ? (i + 1) % imageCount : 0));
  };
  const prev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setGalleryIndex((i) => (Number.isFinite(i) ? (i - 1 + imageCount) % imageCount : 0));
  };

  const onHeart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextLiked = toggleWishlistRoom(room.id);
    setLiked(nextLiked);
    onWishlistChange?.(room.id, nextLiked);
    toast.success(nextLiked ? 'Đã thêm vào danh sách yêu thích.' : 'Đã gỡ khỏi yêu thích.', {
      duration: 2400,
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group/card relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgba(10,26,54,0.07)] ring-1 ring-black/[0.04] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_65px_rgba(198,169,106,0.18)] hover:ring-gold-500/20"
    >
      {/* ===== IMAGE GALLERY ===== */}
      <div className="relative overflow-hidden">
        <RoomImage
          key={galleryIndex}
          src={images[galleryIndex] || images[0]}
          alt={displayRoomName(room.room_number)}
          aspectRatio="aspect-[16/11]"
          hoverZoom={true}
        />

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-80 transition-opacity duration-500 group-hover/card:opacity-95" />

        {/* Discount badge - glassmorphism style */}
        {discountPct > 0 && (
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.2 }}
            className="absolute left-3.5 top-3.5 rounded-full border border-white/20 bg-white/85 px-3 py-1.5 text-xs font-bold tracking-wide text-rose-600 shadow-lg backdrop-blur-md"
          >
            −{discountPct}% hôm nay
          </motion.span>
        )}

        {/* Heart button */}
        <button
          type="button"
          onClick={onHeart}
          aria-label="Yêu thích"
          className={clsx(
            'absolute right-3.5 top-3.5 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-black/40',
            liked && '!bg-rose-500/80 !border-rose-400/30 text-white'
          )}
        >
          <Heart className={clsx('h-[18px] w-[18px] transition-transform duration-300', liked && 'fill-current scale-110')} />
        </button>

        {/* Navigation arrows - ONLY visible on hover */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
          <button
            type="button"
            onClick={prev}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/25 text-white backdrop-blur-md shadow-lg transition-all hover:bg-black/45 hover:scale-110"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/25 text-white backdrop-blur-md shadow-lg transition-all hover:bg-black/45 hover:scale-110"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom overlay: Status badges + dots indicator */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5">
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <span
                className={clsx(
                  'inline-flex items-center rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-lg',
                  statusUi.className
                )}
              >
                {statusUi.label}
              </span>
              {statusUi.fewLeftBadge && (
                <span className="rounded-full border border-amber-300/30 bg-amber-400/90 px-2.5 py-1 text-[10px] font-bold text-navy-900 shadow-lg backdrop-blur-sm">
                  {statusUi.fewLeftLabel}
                </span>
              )}
            </div>
          </div>

          {/* Slide indicator dots - refined */}
          <div className="mt-2.5 flex justify-center gap-1">
            {(images?.length ? images : [null]).slice(0, 6).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setGalleryIndex(i);
                }}
                className={clsx(
                  'rounded-full transition-all duration-300',
                  i === galleryIndex
                    ? 'h-[5px] w-5 bg-gold-500 shadow-[0_0_6px_rgba(198,169,106,0.5)]'
                    : 'h-[5px] w-[5px] bg-white/40 hover:bg-white/70'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ===== CARD BODY ===== */}
      <div className="flex flex-1 flex-col p-5 pt-4">
        {/* Header: Name + Rating */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold tracking-tight text-navy-900">
              {displayRoomName(room.room_number)}
            </h3>
            <p className="mt-0.5 text-[13px] font-medium text-slate-500">{room.room_type_name}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end">
            <div className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-br from-gold-500/15 to-gold-500/5 px-2.5 py-1 text-sm font-bold text-navy-900">
              <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
              {rating}
            </div>
            <p className="mt-0.5 text-[10px] font-medium text-slate-400">{reviews} đánh giá</p>
          </div>
        </div>

        {/* Price */}
        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <p className="text-[22px] font-bold tracking-tight text-navy-900">
            {price.toLocaleString('vi-VN')}
            <span className="ml-0.5 text-sm font-semibold text-slate-400">₫</span>
          </p>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">/ đêm</span>
          {listPrice > price && (
            <span className="text-sm font-medium text-slate-400 line-through decoration-slate-300/80">
              {listPrice.toLocaleString('vi-VN')} ₫
            </span>
          )}
        </div>

        {/* Short description */}
        <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-slate-500">{shortDesc.trim()}…</p>

        {/* Amenities - refined pills */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {amenities.map((a) => {
            const Icon = amenityIcon[a.id] || amenityIcon.default;
            return (
              <span
                key={`${room.id}-${a.id}`}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600 transition-colors duration-200 group-hover/card:border-gold-500/20 group-hover/card:bg-gold-500/5"
              >
                <Icon className="h-3 w-3 text-gold-600" />
                {a.label}
              </span>
            );
          })}
        </div>

        {/* Room stats - compact */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100/80 px-2 py-1">
            <Users className="h-3 w-3 text-navy-700" />
            {room.capacity} khách
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50/80 px-2 py-1 text-emerald-700">
            <BedDouble className="h-3 w-3" />
            {Number(room.rooms_available_same_type ?? 0)} phòng trống
          </span>
          {Number(room.bookings_today ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-50/70 px-2 py-1 text-rose-600">
              <Sparkles className="h-3 w-3" />
              {room.bookings_today} đặt hôm nay
            </span>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="mt-auto flex gap-2.5 pt-5">
          <Link
            to={`/room/${room.id}`}
            className="flex-1 rounded-xl border border-navy-900/10 py-2.5 text-center text-[13px] font-bold text-navy-900 transition-all duration-300 hover:border-gold-500/40 hover:bg-slate-50 hover:shadow-sm"
          >
            Xem chi tiết
          </Link>
          <Link
            to={`/booking?roomId=${room.id}`}
            className="group/btn relative flex flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-gold-500 via-[#d4b47a] to-gold-500 bg-[length:200%_100%] py-2.5 text-[13px] font-bold text-navy-900 shadow-lg transition-all duration-500 hover:bg-right hover:shadow-xl hover:shadow-gold-500/25"
          >
            Đặt phòng
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
