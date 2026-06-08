import clsx from 'clsx';
import {
  Bath,
  BedDouble,
  Dumbbell,
  Sparkles,
  Star,
  Tv,
  UtensilsCrossed,
  Users,
  Wind,
  Wine,
  Wifi,
} from 'lucide-react';
import SafeImage from '../SafeImage';
import { displayRoomName } from '../../constants/labels';
import { getDisplayPricing } from '../../utils/roomMeta';

const amenityIcon = {
  wifi: Wifi,
  tv: Tv,
  air: Wind,
  breakfast: UtensilsCrossed,
  minibar: Wine,
  bath: Bath,
  gym: Dumbbell,
  spa: Sparkles,
  room: BedDouble,
  extra: Users,
  default: Sparkles,
};

export default function BookingSummaryCard({ room, imageSrc, amenities = [], className }) {
  if (!room) return null;

  const { price } = getDisplayPricing(room);
  const rating = Number(room.avg_rating || 0).toFixed(1);

  return (
    <div
      className={clsx(
        'overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 shadow-[0_12px_40px_rgba(10,26,54,0.06)]',
        className
      )}
    >
      <div className="grid gap-0 sm:grid-cols-[minmax(0,220px)_1fr]">
        <div className="relative aspect-[16/10] min-h-[160px] sm:aspect-auto sm:min-h-[200px] sm:h-full">
          <SafeImage
            src={imageSrc}
            alt={displayRoomName(room.room_number)}
            aspectRatio=""
            containerClassName="absolute inset-0 h-full w-full"
            className="h-full w-full"
            hoverZoom={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900/50 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-transparent sm:to-navy-900/10" />
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-navy-900/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
            <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
            {rating}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3 p-5 sm:p-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600">
              {room.room_type_name}
            </p>
            <h2 className="mt-1 text-title text-xl font-bold text-navy-900 break-words">
              {displayRoomName(room.room_number)}
            </h2>
          </div>

          {room.description && (
            <p className="text-body-sm line-clamp-3 text-slate-600">{room.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1">
              <Users className="h-3.5 w-3.5 text-navy-800" />
              Tối đa {room.capacity} khách
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-gold-500/10 px-2.5 py-1 text-navy-900">
              {price.toLocaleString('vi-VN')} ₫ / đêm
            </span>
          </div>

          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
              {amenities.map((a) => {
                const Icon = amenityIcon[a.id] || amenityIcon.default;
                return (
                  <span
                    key={a.id}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-gold-600" />
                    <span className="truncate">{a.label}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
