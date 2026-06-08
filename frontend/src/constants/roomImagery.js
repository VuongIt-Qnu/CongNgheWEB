/** Curated Unsplash sets — luxury hotel aesthetic, consistent warm neutrals & navy accents */

const q = 'auto=format&fit=crop&w=1600&q=85';

export const CURATED_GALLERY = {
  standard: [
    `https://images.unsplash.com/photo-1631049307264-da0c9adc7d23?${q}`,
    `https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?${q}`,
    `https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?${q}`,
    `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?${q}`,
  ],
  deluxe: [
    `https://images.unsplash.com/photo-1590490360182-c33d57733427?${q}`,
    `https://images.unsplash.com/photo-1566665797739-1674de7a421a?${q}`,
    `https://images.unsplash.com/photo-1616594039964-3ca3fa5674c3?${q}`,
    `https://images.unsplash.com/photo-1584132967334-10e2bd60ff84?${q}`,
  ],
  suite: [
    `https://images.unsplash.com/photo-1578683010236-d716f9a3f461?${q}`,
    `https://images.unsplash.com/photo-1618773928121-c32242e63f39?${q}`,
    `https://images.unsplash.com/photo-1591088398332-8a7791972843?${q}`,
    `https://images.unsplash.com/photo-1631049307264-da0c9adc7d23?${q}`,
  ],
  family: [
    `https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?${q}`,
    `https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?${q}`,
    `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?${q}`,
    `https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?${q}`,
  ],
  vip: [
    `https://images.unsplash.com/photo-1596394516093-501e68dae0d6?${q}`,
    `https://images.unsplash.com/photo-1578683010236-d716f9a3f461?${q}`,
    `https://images.unsplash.com/photo-1540518610756-8c67786b7973?${q}`,
    `https://images.unsplash.com/photo-1566073771259-6a8506099945?${q}`,
  ],
  ocean: [
    `https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?${q}`,
    `https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?${q}`,
    `https://images.unsplash.com/photo-1542314831-a068fcd6c053?${q}`,
    `https://images.unsplash.com/photo-1578683010236-d716f9a3f461?${q}`,
  ],
  default: [
    `https://images.unsplash.com/photo-1618773928121-c32242e63f39?${q}`,
    `https://images.unsplash.com/photo-1598928506311-c55ded91a20c?${q}`,
    `https://images.unsplash.com/photo-1571508601891-ca5e7a713859?${q}`,
    `https://images.unsplash.com/photo-1631049552057-403cdb8f0658?${q}`,
  ],
};

export function curatedGalleryKeysForTypeName(roomTypeName) {
  const n = (roomTypeName || '').toLowerCase();
  if (/(ocean|biển|beach|hướng biển)/.test(n) || /\bview\b/i.test(roomTypeName || '')) return 'ocean';
  if (/(vip|president|penthouse|thượng hạng)/.test(n)) return 'vip';
  if (/family|gia đình|gia hòa|connecting/.test(n)) return 'family';
  if (/suite|sang trọng/.test(n)) return 'suite';
  if (/(deluxe|premium|cao cấp)/.test(n)) return 'deluxe';
  if (/standard|classic|tiêu chuẩn/.test(n)) return 'standard';
  return 'default';
}

export function curatedImagesForRoomType(roomTypeName) {
  const key = curatedGalleryKeysForTypeName(roomTypeName);
  return CURATED_GALLERY[key] || CURATED_GALLERY.default;
}
