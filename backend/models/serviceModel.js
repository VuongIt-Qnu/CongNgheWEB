const { getDb } = require('../database/db');

async function getAllServices({ search, page = 1, limit = 20 } = {}) {
  const db = getDb();
  const filters = ['1 = 1'];
  const params = [];

  if (search) {
    filters.push('(name LIKE ? OR description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = filters.join(' AND ');
  const offset = (Number(page) - 1) * Number(limit);

  const services = await db.all(
    `SELECT * FROM services WHERE ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    ...params,
    Number(limit),
    offset
  );

  const countRow = await db.get(`SELECT COUNT(*) AS total FROM services WHERE ${where}`, ...params);
  return { services, total: countRow.total, page: Number(page), limit: Number(limit) };
}

async function getServiceById(id) {
  const db = getDb();
  return db.get('SELECT * FROM services WHERE id = ?', id);
}

async function createService(service) {
  const db = getDb();
  const result = await db.run(
    `INSERT INTO services (name, price, description) VALUES (?, ?, ?)`,
    service.name,
    service.price,
    service.description
  );
  return getServiceById(result.lastID);
}

async function updateService(id, service) {
  const db = getDb();
  await db.run(
    `UPDATE services SET name = ?, price = ?, description = ? WHERE id = ?`,
    service.name,
    service.price,
    service.description,
    id
  );
  return getServiceById(id);
}

async function deleteService(id) {
  const db = getDb();
  return db.run('DELETE FROM services WHERE id = ?', id);
}

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
