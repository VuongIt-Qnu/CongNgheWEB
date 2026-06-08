const { body } = require('express-validator');

const PHONE_VN = /^0\d{9}$/;

const createCustomer = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên khách hàng là bắt buộc')
    .isLength({ max: 100 }).withMessage('Tên tối đa 100 ký tự'),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .matches(PHONE_VN).withMessage('Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0'),
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('id_card')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('CMND/CCCD tối đa 20 ký tự'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Địa chỉ tối đa 500 ký tự'),
];

const updateCustomer = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Tên khách hàng không được rỗng')
    .isLength({ max: 100 }).withMessage('Tên tối đa 100 ký tự'),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .matches(PHONE_VN).withMessage('Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0'),
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('id_card')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('CMND/CCCD tối đa 20 ký tự'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Địa chỉ tối đa 500 ký tự'),
];

module.exports = { createCustomer, updateCustomer };
