require('dotenv').config();

/* ── Buộc thực thi JWT Secret ── */
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  console.error(
    '\n❌  FATAL: JWT_SECRET is required and must be at least 32 characters.\n' +
    '   Set it in your .env file, e.g.:\n' +
    '   JWT_SECRET=aUr0r4_r3s0rt_S3cr3T_2026!k9Xp#mZ\n'
  );
  process.exit(1);
}

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  databaseFile: process.env.DB_FILE || 'data/hotel.db',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
  },
};
