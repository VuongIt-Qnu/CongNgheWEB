import { useMemo, useState, useEffect } from 'react';
import clsx from 'clsx';
import VnDateInput from '../common/VnDateInput';
import {
  Bath,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  UtensilsCrossed,
  Waves,
  Wifi,
  X,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AMENITY_FILTER_OPTIONS } from '../../utils/roomMeta';

const iconMap = {
  wifi: Wifi,
  pool: Waves,
  breakfast: UtensilsCrossed,
  ocean: MapPin,
  spa: Bath,
  gym: Sparkles,
};

export function typeIdsMatchingAmenities(selectedAmenities, roomTypes) {
  if (!selectedAmenities?.length) return { typesParam: null, impossible: false };
  let intersection = null;
  for (const a of selectedAmenities) {
    const opt = AMENITY_FILTER_OPTIONS.find((o) => o.value === a);
    if (!opt) continue;
    const ids = new Set(roomTypes.filter((t) => opt.match(t.name)).map((t) => t.id));
    intersection = intersection === null ? ids : new Set([...intersection].filter((id) => ids.has(id)));
  }
  if (!intersection || intersection.size === 0) return { typesParam: null, impossible: true };
  return { typesParam: [...intersection].join(','), impossible: false };
}

/* ──── Filter Content (shared between desktop inline & mobile drawer) ──── */
function FilterContent({ values, onChange, roomTypes, toggleAmenity, preview }) {
  return (
    <div className="grid gap-5 md:grid-cols-12">
      <div className="md:col-span-3">
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Loại phòng
        </label>
        <div className="relative">
          <select
            value={values.roomTypeId}
            onChange={(e) => onChange({ ...values, roomTypeId: e.target.value })}
            className="w-full appearance-none rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 pr-9 text-sm font-medium text-navy-900 outline-none ring-gold-500/30 transition focus:border-gold-500/40 focus:ring-2"
          >
            <option value="">Tất cả loại phòng</option>
            {roomTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>
      <div className="md:col-span-4">
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Giá mỗi đêm (₫)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            placeholder="Từ"
            value={values.minPrice}
            onChange={(e) => onChange({ ...values, minPrice: e.target.value })}
            className="w-full rounded-xl border border-slate-200/80 px-3 py-2.5 text-sm font-medium outline-none ring-gold-500/30 transition focus:border-gold-500/40 focus:ring-2"
          />
          <span className="flex items-center text-slate-300">—</span>
          <input
            type="number"
            min={0}
            placeholder="Đến"
            value={values.maxPrice}
            onChange={(e) => onChange({ ...values, maxPrice: e.target.value })}
            className="w-full rounded-xl border border-slate-200/80 px-3 py-2.5 text-sm font-medium outline-none ring-gold-500/30 transition focus:border-gold-500/40 focus:ring-2"
          />
        </div>
      </div>
      <div className="md:col-span-3">
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Điểm tối thiểu
        </label>
        <div className="relative">
          <select
            value={values.minRating}
            onChange={(e) => onChange({ ...values, minRating: e.target.value })}
            className="w-full appearance-none rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 pr-9 text-sm font-medium text-navy-900 outline-none ring-gold-500/30 transition focus:border-gold-500/40 focus:ring-2"
          >
            <option value="">—</option>
            {['4.0', '4.3', '4.5', '4.7', '4.9'].map((r) => (
              <option key={r} value={r}>
                {r}+ sao
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>
      <div className="md:col-span-12">
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Tiện nghi mong muốn
        </p>
        <div className="flex flex-wrap gap-2">
          {AMENITY_FILTER_OPTIONS.map((opt) => {
            const Icon = iconMap[opt.value] || Sparkles;
            const on = values.amenities?.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleAmenity(opt.value)}
                className={clsx(
                  'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-200',
                  on
                    ? 'border-gold-500 bg-gradient-to-r from-gold-500/15 to-gold-500/5 text-navy-900 shadow-sm shadow-gold-500/10 ring-2 ring-gold-500/25'
                    : 'border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                <Icon className={clsx('h-3.5 w-3.5', on ? 'text-gold-600' : 'text-slate-400')} />
                {opt.label}
              </button>
            );
          })}
        </div>
        {preview.impossible && (
          <p className="mt-2.5 text-xs font-medium text-rose-600">
            Không có loại phòng nào thỏa bộ lọc tiện nghi bạn đã chọn.
          </p>
        )}
      </div>
    </div>
  );
}

export default function RoomSearchFilter({
  roomTypes = [],
  values,
  onChange,
  onSearch,
  loading,
  className,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState(false);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileDrawer]);

  const toggleAmenity = (value) => {
    const set = new Set(values.amenities || []);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    onChange({ ...values, amenities: [...set] });
  };

  const preview = useMemo(() => {
    const { impossible } = typeIdsMatchingAmenities(values.amenities, roomTypes);
    return { impossible };
  }, [values.amenities, roomTypes]);

  const activeFilterCount = [
    values.roomTypeId,
    values.minPrice,
    values.maxPrice,
    values.minRating,
    ...(values.amenities || []),
  ].filter(Boolean).length;

  return (
    <div className={clsx('space-y-4', className)}>
      <div className="rounded-2xl border border-white/10 bg-white/95 p-4 shadow-[0_20px_60px_rgba(10,26,54,0.12)] backdrop-blur-md sm:p-5">
        {/* Main search row */}
        <div className="grid gap-3 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-3">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Nhận phòng
            </label>
            <VnDateInput
              value={values.checkIn}
              onChange={(checkIn) => onChange({ ...values, checkIn })}
              className="w-full rounded-xl border border-slate-200/80 bg-white py-2.5 pl-9 pr-3 text-sm font-medium text-navy-900 outline-none ring-gold-500/30 transition focus:border-gold-500/40 focus:ring-2"
            />
          </div>
          <div className="lg:col-span-3">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Trả phòng
            </label>
            <VnDateInput
              value={values.checkOut}
              onChange={(checkOut) => onChange({ ...values, checkOut })}
              min={values.checkIn || undefined}
              className="w-full rounded-xl border border-slate-200/80 bg-white py-2.5 pl-9 pr-3 text-sm font-medium text-navy-900 outline-none ring-gold-500/30 transition focus:border-gold-500/40 focus:ring-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:col-span-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Khách
              </label>
              <div className="relative">
                <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={values.guests}
                  onChange={(e) => onChange({ ...values, guests: e.target.value })}
                  className="w-full appearance-none rounded-xl border border-slate-200/80 bg-white py-2.5 pl-9 pr-3 text-sm font-medium text-navy-900 outline-none ring-gold-500/30 transition focus:border-gold-500/40 focus:ring-2"
                >
                  {[1, 2, 3, 4, 5, 6, 8].map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Số phòng
              </label>
              <select
                value={values.roomSlotCount}
                onChange={(e) => onChange({ ...values, roomSlotCount: e.target.value })}
                className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 text-sm font-medium text-navy-900 outline-none ring-gold-500/30 transition focus:border-gold-500/40 focus:ring-2"
              >
                {[1, 2, 3, 4, 5].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="lg:col-span-4">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Tên phòng / từ khóa
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={values.search}
                onChange={(e) => onChange({ ...values, search: e.target.value })}
                placeholder="VD: Suite, tầng 12, ocean..."
                className="w-full rounded-xl border border-slate-200/80 bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-navy-900 placeholder:text-slate-400 outline-none ring-gold-500/30 transition focus:border-gold-500/40 focus:ring-2"
              />
            </div>
          </div>
        </div>

        {/* Action row */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          {/* Desktop: inline toggle */}
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-navy-900/10 bg-slate-50 px-4 py-2 text-sm font-semibold text-navy-900 transition-all hover:border-gold-500/40 hover:bg-white hover:shadow-sm"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Bộ lọc nâng cao
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-navy-900">
                {activeFilterCount}
              </span>
            )}
            <Filter className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {/* Mobile: open drawer */}
          <button
            type="button"
            onClick={() => setMobileDrawer(true)}
            className="md:hidden inline-flex items-center gap-2 rounded-full border border-navy-900/10 bg-slate-50 px-4 py-2 text-sm font-semibold text-navy-900 transition-all hover:border-gold-500/40 hover:bg-white"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Bộ lọc
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-navy-900">
                {activeFilterCount}
              </span>
            )}
          </button>

          <motion.button
            type="button"
            disabled={loading || preview.impossible}
            onClick={() => onSearch()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
            className={clsx(
              'ml-auto inline-flex min-w-[180px] items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-navy-900 shadow-lg transition-all duration-300',
              'bg-gradient-to-r from-gold-500 to-[#dfb86a]',
              'hover:shadow-xl hover:shadow-gold-500/25 disabled:opacity-50'
            )}
          >
            Tìm phòng phù hợp
          </motion.button>
        </div>

        {/* Desktop: inline filter panel */}
        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="hidden md:block overflow-hidden"
            >
              <div className="border-t border-slate-100 pt-5 mt-4">
                <FilterContent
                  values={values}
                  onChange={onChange}
                  roomTypes={roomTypes}
                  toggleAmenity={toggleAmenity}
                  preview={preview}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== MOBILE DRAWER ===== */}
      <AnimatePresence>
        {mobileDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileDrawer(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
            />
            {/* Drawer panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 z-50 w-[85vw] max-w-md overflow-y-auto bg-white shadow-2xl md:hidden"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur-md">
                <h3 className="text-lg font-bold text-navy-900">Bộ lọc nâng cao</h3>
                <button
                  type="button"
                  onClick={() => setMobileDrawer(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5">
                <FilterContent
                  values={values}
                  onChange={onChange}
                  roomTypes={roomTypes}
                  toggleAmenity={toggleAmenity}
                  preview={preview}
                />
              </div>
              <div className="sticky bottom-0 border-t border-slate-100 bg-white/95 p-4 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawer(false);
                    onSearch();
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-gold-500 to-[#dfb86a] py-3 text-sm font-bold text-navy-900 shadow-lg transition hover:shadow-xl hover:shadow-gold-500/25"
                >
                  Áp dụng bộ lọc
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
