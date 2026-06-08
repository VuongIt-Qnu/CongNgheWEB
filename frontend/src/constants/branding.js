/**
 * Centralized branding & location for Aurora Resort Quy Nhơn.
 */
export const BRAND = {
  short: 'Aurora',
  resort: 'Aurora Resort',
  full: 'Aurora Resort Quy Nhơn',
  adminNav: 'Aurora Admin',
  adminSidebarTitle: 'Aurora Resort',
  adminSidebarSubtitle: 'Hotel Management',
  adminProfile: 'Aurora Management',
  tagline: 'Luxury coastal resort · Quy Nhơn',
  style: 'Modern coastal resort',
  copyright: (year = new Date().getFullYear()) =>
    `© ${year} Aurora Resort Quy Nhơn. Đẳng cấp nghỉ dưỡng 5 sao.`,
};

export const LOCATION = {
  city: 'Quy Nhơn',
  province: 'Bình Định',
  country: 'Việt Nam',
  fullAddress: 'Bãi biển Quy Nhơn, Bình Định, Việt Nam',
  shortAddress: 'Bãi biển Quy Nhơn',
  mapLabel: 'Bãi biển Quy Nhơn · 25 phút từ sân bay Phù Cát',
  phone: '1900 6868',
  phoneDisplay: '1900 6868',
  phoneIntl: '+(84) 256 384 8888',
  email: 'hello@auroraresort.vn',
  coords: { lat: 13.783, lng: 109.2193 },
};

/** Google Maps embed — Quy Nhơn, Bình Định */
export const GOOGLE_MAPS_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d496113.8474848867!2d109.2193265!3d13.7830072!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31727d38e8c6d5bb%3A0x5e3a96dc3c052b67!2zUXXhuqNuIE5ow61uLCBCaW5oIMSQ4buNbmgsIFZp4buHdCBuYW0!5e0!3m2!1svi!2s!4v1716621600000!5m2!1svi!2s';

export const SEO = {
  title: 'Aurora Resort Quy Nhơn — Luxury Coastal Resort',
  description:
    'Đặt phòng tại Aurora Resort Quy Nhơn — resort cao cấp bên bờ biển Bình Định. Suite view biển, spa, ẩm thực và dịch vụ 5 sao.',
};
