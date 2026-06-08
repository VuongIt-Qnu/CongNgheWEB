/**
 * Centralized Vietnamese labels for Aurora Resort Quy Nhơn.
 * Import from here instead of hardcoding labels in components.
 */

/* ── Room Status ── */
export const ROOM_STATUS_LABELS = {
  available: 'Còn Trống',
  booked: 'Đã Đặt',
  occupied: 'Đang Sử Dụng',
  maintenance: 'Đang Bảo Trì',
};

export const ROOM_STATUS_OPTIONS = [
  { value: 'available', label: 'Còn Trống' },
  { value: 'booked', label: 'Đã Đặt' },
  { value: 'occupied', label: 'Đang Sử Dụng' },
  { value: 'maintenance', label: 'Đang Bảo Trì' },
];

export const ROOM_STATUS_BADGE = {
  available: 'bg-emerald-100 text-emerald-900 ring-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-700',
  booked: 'bg-amber-100 text-amber-900 ring-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-700',
  occupied: 'bg-rose-100 text-rose-900 ring-rose-300 dark:bg-rose-900/30 dark:text-rose-200 dark:ring-rose-700',
  maintenance: 'bg-slate-200 text-slate-700 ring-slate-300 dark:bg-slate-700/50 dark:text-slate-300 dark:ring-slate-600',
};

/* ── Booking Status ── */
export const BOOKING_STATUS_LABELS = {
  pending: 'Chờ Xác Nhận',
  confirmed: 'Đã Xác Nhận',
  occupied: 'Đang Lưu Trú',
  completed: 'Hoàn Thành',
  cancelled: 'Đã Hủy',
};

export const BOOKING_STATUS_OPTIONS = [
  { value: '', label: 'Mọi trạng thái' },
  { value: 'pending', label: 'Chờ Xác Nhận' },
  { value: 'confirmed', label: 'Đã Xác Nhận' },
  { value: 'occupied', label: 'Đang Lưu Trú' },
  { value: 'completed', label: 'Hoàn Thành' },
  { value: 'cancelled', label: 'Đã Hủy' },
];

export const BOOKING_STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-900 ring-amber-200 dark:bg-amber-900/35 dark:text-amber-50 dark:ring-amber-800',
  confirmed: 'bg-sky-100 text-sky-900 ring-sky-200 dark:bg-sky-900/35 dark:text-sky-50 dark:ring-sky-800',
  occupied: 'bg-violet-100 text-violet-900 ring-violet-200 dark:bg-violet-900/35 dark:text-violet-50 dark:ring-violet-800',
  completed: 'bg-emerald-100 text-emerald-900 ring-emerald-200 dark:bg-emerald-900/35 dark:text-emerald-50 dark:ring-emerald-800',
  cancelled: 'bg-rose-100 text-rose-900 ring-rose-200 dark:bg-rose-900/35 dark:text-rose-50 dark:ring-rose-800',
};

/* ── Room Names Mapping (room_number → elegant Vietnamese name) ── */
export const ROOM_NAMES = {
  '801': 'Sapphire',
  '802': 'Emerald',
  '903': 'Ánh Dương',
  '904': 'Hoàng Hôn',
  '1201': 'Sóng Biển',
  '1205': 'Chân Trời',
  '1508': 'Ngọc Trai',
  '1510': 'Kim Cương',
  '608': 'Gia Hòa',
  '1801': 'Hoàng Gia',
};

/* ── Helper functions ── */
export function roomStatusLabel(status) {
  return ROOM_STATUS_LABELS[String(status || '').toLowerCase()] || status || '—';
}

export function roomStatusBadgeClass(status) {
  return ROOM_STATUS_BADGE[String(status || '').toLowerCase()] || 'bg-slate-100 text-slate-800 ring-slate-200 dark:bg-slate-700 dark:text-slate-100';
}

export function bookingStatusLabel(status) {
  return BOOKING_STATUS_LABELS[String(status || '').toLowerCase()] || status || '—';
}

export function bookingStatusBadgeClass(status) {
  return BOOKING_STATUS_BADGE[String(status || '').toLowerCase()] || 'bg-slate-100 text-slate-800 ring-slate-200 dark:bg-slate-700 dark:text-slate-100';
}

/** Returns elegant display name: "Phòng Sapphire 801" */
export function displayRoomName(roomNumber) {
  const name = ROOM_NAMES[String(roomNumber)];
  if (name) return `Phòng ${name} ${roomNumber}`;
  return `Phòng ${roomNumber}`;
}

/** Short display: "Sapphire 801" for cards */
export function shortRoomName(roomNumber) {
  const name = ROOM_NAMES[String(roomNumber)];
  if (name) return `${name} ${roomNumber}`;
  return roomNumber;
}

/* ── Payment Status ── */
export const PAYMENT_STATUS_LABELS = {
  pending: 'Chờ thanh toán',
  processing: 'Đang xử lý',
  paid: 'Đã thanh toán',
  completed: 'Đã thanh toán',
  failed: 'Thất bại',
  refunded: 'Đã hoàn tiền',
};

export const PAYMENT_METHOD_LABELS = {
  credit_card: 'Thẻ tín dụng',
  bank_transfer: 'Chuyển khoản ngân hàng',
  momo: 'Ví Momo',
  vnpay: 'Cổng VNPay',
  zalopay: 'Ví ZaloPay',
  cash: 'Tại khách sạn',
  online: 'Cổng Online',
};

export function paymentStatusLabel(status) {
  return PAYMENT_STATUS_LABELS[String(status || 'pending').toLowerCase()] || status || 'Chờ thanh toán';
}

export function paymentMethodLabel(method) {
  return PAYMENT_METHOD_LABELS[String(method || '').toLowerCase()] || method || '—';
}

export function isPaidPaymentStatus(status) {
  const s = String(status || '').toLowerCase();
  return s === 'paid' || s === 'completed';
}

export function isAwaitingPaymentStatus(status) {
  const s = String(status || '').toLowerCase();
  return s === 'pending' || s === 'processing';
}
