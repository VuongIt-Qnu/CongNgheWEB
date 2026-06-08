const { body } = require('express-validator');

const PHONE_VN = /^0\d{9}$/;

const register = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên là bắt buộc')
    .isLength({ max: 100 }).withMessage('Tên tối đa 100 ký tự'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc')
    .isLength({ min: 6, max: 100 }).withMessage('Mật khẩu từ 6–100 ký tự'),
  body('role')
    .optional()
    .isIn(['admin', 'staff', 'customer']).withMessage('Role không hợp lệ'),
];

const login = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ'),
  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc'),
];

const changePassword = [
  body('current_password')
    .notEmpty().withMessage('Vui lòng nhập mật khẩu hiện tại'),
  body('new_password')
    .notEmpty().withMessage('Vui lòng nhập mật khẩu mới')
    .isLength({ min: 6, max: 100 }).withMessage('Mật khẩu mới từ 6–100 ký tự'),
];

const updateMe = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên là bắt buộc')
    .isLength({ max: 100 }).withMessage('Tên tối đa 100 ký tự'),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .matches(PHONE_VN).withMessage('Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Địa chỉ tối đa 500 ký tự'),
];

const forgotPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
];

const resetPassword = [
  body('token')
    .notEmpty().withMessage('Token là bắt buộc'),
  body('newPassword')
    .notEmpty().withMessage('Mật khẩu mới là bắt buộc')
    .isLength({ min: 6, max: 100 }).withMessage('Mật khẩu từ 6–100 ký tự'),
  body('confirmPassword')
    .notEmpty().withMessage('Vui lòng xác nhận mật khẩu')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Mật khẩu xác nhận không khớp');
      }
      return true;
    }),
];

module.exports = { register, login, changePassword, updateMe, forgotPassword, resetPassword };
