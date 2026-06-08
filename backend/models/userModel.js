const { getDb } = require('../database/db');

const ALLOWED_ROLES = ['admin', 'staff', 'customer'];
const SAFE_COLUMNS = 'id, name, email, role, created_at, IFNULL(is_active, 1) AS is_active, IFNULL(phone, \'\') AS phone, IFNULL(address, \'\') AS address, IFNULL(avatar_url, \'\') AS avatar_url';

/** Trả về người dùng KHÔNG có mật khẩu — sử dụng cho các phản hồi API */
async function findById(id) {
  const db = getDb();
  return db.get(`SELECT ${SAFE_COLUMNS} FROM users WHERE id = ?`, id);
}

/** Trả về người dùng CÙNG với hash mật khẩu — chỉ sử dụng cho xác thực */
async function findByEmailWithPassword(email) {
  const db = getDb();
  return db.get('SELECT * FROM users WHERE email = ?', email);
}

/** Trả về người dùng KHÔNG có mật khẩu — sử dụng để kiểm tra trùng lặp, v.v. */
async function findByEmail(email) {
  const db = getDb();
  return db.get(`SELECT ${SAFE_COLUMNS} FROM users WHERE email = ?`, email);
}

async function createUser({ name, email, password, role = 'customer' }) {
  const normalizedRole = ALLOWED_ROLES.includes(role) ? role : 'customer';
  const db = getDb();
  const result = await db.run(
    'INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
    name,
    email,
    password,
    normalizedRole,
    1
  );
  return findById(result.lastID);
}

async function getUsers({ search, page = 1, limit = 20 }) {
  const db = getDb();
  const filters = ['1 = 1'];
  const params = [];

  if (search) {
    filters.push('(name LIKE ? OR email LIKE ? OR role LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const where = filters.join(' AND ');
  const offset = (Number(page) - 1) * Number(limit);

  const users = await db.all(
    `SELECT ${SAFE_COLUMNS}
     FROM users WHERE ${where}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    ...params,
    Number(limit),
    offset
  );
  const countRow = await db.get(`SELECT COUNT(*) AS total FROM users WHERE ${where}`, ...params);

  return { users, total: countRow.total, page: Number(page), limit: Number(limit) };
}

async function updateUser(id, user) {
  const db = getDb();
  const existingUser = await db.get('SELECT * FROM users WHERE id = ?', id);
  if (!existingUser) {
    return null;
  }

  const password = user.password || existingUser.password;
  const name = user.name !== undefined ? user.name : existingUser.name;
  const email = user.email !== undefined ? user.email : existingUser.email;
  const role = ALLOWED_ROLES.includes(user.role) ? user.role : existingUser.role;
  const phone = user.phone !== undefined ? user.phone : (existingUser.phone || '');
  const address = user.address !== undefined ? user.address : (existingUser.address || '');
  const avatar_url = user.avatar_url !== undefined ? user.avatar_url : (existingUser.avatar_url || '');
  const prevActive =
    existingUser.is_active !== undefined && existingUser.is_active !== null
      ? Number(existingUser.is_active)
      : 1;
  let isActive = prevActive;
  if (user.is_active !== undefined) {
    isActive = user.is_active === true || Number(user.is_active) === 1 ? 1 : 0;
  }

  await db.run(
    'UPDATE users SET name = ?, email = ?, password = ?, role = ?, is_active = ?, phone = ?, address = ?, avatar_url = ? WHERE id = ?',
    name,
    email,
    password,
    role,
    isActive,
    phone,
    address,
    avatar_url,
    id
  );
  return findById(id);
}

async function deleteUser(id) {
  const db = getDb();
  return db.run('DELETE FROM users WHERE id = ?', id);
}

module.exports = {
  findByEmail,
  findByEmailWithPassword,
  findById,
  createUser,
  getUsers,
  updateUser,
  deleteUser,
};
