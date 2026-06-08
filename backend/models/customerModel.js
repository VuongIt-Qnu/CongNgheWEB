const { getDb } = require('../database/db');

async function getCustomers({ search, page = 1, limit = 20 }) {
  const db = getDb();
  const filters = ['1 = 1'];
  const params = [];

  if (search) {
    filters.push('(name LIKE ? OR email LIKE ? OR phone LIKE ? OR id_card LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  const where = filters.join(' AND ');
  const offset = (Number(page) - 1) * Number(limit);

  const customers = await db.all(
    `SELECT * FROM customers WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    ...params,
    Number(limit),
    offset
  );

  const countRow = await db.get(`SELECT COUNT(*) AS total FROM customers WHERE ${where}`, ...params);
  return { customers, total: countRow.total, page: Number(page), limit: Number(limit) };
}

async function getCustomerById(id) {
  const db = getDb();
  return db.get('SELECT * FROM customers WHERE id = ?', id);
}

async function getCustomerByEmail(email) {
  const db = getDb();
  return db.get('SELECT * FROM customers WHERE email = ?', email);
}

async function getCustomerByUserId(userId) {
  const db = getDb();
  return db.get('SELECT * FROM customers WHERE user_id = ?', userId);
}

async function createCustomer(customer) {
  const db = getDb();
  const hasUserId = customer.user_id != null && customer.user_id !== '';
  const result = hasUserId
    ? await db.run(
        `INSERT INTO customers (name, phone, email, id_card, address, user_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        customer.name,
        customer.phone,
        customer.email,
        customer.id_card,
        customer.address,
        customer.user_id
      )
    : await db.run(
        `INSERT INTO customers (name, phone, email, id_card, address)
         VALUES (?, ?, ?, ?, ?)`,
        customer.name,
        customer.phone,
        customer.email,
        customer.id_card,
        customer.address
      );
  return getCustomerById(result.lastID);
}

async function linkCustomerToUser(customerId, userId) {
  const db = getDb();
  await db.run('UPDATE customers SET user_id = ? WHERE id = ?', userId, customerId);
  return getCustomerById(customerId);
}

async function unlinkCustomersByUserId(userId) {
  const db = getDb();
  await db.run('UPDATE customers SET user_id = NULL WHERE user_id = ?', userId);
}

async function hasActiveBookings(customerId) {
  const db = getDb();
  const row = await db.get(
    `SELECT COUNT(*) AS c FROM bookings WHERE customer_id = ? AND status IN ('pending', 'confirmed', 'occupied')`,
    customerId
  );
  return Number(row?.c || 0) > 0;
}

async function updateCustomer(id, customer) {
  const db = getDb();
  await db.run(
    `UPDATE customers SET name = ?, phone = ?, email = ?, id_card = ?, address = ? WHERE id = ?`,
    customer.name,
    customer.phone,
    customer.email,
    customer.id_card,
    customer.address,
    id
  );
  return getCustomerById(id);
}

async function deleteCustomer(id) {
  const db = getDb();
  return db.run('DELETE FROM customers WHERE id = ?', id);
}

module.exports = {
  getCustomers,
  getCustomerById,
  getCustomerByEmail,
  getCustomerByUserId,
  createCustomer,
  linkCustomerToUser,
  unlinkCustomersByUserId,
  hasActiveBookings,
  updateCustomer,
  deleteCustomer,
};
