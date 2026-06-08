const { validationResult } = require('express-validator');

/**
 * Middleware kiểm tra kết quả express-validator.
 * Nếu xác thực không thành công → 422 với phản hồi lỗi có cấu trúc.
 * Nếu tất cả đều ổn → next().
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const mapped = errors.array().map((e) => ({
      field: e.path || e.param,
      message: e.msg,
    }));
    return res.status(422).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: mapped,
    });
  }
  next();
}

module.exports = { handleValidation };
