function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Lỗi máy chủ nội bộ',
    details: err.details || undefined,
  });
}

module.exports = { errorHandler };