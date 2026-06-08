const { getDb } = require('../database/db');

async function logActivity({ actorId, action, detail, entity_type, entity_id }) {
  const db = getDb();
  await db.run(
    `INSERT INTO activity_logs (actor_id, action, detail, entity_type, entity_id) VALUES (?,?,?,?,?)`,
    actorId ?? null,
    action,
    detail ?? null,
    entity_type ?? null,
    entity_id ?? null
  );
}

async function listActivity({ limit = 30 } = {}) {
  const db = getDb();
  return db.all(
    `SELECT al.*, users.name AS actor_name, users.email AS actor_email
     FROM activity_logs al
     LEFT JOIN users ON users.id = al.actor_id
     ORDER BY al.created_at DESC
     LIMIT ?`,
    Number(limit)
  );
}

async function listActivityPaged({ page = 1, limit = 20 } = {}) {
  const db = getDb();
  const offset = (Number(page) - 1) * Number(limit);
  const activities = await db.all(
    `SELECT al.*, users.name AS actor_name, users.email AS actor_email
     FROM activity_logs al
     LEFT JOIN users ON users.id = al.actor_id
     ORDER BY al.created_at DESC
     LIMIT ? OFFSET ?`,
    Number(limit),
    offset
  );
  const countRow = await db.get(`SELECT COUNT(*) AS total FROM activity_logs`);
  return { activities, total: countRow.total, page: Number(page), limit: Number(limit) };
}

module.exports = { logActivity, listActivity, listActivityPaged };
