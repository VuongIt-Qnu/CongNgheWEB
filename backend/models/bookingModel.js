const { getDb } = require('../database/db');

async function getBookings({ status, from, to, customerUserId, customer_id, search, page = 1, limit = 20 }) {
  const db = getDb();
  const filters = ['1 = 1'];
  const params = [];

  if (status) {
    filters.push('bookings.status = ?');
    params.push(status);
  }
  if (from) {
    filters.push('DATE(bookings.check_in_date) >= DATE(?)');
    params.push(from);
  }
  if (to) {
    filters.push('DATE(bookings.check_out_date) <= DATE(?)');
    params.push(to);
  }
  if (customerUserId) {
    filters.push('customers.user_id = ?');
    params.push(customerUserId);
  }
  if (customer_id != null && customer_id !== '') {
    filters.push('bookings.customer_id = ?');
    params.push(Number(customer_id));
  }
  if (search) {
    const q = `%${search}%`;
    filters.push('(customers.name LIKE ? OR rooms.room_number LIKE ? OR CAST(bookings.id AS TEXT) LIKE ?)');
    params.push(q, q, q);
  }

  const where = filters.join(' AND ');
  const offset = (Number(page) - 1) * Number(limit);

  const bookings = await db.all(
    `SELECT bookings.*, customers.name AS customer_name, rooms.room_number AS room_number,
            (SELECT COUNT(*) FROM reviews r WHERE r.booking_id = bookings.id) AS booking_review_count,
            (SELECT p.payment_status FROM payments p WHERE p.booking_id = bookings.id ORDER BY p.id DESC LIMIT 1) AS payment_status,
            (SELECT p.transaction_id FROM payments p WHERE p.booking_id = bookings.id ORDER BY p.id DESC LIMIT 1) AS transaction_id,
            (SELECT p.id FROM payments p WHERE p.booking_id = bookings.id ORDER BY p.id DESC LIMIT 1) AS payment_id
     FROM bookings
     LEFT JOIN customers ON bookings.customer_id = customers.id
     LEFT JOIN rooms ON bookings.room_id = rooms.id
     WHERE ${where}
     ORDER BY bookings.created_at DESC
     LIMIT ? OFFSET ?`,
    ...params,
    Number(limit),
    offset
  );

  const countRow = await db.get(
    `SELECT COUNT(*) AS total
     FROM bookings
     LEFT JOIN customers ON bookings.customer_id = customers.id
     LEFT JOIN rooms ON bookings.room_id = rooms.id
     WHERE ${where}`,
    ...params
  );

  return { bookings, total: countRow.total, page: Number(page), limit: Number(limit) };
}

/** Trùng lịch (theo booking đã xác nhận / chờ xử lý). */
async function hasRoomBookingOverlap(room_id, req_check_in, req_check_out, excludeBookingId = null) {
  const db = getDb();
  const params = [room_id, req_check_in, req_check_out];
  let sql = `
    SELECT COUNT(*) AS c FROM bookings
    WHERE room_id = ?
      AND status IN ('pending', 'confirmed', 'occupied')
      AND NOT (? >= date(check_out_date) OR ? <= date(check_in_date))
  `;
  if (excludeBookingId != null) {
    sql += ' AND id != ?';
    params.push(Number(excludeBookingId));
  }
  const row = await db.get(sql, ...params);
  return Number(row?.c || 0) > 0;
}

async function getBookingById(id) {
  const db = getDb();
  return db.get(
    `SELECT bookings.*, customers.name AS customer_name, rooms.room_number AS room_number,
            (SELECT p.payment_status FROM payments p WHERE p.booking_id = bookings.id ORDER BY p.id DESC LIMIT 1) AS payment_status,
            (SELECT p.transaction_id FROM payments p WHERE p.booking_id = bookings.id ORDER BY p.id DESC LIMIT 1) AS transaction_id,
            (SELECT p.id FROM payments p WHERE p.booking_id = bookings.id ORDER BY p.id DESC LIMIT 1) AS payment_id,
            (SELECT p.payment_method FROM payments p WHERE p.booking_id = bookings.id ORDER BY p.id DESC LIMIT 1) AS payment_method
     FROM bookings
     LEFT JOIN customers ON bookings.customer_id = customers.id
     LEFT JOIN rooms ON bookings.room_id = rooms.id
     WHERE bookings.id = ?`,
    id
  );
}

async function createBooking(booking) {
  const db = getDb();
  const result = await db.run(
    `INSERT INTO bookings (customer_id, room_id, check_in_date, check_out_date, status, total_price)
     VALUES (?, ?, ?, ?, ?, ?)`,
    booking.customer_id,
    booking.room_id,
    booking.check_in_date,
    booking.check_out_date,
    booking.status || 'pending',
    booking.total_price || 0
  );
  return getBookingById(result.lastID);
}

async function updateBooking(id, booking) {
  const db = getDb();
  await db.run(
    `UPDATE bookings SET customer_id = ?, room_id = ?, check_in_date = ?, check_out_date = ?, status = ?, total_price = ? WHERE id = ?`,
    booking.customer_id,
    booking.room_id,
    booking.check_in_date,
    booking.check_out_date,
    booking.status,
    booking.total_price,
    id
  );
  return getBookingById(id);
}

async function deleteBooking(id) {
  const db = getDb();
  return db.run('DELETE FROM bookings WHERE id = ?', id);
}

async function createDraftBooking(booking) {
  const db = getDb();
  const result = await db.run(
    `INSERT INTO bookings (customer_id, room_id, check_in_date, check_out_date, status, total_price, created_at)
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    booking.customer_id,
    booking.room_id,
    booking.check_in_date,
    booking.check_out_date,
    'draft',
    booking.total_price || 0
  );
  return getBookingById(result.lastID);
}

async function updateBookingStatus(id, status) {
  const db = getDb();
  await db.run(
    `UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    status,
    id
  );
  return getBookingById(id);
}

async function updateBookingPayment(id, paymentId, discountAmount = 0, taxAmount = 0) {
  const db = getDb();
  await db.run(
    `UPDATE bookings SET payment_id = ?, discount_amount = ?, tax_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    paymentId,
    discountAmount,
    taxAmount,
    id
  );
  return getBookingById(id);
}

async function getBookingServices(bookingId) {
  const db = getDb();
  return db.all(
    `SELECT bs.*, s.name, s.price FROM booking_services bs
     LEFT JOIN services s ON bs.service_id = s.id
     WHERE bs.booking_id = ?
     ORDER BY bs.id`,
    bookingId
  );
}

async function addBookingService(bookingId, serviceId, quantity = 1) {
  const db = getDb();
  const service = await db.get('SELECT price FROM services WHERE id = ?', serviceId);
  if (!service) throw new Error('Service not found');

  const totalPrice = service.price * quantity;
  const result = await db.run(
    `INSERT INTO booking_services (booking_id, service_id, quantity, total_price)
     VALUES (?, ?, ?, ?)`,
    bookingId,
    serviceId,
    quantity,
    totalPrice
  );
  return result.lastID;
}

async function removeBookingService(bookingServiceId) {
  const db = getDb();
  return db.run('DELETE FROM booking_services WHERE id = ?', bookingServiceId);
}

async function getBookingSummary(bookingId) {
  const db = getDb();
  const booking = await getBookingById(bookingId);
  if (!booking) return null;

  const services = await getBookingServices(bookingId);
  const serviceTotal = services.reduce((sum, s) => sum + (s.total_price || 0), 0);

  return {
    ...booking,
    services,
    serviceTotal,
    totalBeforeTax: booking.total_price + serviceTotal,
  };
}

module.exports = {
  getBookings,
  hasRoomBookingOverlap,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  createDraftBooking,
  updateBookingStatus,
  updateBookingPayment,
  getBookingServices,
  addBookingService,
  removeBookingService,
  getBookingSummary,
};
