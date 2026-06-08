const sanitizeHtml = require('sanitize-html');

/**
 * Loại bỏ TẤT CẢ các thẻ HTML từ một chuỗi, chỉ trả về văn bản thuần túy.
 * Cắt khoảng trắng và thu gọn nhiều khoảng trắng.
 */
function cleanText(value) {
  if (typeof value !== 'string') return '';
  const cleaned = sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  });
  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Nhà máy middleware Express: vệ sinh các trường body được chỉ định trước khi chúng đến bộ điều khiển.
 * Cách sử dụng: router.post('/', sanitizeBody('comment', 'description'), controller)
 */
function sanitizeBody(...fields) {
  return (req, _res, next) => {
    if (!req.body) return next();
    for (const field of fields) {
      if (req.body[field] !== undefined && typeof req.body[field] === 'string') {
        req.body[field] = cleanText(req.body[field]);
      }
    }
    next();
  };
}

module.exports = { cleanText, sanitizeBody };
