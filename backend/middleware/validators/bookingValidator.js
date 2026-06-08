const { body } = require('express-validator');

/**
 * Kiểm tra YYYY-MM-DD có phải ngày lịch thực tế không.
 * Bắt các trường hợp: 2222-06-04, 2026-02-30, 2026-13-01, v.v.
 */
function isRealCalendarDate(isoStr) {
  if (!isoStr || typeof isoStr !== 'string') return false;
  const match = isoStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  // Round-trip qua Date để bắt ngày không tồn tại (31/02, 30/02, v.v.)
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

const createBooking = [
  body('room_id')
    .notEmpty().withMessage('Phòng là bắt buộc')
    .isInt({ min: 1 }).withMessage('Phòng không hợp lệ'),
  body('check_in_date')
    .notEmpty().withMessage('Ngày check-in là bắt buộc')
    .isISO8601().withMessage('Ngày check-in không hợp lệ (YYYY-MM-DD)')
    .custom((value) => {
      if (!isRealCalendarDate(value)) {
        throw new Error('Ngày check-in không phải ngày thực tế hợp lệ');
      }
      // Ngày check-in phải >= hôm nay
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkInDate = new Date(value + 'T00:00:00');
      if (checkInDate < today) {
        throw new Error('Ngày check-in không thể ở quá khứ');
      }
      return true;
    }),
  body('check_out_date')
    .notEmpty().withMessage('Ngày check-out là bắt buộc')
    .isISO8601().withMessage('Ngày check-out không hợp lệ (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (!isRealCalendarDate(value)) {
        throw new Error('Ngày check-out không phải ngày thực tế hợp lệ');
      }
      if (new Date(value) <= new Date(req.body.check_in_date)) {
        throw new Error('Ngày check-out phải sau ngày check-in');
      }
      return true;
    }),
  body('customer_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Mã khách hàng không hợp lệ'),
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'occupied', 'completed', 'cancelled']).withMessage('Trạng thái không hợp lệ'),
];

const updateBooking = [
  body('room_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Phòng không hợp lệ'),
  body('check_in_date')
    .optional()
    .isISO8601().withMessage('Ngày check-in không hợp lệ (YYYY-MM-DD)')
    .custom((value) => {
      if (!isRealCalendarDate(value)) {
        throw new Error('Ngày check-in không phải ngày thực tế hợp lệ');
      }
      return true;
    }),
  body('check_out_date')
    .optional()
    .isISO8601().withMessage('Ngày check-out không hợp lệ (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (!isRealCalendarDate(value)) {
        throw new Error('Ngày check-out không phải ngày thực tế hợp lệ');
      }
      const checkIn = req.body.check_in_date;
      if (checkIn && new Date(value) <= new Date(checkIn)) {
        throw new Error('Ngày check-out phải sau ngày check-in');
      }
      return true;
    }),
  body('customer_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Mã khách hàng không hợp lệ'),
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'occupied', 'completed', 'cancelled']).withMessage('Trạng thái không hợp lệ'),
  body('total_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Tổng tiền phải là số ≥ 0'),
];

const PAYMENT_METHODS = ['cash', 'bank_transfer', 'online', 'credit_card', 'momo', 'vnpay', 'zalopay', 'wallet'];

const completeBooking = [
  body('room_id')
    .notEmpty().withMessage('Phòng là bắt buộc')
    .isInt({ min: 1 }).withMessage('Phòng không hợp lệ'),
  body('check_in_date')
    .notEmpty().withMessage('Ngày check-in là bắt buộc')
    .isISO8601().withMessage('Ngày check-in không hợp lệ (YYYY-MM-DD)')
    .custom((value) => {
      if (!isRealCalendarDate(value)) {
        throw new Error('Ngày check-in không phải ngày thực tế hợp lệ');
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkInDate = new Date(value + 'T00:00:00');
      if (checkInDate < today) {
        throw new Error('Ngày check-in không thể ở quá khứ');
      }
      return true;
    }),
  body('check_out_date')
    .notEmpty().withMessage('Ngày check-out là bắt buộc')
    .isISO8601().withMessage('Ngày check-out không hợp lệ (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (!isRealCalendarDate(value)) {
        throw new Error('Ngày check-out không phải ngày thực tế hợp lệ');
      }
      if (new Date(value) <= new Date(req.body.check_in_date)) {
        throw new Error('Ngày check-out phải sau ngày check-in');
      }
      return true;
    }),
  body('payment_method')
    .trim()
    .notEmpty().withMessage('Phương thức thanh toán là bắt buộc')
    .toLowerCase()
    .isIn(PAYMENT_METHODS).withMessage('Phương thức thanh toán không hợp lệ'),
  body('services')
    .optional()
    .isArray().withMessage('Danh sách dịch vụ phải là mảng'),
  body('services.*.service_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Mã dịch vụ không hợp lệ'),
  body('services.*.quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('Số lượng phải ≥ 1'),
];

module.exports = { createBooking, updateBooking, completeBooking };
