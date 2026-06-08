const { body } = require('express-validator');

const createService = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên dịch vụ là bắt buộc')
    .isLength({ max: 100 }).withMessage('Tên tối đa 100 ký tự'),
  body('price')
    .notEmpty().withMessage('Giá dịch vụ là bắt buộc')
    .isFloat({ min: 0 }).withMessage('Giá dịch vụ phải là số ≥ 0'),
  body('description')
    .optional()
    .trim(),
];

const updateService = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Tên dịch vụ không được rỗng')
    .isLength({ max: 100 }).withMessage('Tên tối đa 100 ký tự'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Giá dịch vụ phải là số ≥ 0'),
  body('description')
    .optional()
    .trim(),
];

module.exports = { createService, updateService };
