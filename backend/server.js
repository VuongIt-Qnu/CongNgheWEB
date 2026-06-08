const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initDb } = require('./database/db');
const config = require('./config/config');
const { errorHandler } = require('./middleware/errorHandler');
const passwordResetModel = require('./models/passwordResetModel');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roomTypeRoutes = require('./routes/roomTypeRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const customerRoutes = require('./routes/customerRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const activityRoutes = require('./routes/activityRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

/* ── Middleware bảo mật ── */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // cho phép tải ảnh được tải lên từ frontend
}));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ── Giới hạn tỉ lệ cho các route xác thực ── */
const authLimiter = rateLimit({
  windowMs: 60 * 1000,      // cửa sổ thời gian 1 phút
  max: 10,                   // 10 yêu cầu trên mỗi cửa sổ
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.',
  },
});

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,      // cửa sổ thời gian 1 phút
  max: 5,                    // 5 lần đăng nhập trên mỗi phút
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 1 phút.',
  },
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.',
  },
});

// Áp dụng các bộ giới hạn tỉ lệ (bỏ qua trong môi trường test)
const isTest = process.env.NODE_ENV === 'test';
if (!isTest) {
  app.use('/api/auth/login', loginLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/forgot-password', passwordResetLimiter);
  app.use('/api/auth/reset-password', passwordResetLimiter);
}

// Các định tuyến
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/activity-logs', activityRoutes);
app.use('/api/reviews', reviewRoutes);

// Kiểm tra sức khỏe
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

module.exports = app;

// Chỉ khởi động server nếu tệp này được chạy trực tiếp
if (require.main === module) {
  const PORT = Number(process.env.PORT || config.port || 5000);
  const MAX_PORT_TRIES = 8;

  const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

  function schedulePasswordResetCleanup() {
    const run = () => {
      passwordResetModel.deleteExpiredTokens().catch((err) => {
        console.error('Password reset token cleanup failed:', err);
      });
    };
    run();
    setInterval(run, CLEANUP_INTERVAL_MS);
  }

  initDb()
    .then(() => {
      schedulePasswordResetCleanup();
      const server = http.createServer(app);
      let port = PORT;

      function tryListen() {
        server.removeAllListeners('error');
        server.once('error', (err) => {
          if (err.code === 'EADDRINUSE' && port < PORT + MAX_PORT_TRIES) {
            console.warn(`Port ${port} is already in use, trying ${port + 1}...`);
            port += 1;
            tryListen();
          } else {
            console.error(err);
            process.exit(1);
          }
        });
        server.listen(port, () => {
          console.log(`Server running on http://localhost:${port}`);
          console.log(`🛡️  Security: helmet enabled, rate limiting active`);
        });
      }

      tryListen();
    })
    .catch((err) => {
      console.error('Failed to initialize database:', err);
      process.exit(1);
    });
}
