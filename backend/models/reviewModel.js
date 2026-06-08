const { getDb } = require('../database/db');

const VISIBLE = 'COALESCE(r.is_hidden, 0) = 0';

async function getStarDistribution(room_id) {
  const db = getDb();
  const rows = await db.all(
    `SELECT rating, COUNT(*) AS c
     FROM reviews r
     WHERE r.room_id = ? AND ${VISIBLE}
     GROUP BY rating`,
    room_id
  );
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of rows) {
    const k = Number(row.rating);
    if (k >= 1 && k <= 5) distribution[k] = Number(row.c || 0);
  }
  return distribution;
}

async function createReview({ user_id, room_id, booking_id, rating, comment }) {
  const db = getDb();
  const result = await db.run(
    `INSERT INTO reviews (user_id, room_id, booking_id, rating, comment, updated_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    user_id,
    room_id,
    booking_id,
    rating,
    comment
  );
  return getReviewRowById(result.lastID);
}

async function getReviewsByRoom(room_id, { page = 1, limit = 20, includeHidden = false } = {}) {
  const db = getDb();
  const offset = (Number(page) - 1) * Number(limit);
  const hideClause = includeHidden ? '1=1' : VISIBLE;

  const reviews = await db.all(
    `SELECT r.*, u.name AS user_name
     FROM reviews r
     LEFT JOIN users u ON u.id = r.user_id
     WHERE r.room_id = ? AND ${hideClause}
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    room_id,
    Number(limit),
    offset
  );

  const countRow = await db.get(
    `SELECT COUNT(*) AS total FROM reviews r WHERE r.room_id = ? AND ${hideClause}`,
    room_id
  );
  const statsRow = await db.get(
    `SELECT COALESCE(ROUND(AVG(r.rating), 2), 0) AS avg_rating
     FROM reviews r
     WHERE r.room_id = ? AND ${hideClause}`,
    room_id
  );
  const distribution = await getStarDistribution(room_id);

  return {
    reviews,
    total: countRow.total,
    avg_rating: statsRow.avg_rating,
    distribution,
    page: Number(page),
    limit: Number(limit),
  };
}

async function getReviewByBookingId(booking_id) {
  const db = getDb();
  return db.get('SELECT * FROM reviews WHERE booking_id = ?', booking_id);
}

async function deleteReview(id) {
  const db = getDb();
  return db.run('DELETE FROM reviews WHERE id = ?', id);
}

async function getReviewById(id) {
  const db = getDb();
  return db.get('SELECT * FROM reviews WHERE id = ?', id);
}

async function getReviewRowById(id) {
  const db = getDb();
  return db.get(
    `SELECT r.*, u.name AS user_name
     FROM reviews r
     LEFT JOIN users u ON u.id = r.user_id
     WHERE r.id = ?`,
    id
  );
}

async function updateReview(id, rating, comment) {
  const db = getDb();
  await db.run(
    `UPDATE reviews SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    rating,
    comment,
    id
  );
  return getReviewRowById(id);
}

async function setReviewHidden(id, is_hidden) {
  const db = getDb();
  await db.run(
    `UPDATE reviews SET is_hidden = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    is_hidden ? 1 : 0,
    id
  );
  return getReviewRowById(id);
}

async function getAllReviews({ page = 1, limit = 50, search = '', hidden } = {}) {
  const db = getDb();
  const offset = (Number(page) - 1) * Number(limit);
  let q = `
    SELECT r.*, u.name AS user_name, u.email AS user_email, rm.room_number
    FROM reviews r
    LEFT JOIN users u ON u.id = r.user_id
    LEFT JOIN rooms rm ON rm.id = r.room_id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    q += ` AND (u.name LIKE ? OR r.comment LIKE ? OR rm.room_number LIKE ? OR CAST(r.id AS TEXT) LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (hidden === '1' || hidden === 1 || hidden === true) {
    q += ` AND COALESCE(r.is_hidden, 0) = 1`;
  } else if (hidden === '0' || hidden === 0 || hidden === false) {
    q += ` AND COALESCE(r.is_hidden, 0) = 0`;
  }

  const countQuery = q.replace(
    'SELECT r.*, u.name AS user_name, u.email AS user_email, rm.room_number',
    'SELECT COUNT(*) AS c'
  );
  const countRow = await db.get(countQuery, ...params);

  q += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
  params.push(Number(limit), offset);

  const reviews = await db.all(q, ...params);

  return {
    reviews,
    total: countRow.c,
    page: Number(page),
    limit: Number(limit),
  };
}

/** Bookings user may review: completed, this room, no review yet, ownership by user_id or email */
async function getEligibleBookingsForRoom(room_id, userId, userEmail) {
  const db = getDb();
  const email = (userEmail || '').trim().toLowerCase();
  return db.all(
    `SELECT b.id, b.room_id, b.check_in_date, b.check_out_date, b.total_price, rooms.room_number
     FROM bookings b
     JOIN customers c ON c.id = b.customer_id
     JOIN rooms ON rooms.id = b.room_id
     WHERE b.room_id = ?
       AND b.status = 'completed'
       AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.booking_id = b.id)
       AND (c.user_id = ? OR (? != '' AND LOWER(IFNULL(c.email, '')) = ?))
     ORDER BY b.check_out_date DESC, b.id DESC`,
    room_id,
    userId,
    email,
    email
  );
}

async function getReviewsByUser(userId, { page = 1, limit = 20 } = {}) {
  const db = getDb();
  const offset = (Number(page) - 1) * Number(limit);
  const reviews = await db.all(
    `SELECT r.*, rm.room_number, rt.name AS room_type_name
     FROM reviews r
     LEFT JOIN rooms rm ON rm.id = r.room_id
     LEFT JOIN room_types rt ON rt.id = rm.room_type_id
     WHERE r.user_id = ?
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    userId,
    Number(limit),
    offset
  );
  const countRow = await db.get(
    `SELECT COUNT(*) AS total FROM reviews WHERE user_id = ?`,
    userId
  );
  return { reviews, total: countRow.total, page: Number(page), limit: Number(limit) };
}

module.exports = {
  createReview,
  getReviewsByRoom,
  getReviewByBookingId,
  deleteReview,
  getReviewById,
  getReviewRowById,
  updateReview,
  getAllReviews,
  setReviewHidden,
  getEligibleBookingsForRoom,
  getStarDistribution,
  getReviewsByUser,
};
