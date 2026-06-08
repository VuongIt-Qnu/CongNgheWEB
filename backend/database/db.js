const fs = require('fs');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const config = require('../config/config');

const dbFile = path.resolve(__dirname, '..', config.databaseFile || 'data/hotel.db');
const dbDir = path.dirname(dbFile);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let _db = null;

async function initDb() {
  const db = await open({
    filename: dbFile,
    driver: sqlite3.Database,
  });

  await db.exec(`PRAGMA foreign_keys = ON;`);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const ucEarly = await db.all(`PRAGMA table_info(users)`);
  if (!ucEarly.some((c) => c.name === 'is_active')) {
    await db.exec(`ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1`);
  }
  if (!ucEarly.some((c) => c.name === 'phone')) {
    await db.exec(`ALTER TABLE users ADD COLUMN phone TEXT DEFAULT ''`);
  }
  if (!ucEarly.some((c) => c.name === 'address')) {
    await db.exec(`ALTER TABLE users ADD COLUMN address TEXT DEFAULT ''`);
  }
  if (!ucEarly.some((c) => c.name === 'avatar_url')) {
    await db.exec(`ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT ''`);
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used_at DATETIME NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets(token_hash);
    CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
  `);

  const existingAdmin = await db.get("SELECT id FROM users WHERE email = 'admin@example.com'");
  if (!existingAdmin) {
    const hashed = await bcrypt.hash('admin123', 10);
    await db.run(
      "INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)",
      'Admin',
      'admin@example.com',
      hashed,
      'admin',
      1
    );
    console.log('Seeded default admin: admin@example.com / admin123');
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS room_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_number TEXT NOT NULL UNIQUE,
      room_type_id INTEGER NOT NULL,
      price REAL NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'available',
      description TEXT,
      FOREIGN KEY(room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      id_card TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const customerColumns = await db.all(`PRAGMA table_info(customers)`);
  if (!customerColumns.some((c) => c.name === 'user_id')) {
    await db.exec(`ALTER TABLE customers ADD COLUMN user_id INTEGER REFERENCES users(id)`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id)`);
    await db.exec(`
      UPDATE customers
      SET user_id = (SELECT id FROM users WHERE users.email = customers.email LIMIT 1)
      WHERE user_id IS NULL AND email IS NOT NULL
        AND EXISTS (SELECT 1 FROM users WHERE users.email = customers.email)
    `);
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      check_in_date TEXT NOT NULL,
      check_out_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      total_price REAL NOT NULL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      payment_id INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE SET NULL,
      FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE SET NULL,
      FOREIGN KEY(payment_id) REFERENCES payments(id) ON DELETE SET NULL
    );
  `);

  const bookingColumns = await db.all(`PRAGMA table_info(bookings)`);
  if (!bookingColumns.some((c) => c.name === 'discount_amount')) {
    await db.exec(`ALTER TABLE bookings ADD COLUMN discount_amount REAL DEFAULT 0`);
  }
  if (!bookingColumns.some((c) => c.name === 'tax_amount')) {
    await db.exec(`ALTER TABLE bookings ADD COLUMN tax_amount REAL DEFAULT 0`);
  }
  if (!bookingColumns.some((c) => c.name === 'payment_id')) {
    await db.exec(`ALTER TABLE bookings ADD COLUMN payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL`);
  }
  if (!bookingColumns.some((c) => c.name === 'notes')) {
    await db.exec(`ALTER TABLE bookings ADD COLUMN notes TEXT`);
  }
  if (!bookingColumns.some((c) => c.name === 'updated_at')) {
    await db.exec(`ALTER TABLE bookings ADD COLUMN updated_at DATETIME`);
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      description TEXT
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS room_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS booking_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      total_price REAL NOT NULL DEFAULT 0,
      FOREIGN KEY(booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY(service_id) REFERENCES services(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      user_id INTEGER,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      transaction_id TEXT,
      notes TEXT,
      refund_reason TEXT,
      refunded_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      FOREIGN KEY(booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  const paymentColumns = await db.all(`PRAGMA table_info(payments)`);
  if (!paymentColumns.some((c) => c.name === 'user_id')) {
    await db.exec(`ALTER TABLE payments ADD COLUMN user_id INTEGER REFERENCES users(id)`);
  }
  if (!paymentColumns.some((c) => c.name === 'payment_status')) {
    await db.exec(`ALTER TABLE payments ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending'`);
    // Sao chép trạng thái hiện có sang payment_status nếu có sẵn
    try {
      await db.exec(`UPDATE payments SET payment_status = status WHERE status IS NOT NULL`);
    } catch (_) {}
  }
  if (!paymentColumns.some((c) => c.name === 'transaction_id')) {
    await db.exec(`ALTER TABLE payments ADD COLUMN transaction_id TEXT`);
  }
  if (!paymentColumns.some((c) => c.name === 'notes')) {
    await db.exec(`ALTER TABLE payments ADD COLUMN notes TEXT`);
  }
  if (!paymentColumns.some((c) => c.name === 'refund_reason')) {
    await db.exec(`ALTER TABLE payments ADD COLUMN refund_reason TEXT`);
  }
  if (!paymentColumns.some((c) => c.name === 'refunded_at')) {
    await db.exec(`ALTER TABLE payments ADD COLUMN refunded_at DATETIME`);
  }
  if (!paymentColumns.some((c) => c.name === 'created_at')) {
    await db.exec(`ALTER TABLE payments ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
    try {
      await db.exec(`UPDATE payments SET created_at = payment_date WHERE payment_date IS NOT NULL`);
    } catch (_) {}
  }
  if (!paymentColumns.some((c) => c.name === 'updated_at')) {
    await db.exec(`ALTER TABLE payments ADD COLUMN updated_at DATETIME`);
  }

  /** Kho demo — loại phòng */
  const rtc = await db.get('SELECT COUNT(*) AS c FROM room_types');
  if (!rtc?.c) {
    await db.exec(`
      INSERT INTO room_types (name, description) VALUES
      ('Phòng Tiêu Chuẩn', 'Phòng tiêu chuẩn tối giản, đủ tiện nghi cho công tác ngắn.'),
      ('Phòng Cao Cấp', 'Không gian rộng hơn, khu vực làm việc và sofa nhỏ.'),
      ('Phòng Hướng Biển', 'View biển panorama, ban công riêng.'),
      ('Phòng Suite Sang Trọng', 'Suite phòng khách riêng, bồn tắm và minibar cao cấp.'),
      ('Phòng Gia Đình', 'Hai phòng ngủ thông nhau, lý tưởng cho gia đình.'),
      ('Phòng VIP Thượng Hạng', 'Penthouse tầng cao, dịch vụ concierge riêng.');
    `);
    console.log('Seeded demo room_types');
  }

  const rc = await db.get('SELECT COUNT(*) AS c FROM rooms');
  if (!rc?.c) {
    const types = await db.all('SELECT id, name FROM room_types ORDER BY id');
    if (types.length) {
      const byName = Object.fromEntries(types.map((t) => [t.name, t.id]));
      const idOf = (name) => byName[name] ?? types[0].id;

      const rows = [
        ['801', idOf('Phòng Tiêu Chuẩn'), 1890000, 2, 'available', 'Tone trắng và gỗ sồi; cửa sổ nhìn ra vườn zen nội khu.'],
        ['802', idOf('Phòng Tiêu Chuẩn'), 1950000, 2, 'available', 'Giường queen, chăn duvet cotton organic.'],
        ['903', idOf('Phòng Cao Cấp'), 2650000, 3, 'available', 'Không gian chia vùng sống & ngủ, desk ergonomic.'],
        ['904', idOf('Phòng Cao Cấp'), 2750000, 3, 'occupied', 'Đang có khách — có thể chọn ngày khác.'],
        ['1201', idOf('Phòng Hướng Biển'), 4200000, 3, 'available', 'Lan can kính, view bình minh và resort pool.'],
        ['1205', idOf('Phòng Hướng Biển'), 4350000, 4, 'available', 'Ban công lớn, outdoor lounge nhỏ.'],
        ['1508', idOf('Phòng Suite Sang Trọng'), 5890000, 4, 'available', 'Living riêng, Nespresso bar, bồn tắm freestanding.'],
        ['1510', idOf('Phòng Suite Sang Trọng'), 6100000, 4, 'available', 'Corner suite hai hướng cửa sổ, mood lighting.'],
        ['608', idOf('Phòng Gia Đình'), 3490000, 5, 'available', 'Twin + queen, vách di động, kệ đồ chơi cho trẻ.'],
        ['1801', idOf('Phòng VIP Thượng Hạng'), 8990000, 6, 'available', 'Duplex penthouse, jacuzzi và lounge riêng.'],
      ];

      const stmt =
        'INSERT INTO rooms (room_number, room_type_id, price, capacity, status, description) VALUES (?, ?, ?, ?, ?, ?)';
      for (const row of rows) {
        await db.run(stmt, ...row);
      }
      console.log(`Seeded ${rows.length} demo rooms`);
    }
  }

  const sc = await db.get('SELECT COUNT(*) AS c FROM services');
  if (!sc?.c) {
    await db.exec(`
      INSERT INTO services (name, price, description) VALUES
      ('Buffet sáng quốc tế', 350000, '06:30–10:30 tại nhà hàng The Pearl.'),
      ('Spa relaxation 60 phút', 950000, 'Massage body & aromatic oil.'),
      ('Đưa đón sân bay (một chiều)', 480000, 'Xe limousine 7 chỗ, đặt trước 4h.'),
      ('Giặt ủi express', 150000, 'Nhận trong ngày tùy khối lượng.'),
      ('Minibar package', 420000, 'Đồ uống & snack refill theo menu.');
    `);
    console.log('Seeded demo services');
  }

  const ic = await db.get('SELECT COUNT(*) AS c FROM room_images');
  if (!ic?.c) {
    const gallery = [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1631049307264-da0c9adc7d23?auto=format&fit=crop&w=1400&q=85',
    ];
    const roomRows = await db.all('SELECT id FROM rooms ORDER BY id');
    let i = 0;
    for (const r of roomRows) {
      for (let k = 0; k < 2; k += 1) {
        await db.run('INSERT INTO room_images (room_id, image_url) VALUES (?, ?)', r.id, gallery[i % gallery.length]);
        i += 1;
      }
    }
    if (roomRows.length) console.log('Seeded room_images for demo rooms');
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_id INTEGER REFERENCES users(id),
      action TEXT NOT NULL,
      detail TEXT,
      entity_type TEXT,
      entity_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs (created_at DESC);
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS hotel_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const sk = await db.get('SELECT COUNT(*) AS c FROM hotel_settings');
  if (!sk?.c) {
    const defs = [
      ['hotel_name', 'Aurora Resort Quy Nhơn'],
      ['hotel_email', 'hello@auroraresort.vn'],
      ['hotel_phone', '1900 6868'],
      ['hotel_address', 'Bãi biển Quy Nhơn, Bình Định, Việt Nam'],
      ['logo_url', ''],
      ['banner_url', ''],
    ];
    for (const [k, v] of defs) {
      await db.run('INSERT INTO hotel_settings (key, value) VALUES (?, ?)', k, v);
    }
    console.log('Seeded hotel_settings defaults');
  }

  const brandMigrations = [
    ['hotel_name', ['Aurora Resort'], 'Aurora Resort Quy Nhơn'],
    [
      'hotel_address',
      ['Vietnam', 'Bãi biển Nha Trang, Việt Nam'],
      'Bãi biển Quy Nhơn, Bình Định, Việt Nam',
    ],
  ];
  for (const [key, oldValues, newValue] of brandMigrations) {
    const placeholders = oldValues.map(() => '?').join(', ');
    await db.run(
      `UPDATE hotel_settings SET value = ? WHERE key = ? AND value IN (${placeholders})`,
      [newValue, key, ...oldValues]
    );
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      booking_id INTEGER,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      is_hidden INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      FOREIGN KEY(booking_id) REFERENCES bookings(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_reviews_room ON reviews(room_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
  `);

  const reviewCols = await db.all(`PRAGMA table_info(reviews)`);
  if (!reviewCols.some((c) => c.name === 'updated_at')) {
    await db.exec(`ALTER TABLE reviews ADD COLUMN updated_at DATETIME`);
  }
  if (!reviewCols.some((c) => c.name === 'is_hidden')) {
    await db.exec(`ALTER TABLE reviews ADD COLUMN is_hidden INTEGER NOT NULL DEFAULT 0`);
  }
  await db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_booking_unique
    ON reviews(booking_id) WHERE booking_id IS NOT NULL
  `);

  _db = db;
  return db;
}

function getDb() {
  if (!_db) throw new Error('Database not initialized. Call initDb() first.');
  return _db;
}

module.exports = { initDb, getDb, dbFile };
