const { getDb } = require('../database/db');

async function createPayment(payment) {
  const db = getDb();
  const result = await db.run(
    `INSERT INTO payments (booking_id, user_id, amount, payment_method, payment_status, transaction_id, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    payment.booking_id,
    payment.user_id || null,
    payment.amount,
    payment.payment_method,
    payment.payment_status || 'pending',
    payment.transaction_id || null,
    payment.notes || null
  );
  return getPaymentById(result.lastID);
}

async function getPaymentById(id) {
  const db = getDb();
  return db.get(
    `SELECT p.*, 
            b.check_in_date, b.check_out_date, b.total_price AS booking_total,
            c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
            r.room_number, r.price AS room_price
     FROM payments p
     LEFT JOIN bookings b ON p.booking_id = b.id
     LEFT JOIN customers c ON b.customer_id = c.id
     LEFT JOIN rooms r ON b.room_id = r.id
     WHERE p.id = ?`,
    id
  );
}

async function getPayments({ booking_id, payment_status, payment_method, search, page = 1, limit = 20 }) {
  const db = getDb();
  const filters = ['1 = 1'];
  const params = [];

  if (booking_id) {
    filters.push('p.booking_id = ?');
    params.push(Number(booking_id));
  }
  if (payment_status) {
    filters.push('p.payment_status = ?');
    params.push(payment_status);
  }
  if (payment_method) {
    filters.push('p.payment_method = ?');
    params.push(payment_method);
  }
  if (search) {
    const q = `%${search}%`;
    filters.push('(c.name LIKE ? OR p.transaction_id LIKE ? OR r.room_number LIKE ? OR CAST(p.booking_id AS TEXT) LIKE ?)');
    params.push(q, q, q, q);
  }

  const whereClause = filters.join(' AND ');
  const offset = (Number(page) - 1) * Number(limit);

  const payments = await db.all(
    `SELECT p.*, 
            c.name AS customer_name, c.email AS customer_email,
            r.room_number
     FROM payments p
     LEFT JOIN bookings b ON p.booking_id = b.id
     LEFT JOIN customers c ON b.customer_id = c.id
     LEFT JOIN rooms r ON b.room_id = r.id
     WHERE ${whereClause} 
     ORDER BY p.created_at DESC 
     LIMIT ? OFFSET ?`,
    ...params,
    Number(limit),
    offset
  );

  const countRow = await db.get(
    `SELECT COUNT(*) as total 
     FROM payments p
     LEFT JOIN bookings b ON p.booking_id = b.id
     LEFT JOIN customers c ON b.customer_id = c.id
     LEFT JOIN rooms r ON b.room_id = r.id
     WHERE ${whereClause}`,
    ...params
  );

  return { payments, total: countRow.total, page: Number(page), limit: Number(limit) };
}

async function getUserPayments(userId) {
  const db = getDb();
  return db.all(
    `SELECT p.*, 
            b.check_in_date, b.check_out_date,
            r.room_number
     FROM payments p
     LEFT JOIN bookings b ON p.booking_id = b.id
     LEFT JOIN rooms r ON b.room_id = r.id
     WHERE p.user_id = ? OR b.customer_id = (SELECT id FROM customers WHERE user_id = ? LIMIT 1)
     ORDER BY p.created_at DESC`,
    userId,
    userId
  );
}

async function updatePayment(id, updates) {
  const db = getDb();
  const fields = [];
  const params = [];

  if (updates.payment_status !== undefined) {
    fields.push('payment_status = ?');
    params.push(updates.payment_status);
  }
  if (updates.payment_method !== undefined) {
    fields.push('payment_method = ?');
    params.push(updates.payment_method);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    params.push(updates.notes);
  }
  if (updates.transaction_id !== undefined) {
    fields.push('transaction_id = ?');
    params.push(updates.transaction_id);
  }
  
  if (fields.length === 0) return getPaymentById(id);

  fields.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  await db.run(
    `UPDATE payments SET ${fields.join(', ')} WHERE id = ?`,
    ...params
  );
  return getPaymentById(id);
}

async function refundPayment(id, { refund_amount, refund_reason }) {
  const db = getDb();
  
  // Lấy payment hiện tại để biết số tiền
  const payment = await getPaymentById(id);
  if (!payment) throw new Error('Thanh toán không tồn tại');

  const noteMsg = `[Refund] Số tiền: ${Number(refund_amount).toLocaleString('vi-VN')} ₫. Lý do: ${refund_reason}`;
  const newNotes = payment.notes ? `${payment.notes}\n${noteMsg}` : noteMsg;

  await db.run(
    `UPDATE payments 
     SET payment_status = 'refunded', 
         refund_reason = ?, 
         refunded_at = CURRENT_TIMESTAMP,
         notes = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    refund_reason,
    newNotes,
    id
  );

  return getPaymentById(id);
}

async function deletePayment(id) {
  const db = getDb();
  return db.run('DELETE FROM payments WHERE id = ?', id);
}

module.exports = {
  createPayment,
  getPaymentById,
  getPayments,
  getUserPayments,
  updatePayment,
  refundPayment,
  deletePayment
};