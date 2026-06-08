const { body } = require('express-validator');

const createReview = [
  body('room_id')
    .notEmpty().withMessage('Phòng là bắt buộc')
    .isInt({ min: 1 }).withMessage('Phòng không hợp lệ'),
  body('booking_id')
    .notEmpty().withMessage('Mã booking là bắt buộc')
    .isInt({ min: 1 }).withMessage('Mã booking không hợp lệ'),
  body('rating')
    .notEmpty().withMessage('Điểm đánh giá là bắt buộc')
    .isInt({ min: 1, max: 5 }).withMessage('Điểm đánh giá từ 1 đến 5'),
  body('comment')
    .trim()
    .notEmpty().withMessage('Vui lòng nhập nội dung bình luận')
    .isLength({ max: 2000 }).withMessage('Bình luận tối đa 2000 ký tự'),
];

const updateReview = [
  body('rating')
    .notEmpty().withMessage('Điểm đánh giá là bắt buộc')
    .isInt({ min: 1, max: 5 }).withMessage('Điểm đánh giá từ 1 đến 5'),
  body('comment')
    .trim()
    .notEmpty().withMessage('Vui lòng nhập nội dung bình luận')
    .isLength({ max: 2000 }).withMessage('Bình luận tối đa 2000 ký tự'),
];

module.exports = { createReview, updateReview };
