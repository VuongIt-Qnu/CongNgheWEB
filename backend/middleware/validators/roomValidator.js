const { body } = require('express-validator');

const createRoom = [
  body('room_number')
    .trim()
    .notEmpty().withMessage('Mã phòng là bắt buộc'),
  body('room_type_id')
    .notEmpty().withMessage('Loại phòng là bắt buộc')
    .isInt({ min: 1 }).withMessage('Loại phòng không hợp lệ'),
  body('price')
    .notEmpty().withMessage('Giá phòng là bắt buộc')
    .isFloat({ gt: 0 }).withMessage('Giá phòng phải lớn hơn 0'),
  body('capacity')
    .optional()
    .isInt({ min: 1 }).withMessage('Sức chứa phải là số nguyên ≥ 1'),
  body('status')
    .optional()
    .isIn(['available', 'booked', 'occupied', 'maintenance']).withMessage('Trạng thái không hợp lệ'),
  body('description')
    .optional()
    .trim(),
];

const updateRoom = [
  body('room_number')
    .optional()
    .trim()
    .notEmpty().withMessage('Mã phòng không được rỗng'),
  body('room_type_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Loại phòng không hợp lệ'),
  body('price')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Giá phòng phải lớn hơn 0'),
  body('capacity')
    .optional()
    .isInt({ min: 1 }).withMessage('Sức chứa phải là số nguyên ≥ 1'),
  body('status')
    .optional()
    .isIn(['available', 'booked', 'occupied', 'maintenance']).withMessage('Trạng thái không hợp lệ'),
  body('description')
    .optional()
    .trim(),
];

module.exports = { createRoom, updateRoom };
