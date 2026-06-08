const { body } = require('express-validator');

const createRoomType = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên loại phòng là bắt buộc')
    .isLength({ max: 100 }).withMessage('Tên tối đa 100 ký tự'),
  body('description')
    .optional()
    .trim(),
  body('base_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Giá cơ bản phải là số ≥ 0'),
];

const updateRoomType = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Tên loại phòng không được rỗng')
    .isLength({ max: 100 }).withMessage('Tên tối đa 100 ký tự'),
  body('description')
    .optional()
    .trim(),
  body('base_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Giá cơ bản phải là số ≥ 0'),
];

module.exports = { createRoomType, updateRoomType };
