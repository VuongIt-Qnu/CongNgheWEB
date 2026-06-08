import { curatedImagesForRoomType } from '../constants/roomImagery';
import { roomGallery } from '../constants/images';

export function resolveRoomImageUrl(url, apiHost) {
  if (!url) return null;
  const cleanUrl = String(url).replace(/\\/g, '/');
  if (cleanUrl.startsWith('http')) return cleanUrl;
  const base = (apiHost || '').replace(/\/$/, '');
  const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
  return `${base}${path}`;
}

export function buildRoomGallery(room, imagesFromApi, apiHost) {
  const cover = resolveRoomImageUrl(room?.cover_image_url, apiHost);
  const fromDb = (imagesFromApi || [])
    .map((img) => resolveRoomImageUrl(img.image_url, apiHost))
    .filter(Boolean);
  const curated = curatedImagesForRoomType(room?.room_type_name);
  const seen = new Set();
  const merged = [];
  const head = cover ? [cover] : [];
  for (const u of [...head, ...fromDb, ...curated, ...roomGallery]) {
    if (u && !seen.has(u)) {
      seen.add(u);
      merged.push(u);
    }
  }
  return merged;
}

/** Deterministic “promo” pricing for UI (luxury OTA style) */
export function getDisplayPricing(room) {
  const price = Number(room?.price || 0);
  const id = Number(room?.id || 1);
  const bump = 0.1 + (id % 9) * 0.015;
  const listPrice = Math.round(price * (1 + bump));
  const discountPct = listPrice > price ? Math.min(35, Math.round(((listPrice - price) / listPrice) * 100)) : 0;
  return { price, listPrice: listPrice > price ? listPrice : Math.round(price * 1.12), discountPct };
}

export function getRoomStatusPresentation(status, roomsAvailableSameType) {
  const s = String(status || '').toLowerCase();
  const avail = Number(roomsAvailableSameType);

  const base = {
    available: {
      label: 'Còn Trống',
      className: 'bg-emerald-600/95 text-white ring-white/40',
    },
    occupied: {
      label: 'Đang Sử Dụng',
      className: 'bg-blue-600/95 text-white ring-white/40',
    },
    booked: {
      label: 'Đã Đặt',
      className: 'bg-amber-600/95 text-white ring-white/40',
    },
    maintenance: {
      label: 'Đang Bảo Trì',
      className: 'bg-rose-600/95 text-white ring-white/40',
    },
    pending: {
      label: 'Chờ Xác Nhận',
      className: 'bg-slate-700/95 text-white ring-white/35',
    },
  };

  if (base[s]) {
    const few = s === 'available' && avail > 0 && avail <= 3;
    return {
      ...base[s],
      fewLeftBadge: few,
      fewLeftLabel: 'Còn ít phòng cùng loại',
    };
  }

  return {
    label: status || '—',
    className: 'bg-slate-800/95 text-white ring-white/30',
    fewLeftBadge: false,
    fewLeftLabel: '',
  };
}

/** @type {Record<string, { id: string; label: string }[]>} */
export const AMENITY_BY_KEYWORD = {
  wifi: [
    { id: 'wifi', label: 'Wifi miễn phí' },
    { id: 'tv', label: 'Smart TV' },
    { id: 'air', label: 'Máy lạnh' },
  ],
  pool: [
    { id: 'wifi', label: 'Wifi miễn phí' },
    { id: 'pool', label: 'Hồ bơi' },
    { id: 'gym', label: 'Gym' },
    { id: 'air', label: 'Máy lạnh' },
  ],
  spa: [
    { id: 'wifi', label: 'Wifi miễn phí' },
    { id: 'spa', label: 'Spa & wellness' },
    { id: 'bath', label: 'Bồn tắm' },
    { id: 'minibar', label: 'Minibar' },
  ],
  breakfast: [{ id: 'breakfast', label: 'Ăn sáng miễn phí' }],
  ocean: [
    { id: 'view', label: 'View biển' },
    { id: 'balcony', label: 'Ban công' },
  ],
  suite: [
    { id: 'wifi', label: 'Wifi miễn phí' },
    { id: 'tv', label: 'Smart TV' },
    { id: 'minibar', label: 'Minibar' },
    { id: 'bath', label: 'Bồn tắm' },
    { id: 'room', label: 'Phòng khách' },
  ],
  family: [
    { id: 'wifi', label: 'Wifi miễn phí' },
    { id: 'tv', label: 'Smart TV' },
    { id: 'air', label: 'Máy lạnh' },
    { id: 'extra', label: 'Giường phụ' },
  ],
  default: [
    { id: 'wifi', label: 'Wifi miễn phí' },
    { id: 'tv', label: 'Smart TV' },
    { id: 'air', label: 'Máy lạnh' },
  ],
};

export function amenityPresetKeyFromTypeName(roomTypeName) {
  const n = (roomTypeName || '').toLowerCase();
  if (/(ocean|biển|beach|view|hướng biển)/.test(n)) return 'ocean';
  if (/(vip|president|penthouse|thượng hạng)/.test(n)) return 'spa';
  if (/(suite|sang trọng)/.test(n)) return 'suite';
  if (/(family|đình|connecting|gia đình|gia hòa)/.test(n)) return 'family';
  if (/(deluxe|premium|superior|cao cấp)/.test(n)) return 'pool';
  if (/(standard|classic|tiêu chuẩn)/.test(n)) return 'wifi';
  return 'default';
}

export function amenitiesForRoomType(roomTypeName) {
  const key = amenityPresetKeyFromTypeName(roomTypeName);
  const base = AMENITY_BY_KEYWORD[key] || AMENITY_BY_KEYWORD.default;
  const extra = AMENITY_BY_KEYWORD.breakfast;
  const merged = [...base];
  if (!/(standard|classic|tiêu chuẩn)/.test((roomTypeName || '').toLowerCase())) {
    merged.push(...extra);
  }
  const seen = new Set();
  return merged.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}

export const AMENITY_FILTER_OPTIONS = [
  { value: 'wifi', label: 'Wifi', match: () => true },
  { value: 'pool', label: 'Hồ bơi', match: (name) => /deluxe|suite|vip|ocean|premium|penthouse|cao cấp|sang trọng|thượng hạng|hướng biển/i.test(name || '') },
  { value: 'breakfast', label: 'Ăn sáng', match: (name) => !/standard|classic|tiêu chuẩn/i.test(name || '') },
  { value: 'ocean', label: 'View biển', match: (name) => /ocean|biển|beach|view|hướng biển/i.test(name || '') },
  { value: 'spa', label: 'Spa / Minibar', match: (name) => /vip|suite|deluxe|penthouse|thượng hạng|sang trọng|cao cấp/i.test(name || '') },
  { value: 'gym', label: 'Gym', match: (name) => /deluxe|suite|vip|premium|cao cấp|sang trọng|thượng hạng/i.test(name || '') },
];

const WISHLIST_KEY = 'lux_room_wishlist';

export function readWishlist() {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.map(Number).filter((n) => !Number.isNaN(n)) : [];
  } catch {
    return [];
  }
}

export function writeWishlist(ids) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify([...new Set(ids)]));
}

export function toggleWishlistRoom(roomId) {
  const id = Number(roomId);
  const cur = readWishlist();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  writeWishlist(next);
  return next.includes(id);
}

export function isRoomWishlisted(roomId) {
  return readWishlist().includes(Number(roomId));
}

export function seededReviews(roomId, roomTypeName) {
  const n = Number(roomId) || 1;
  const samples = [
    {
      name: 'Minh Anh',
      text: 'Phòng cực kỳ sạch và yên tĩnh. Nhân viên concierge hỗ trợ xuất sắc, giường êm và view đẹp hơn ảnh.',
      rating: 5,
      daysAgo: 2 + (n % 5),
      avatarSeed: `${n}a`,
    },
    {
      name: 'Sarah L.',
      text: `We loved the ${roomTypeName || 'room'} — minimalist luxury, powerful shower, and excellent housekeeping.`,
      rating: 5,
      daysAgo: 6 + (n % 11),
      avatarSeed: `${n}b`,
    },
    {
      name: 'Tuấn Đạt',
      text: 'Check-in nhanh, minibar replenish mỗi ngày. Hơi tiếc vì không kịp trải nghiệm spa.',
      rating: 4,
      daysAgo: 14 + (n % 9),
      avatarSeed: `${n}c`,
    },
    {
      name: 'Elena Rossi',
      text: 'Stunning interiors and subtle lighting. Bedsheets feel five-star.',
      rating: 5,
      daysAgo: 21 + (n % 6),
      avatarSeed: `${n}d`,
    },
  ];
  return samples.map((s, i) => ({
    ...s,
    id: `${roomId}-${i}`,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=11254d&color=c6a96a&size=128`,
    dateLabel: `${s.daysAgo} ngày trước`,
  }));
}
