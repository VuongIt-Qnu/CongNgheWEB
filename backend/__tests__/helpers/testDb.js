/**
 * Helper khởi tạo DB test cho kiểm thử tích hợp backend.
 *
 * Chiến lược:
 * - Dùng DB_FILE riêng (./data/test.db) qua biến môi trường
 * - Mỗi test suite gọi setupTestDb() trong beforeAll để tạo DB sạch mới
 * - Gọi teardownTestDb() trong afterAll để xóa file DB test
 *
 * Hoạt động được vì:
 * - Jest chạy với maxWorkers: 1 (tuần tự, 1 process)
 * - database/db.js dùng singleton _db; setupTestDb() tạo lại _db mới
 * - models/* gọi getDb() lấy _db hiện tại → tự động dùng DB test
 */

const path = require('path');
const fs = require('fs');

const TEST_DB_PATH = path.resolve(__dirname, '../../data/test.db');

/**
 * Thiết lập biến môi trường test.
 * PHẢI gọi ở đầu file (trước mọi require) để config.js đọc đúng env.
 */
function setTestEnv() {
  process.env.NODE_ENV = 'test';
  process.env.DB_FILE = './data/test.db';
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-chars!!';
  }
  process.env.JWT_EXPIRES_IN = '1h';
}

/**
 * Xóa file DB test nếu tồn tại.
 */
function cleanupTestDb() {
  if (fs.existsSync(TEST_DB_PATH)) {
    try {
      fs.unlinkSync(TEST_DB_PATH);
    } catch (_) {}
  }
}

/**
 * Khởi tạo DB test sạch cho mỗi test suite.
 * Reset singleton _db bằng cách xóa module cache của database/db.js.
 */
async function setupTestDb() {
  setTestEnv();

  // Xóa file DB test cũ (nếu có)
  cleanupTestDb();

  // Reset singleton _db trong module database/db.js
  const dbModuleKey = Object.keys(require.cache).find(
    (k) => k.includes('database') && k.includes('db.js')
  );
  if (dbModuleKey) {
    delete require.cache[dbModuleKey];
  }

  // Khởi tạo DB test mới
  const { initDb } = require('../../database/db');
  const db = await initDb();
  return db;
}

/**
 * Dọn dẹp sau khi test suite hoàn thành.
 */
async function teardownTestDb() {
  await new Promise((r) => setTimeout(r, 150));
  cleanupTestDb();
}

module.exports = {
  setTestEnv,
  setupTestDb,
  teardownTestDb,
  cleanupTestDb,
  TEST_DB_PATH,
};
