/**
 * Curated Luxury Hotel & Room Imagery with Fallback Protection
 */

const q = 'auto=format&fit=crop&w=1200&q=80';

export const ROOM_GALLERIES: Record<string, string[]> = {
  ocean: [
    `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?${q}`,
    `https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?${q}`,
    `https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?${q}`,
    `https://images.unsplash.com/photo-1542314831-a068fcd6c053?${q}`
  ],
  vip: [
    `https://images.unsplash.com/photo-1578683010236-d716f9a3f461?${q}`,
    `https://images.unsplash.com/photo-1596394516093-501e68dae0d6?${q}`,
    `https://images.unsplash.com/photo-1540518610756-8c67786b7973?${q}`,
    `https://images.unsplash.com/photo-1566073771259-6a8506099945?${q}`
  ],
  suite: [
    `https://images.unsplash.com/photo-1618773928121-c32242e63f39?${q}`,
    `https://images.unsplash.com/photo-1591088398332-8a7791972843?${q}`,
    `https://images.unsplash.com/photo-1631049307264-da0c9adc7d23?${q}`,
    `https://images.unsplash.com/photo-1590490360182-c33d57733427?${q}`
  ],
  family: [
    `https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?${q}`,
    `https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?${q}`,
    `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?${q}`,
    `https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?${q}`
  ],
  deluxe: [
    `https://images.unsplash.com/photo-1590490360182-c33d57733427?${q}`,
    `https://images.unsplash.com/photo-1566665797739-1674de7a421a?${q}`,
    `https://images.unsplash.com/photo-1616594039964-3ca3fa5674c3?${q}`,
    `https://images.unsplash.com/photo-1584132967334-10e2bd60ff84?${q}`
  ],
  standard: [
    `https://images.unsplash.com/photo-1631049307264-da0c9adc7d23?${q}`,
    `https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?${q}`,
    `https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?${q}`,
    `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?${q}`
  ],
  default: [
    `https://images.unsplash.com/photo-1566665797739-1674de7a421a?${q}`,
    `https://images.unsplash.com/photo-1590490360182-c33d57733427?${q}`,
    `https://images.unsplash.com/photo-1618773928121-c32242e63f39?${q}`,
    `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?${q}`
  ]
};

export const RESORT_HERO_IMAGE = `https://images.unsplash.com/photo-1542314831-a068fcd6c053?auto=format&fit=crop&w=1920&q=85`;
export const RESORT_LOGO_FALLBACK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280"><rect width="400" height="280" fill="%230F2444"/><text x="50%" y="45%" fill="%23C6A96A" font-size="28" font-family="sans-serif" text-anchor="middle" font-weight="bold">AURORA RESORT</text><text x="50%" y="60%" fill="%2394A3B8" font-size="14" font-family="sans-serif" text-anchor="middle">Luxury Hotel & Suites</text></svg>`;

export function getGalleryKey(typeName?: string): string {
  const n = (typeName || '').toLowerCase();
  if (/(biển|ocean|beach|hướng biển)/.test(n)) return 'ocean';
  if (/(vip|thượng hạng|penthouse|president)/.test(n)) return 'vip';
  if (/(suite|sang trọng)/.test(n)) return 'suite';
  if (/(gia đình|family)/.test(n)) return 'family';
  if (/(cao cấp|deluxe|premium)/.test(n)) return 'deluxe';
  if (/(tiêu chuẩn|standard|classic)/.test(n)) return 'standard';
  return 'default';
}

export function getRoomImages(typeName?: string): string[] {
  const key = getGalleryKey(typeName);
  return ROOM_GALLERIES[key] || ROOM_GALLERIES['default'];
}

export function getPrimaryRoomImage(typeName?: string, roomIndex: number = 0): string {
  const gallery = getRoomImages(typeName);
  return gallery[roomIndex % gallery.length] || ROOM_GALLERIES['default'][0];
}

export function getRoomAmenities(typeName?: string): string[] {
  const key = getGalleryKey(typeName);
  switch (key) {
    case 'vip':
      return ['Jacuzzi riêng', 'View Panorama', 'Minibar & Rượu vang', 'Ăn sáng tại phòng', 'Xe đưa đón'];
    case 'ocean':
      return ['Ban công view biển', 'Bồn tắm hướng biển', 'Smart TV 65"', 'Nespresso bar', 'Wifi tốc độ cao'];
    case 'suite':
      return ['Phòng khách riêng', 'Bồn tắm cao cấp', 'Khu vực làm việc', 'Nespresso bar', 'Dịch vụ dọn phòng 24/7'];
    case 'family':
      return ['2 Giường đôi', 'Khu vui chơi trẻ em', 'Cũi em bé', 'Tủ lạnh lớn', 'Bàn ăn gia đình'];
    case 'deluxe':
      return ['Giường King Size', 'Sofa thư giãn', 'Bàn làm việc', 'Két sắt an toàn', 'Ban công thoáng'];
    default:
      return ['Giường Queen', 'Điều hòa 2 chiều', 'TV 50" 4K', 'Wifi miễn phí', 'Ấm đun siêu tốc'];
  }
}

export function getRoomRating(roomId: number): { score: number; count: number } {
  const scores = [4.8, 4.9, 4.7, 4.9, 5.0, 4.8, 4.9, 4.6, 4.8, 5.0];
  const counts = [128, 94, 76, 142, 210, 88, 165, 54, 119, 310];
  const idx = Math.abs(roomId) % scores.length;
  return {
    score: scores[idx],
    count: counts[idx]
  };
}

export function handleImageFallback(event: Event) {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.src = RESORT_LOGO_FALLBACK;
  }
}
