const bookingModel = require('../models/bookingModel');

function normalizePaymentStatus(status) {
  if (!status) return 'pending';
  const s = String(status).toLowerCase();
  if (s === 'completed') return 'paid';
  return s;
}

function isPaidStatus(status) {
  const s = normalizePaymentStatus(status);
  return s === 'paid';
}

function isActivePaymentStatus(status) {
  const s = normalizePaymentStatus(status);
  return ['pending', 'processing', 'paid', 'completed'].includes(s);
}

async function confirmBookingIfPending(bookingId) {
  const booking = await bookingModel.getBookingById(bookingId);
  if (!booking || booking.status !== 'pending') return booking;

  return bookingModel.updateBooking(bookingId, {
    customer_id: booking.customer_id,
    room_id: booking.room_id,
    check_in_date: booking.check_in_date,
    check_out_date: booking.check_out_date,
    status: 'confirmed',
    total_price: booking.total_price,
  });
}

async function applyBookingAfterPaymentCreate(booking, paymentMethod, paymentStatus) {
  if (!booking) return booking;

  // Thanh toán tại khách sạn: giữ payment pending nhưng xác nhận booking
  if (paymentMethod === 'cash' && booking.status === 'pending') {
    return confirmBookingIfPending(booking.id);
  }

  // Admin tạo thủ công với trạng thái đã thanh toán
  if (isPaidStatus(paymentStatus) && booking.status === 'pending') {
    return confirmBookingIfPending(booking.id);
  }

  return booking;
}

async function applyBookingAfterPaymentApproved(bookingId) {
  return confirmBookingIfPending(bookingId);
}

module.exports = {
  normalizePaymentStatus,
  isPaidStatus,
  isActivePaymentStatus,
  confirmBookingIfPending,
  applyBookingAfterPaymentCreate,
  applyBookingAfterPaymentApproved,
};
