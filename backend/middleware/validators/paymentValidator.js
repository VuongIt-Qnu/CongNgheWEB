const { body } = require('express-validator');

const PAYMENT_METHODS = ['cash', 'bank_transfer', 'online', 'credit_card', 'momo', 'vnpay', 'zalopay'];
const PAYMENT_STATUSES = ['pending', 'processing', 'completed', 'paid', 'failed', 'refunded'];

const createPayment = [
  body('booking_id')
    .notEmpty().withMessage('Mã booking là bắt buộc')
    .isInt({ min: 1 }).withMessage('Mã booking không hợp lệ'),
  body('amount')
    .notEmpty().withMessage('Số tiền là bắt buộc')
    .isFloat({ gt: 0 }).withMessage('Số tiền phải lớn hơn 0'),
  body('payment_method')
    .trim()
    .notEmpty().withMessage('Phương thức thanh toán là bắt buộc')
    .toLowerCase()
    .isIn(PAYMENT_METHODS).withMessage('Phương thức thanh toán không hợp lệ'),
  body('payment_status')
    .optional()
    .trim()
    .toLowerCase()
    .isIn(PAYMENT_STATUSES).withMessage('Trạng thái thanh toán không hợp lệ'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Ghi chú không quá 1000 ký tự'),
  body('transaction_id')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Mã giao dịch không quá 100 ký tự'),
];

const updatePayment = [
  body('payment_status')
    .optional()
    .trim()
    .toLowerCase()
    .isIn(PAYMENT_STATUSES).withMessage('Trạng thái thanh toán không hợp lệ'),
  body('payment_method')
    .optional()
    .trim()
    .toLowerCase()
    .isIn(PAYMENT_METHODS).withMessage('Phương thức thanh toán không hợp lệ'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Ghi chú không quá 1000 ký tự'),
  body('transaction_id')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Mã giao dịch không quá 100 ký tự'),
];

const refundPayment = [
  body('amount')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Số tiền hoàn trả phải lớn hơn 0'),
  body('reason')
    .notEmpty().withMessage('Lý do hoàn tiền là bắt buộc')
    .trim()
    .isLength({ min: 3, max: 1000 }).withMessage('Lý do hoàn tiền phải từ 3 đến 1000 ký tự'),
];

const rejectPayment = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Lý do từ chối không quá 1000 ký tự'),
];

module.exports = {
  createPayment,
  updatePayment,
  refundPayment,
  rejectPayment,
};
