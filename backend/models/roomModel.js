const { getDb } = require('../database/db');

const ROOM_SELECT = `rooms.*,
    room_types.name AS room_type_name,
    (SELECT ri.image_url FROM room_images ri WHERE ri.room_id = rooms.id ORDER BY ri.id ASC LIMIT 1) AS cover_image_url,
    (SELECT COUNT(*) FROM bookings b WHERE b.room_id = rooms.id AND date(b.created_at) = date('now')) AS bookings_today,
    (SELECT COUNT(*) FROM rooms r2 WHERE r2.room_type_id = rooms.room_type_id AND r2.status = 'available') AS rooms_available_same_type,
    COALESCE((SELECT ROUND(AVG(rv.rating), 2) FROM reviews rv WHERE rv.room_id = rooms.id AND COALESCE(rv.is_hidden, 0) = 0), 0) AS avg_rating,
    (SELECT COUNT(*) FROM reviews rv2 WHERE rv2.room_id = rooms.id AND COALESCE(rv2.is_hidden, 0) = 0) AS review_count`;

/** @param {string[]} filters @param {any[]} params @param {Record<string, any>} q */
function appendListingFilters(filters, params, q) {
  const { search, type, types, status, min_price, max_price, min_capacity, min_rating } = q || {};

  if (search) {
    filters.push('(rooms.room_number LIKE ? OR IFNULL(rooms.description, "") LIKE ? OR room_types.name LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (type) {
    filters.push('rooms.room_type_id = ?');
    params.push(type);
  }

  if (types) {
    const ids = String(types)
      .split(',')
      .map((x) => Number(x.trim()))
      .filter((n) => !Number.isNaN(n) && n > 0);
    if (ids.length) {
      filters.push(`rooms.room_type_id IN (${ids.map(() => '?').join(',')})`);
      params.push(...ids);
    }
  }

  if (status) {
    filters.push('rooms.status = ?');
    params.push(status);
  }

  if (min_price !== undefined && min_price !== '' && !Number.isNaN(Number(min_price))) {
    filters.push('rooms.price >= ?');
    params.push(Number(min_price));
  }

  if (max_price !== undefined && max_price !== '' && !Number.isNaN(Number(max_price))) {
    filters.push('rooms.price <= ?');
    params.push(Number(max_price));
  }

  if (min_capacity !== undefined && min_capacity !== '' && !Number.isNaN(Number(min_capacity))) {
    filters.push('rooms.capacity >= ?');
    params.push(Number(min_capacity));
  }

  if (min_rating !== undefined && min_rating !== '' && !Number.isNaN(Number(min_rating))) {
    filters.push('COALESCE((SELECT AVG(rv.rating) FROM reviews rv WHERE rv.room_id = rooms.id AND COALESCE(rv.is_hidden, 0) = 0), 0) >= ?');
    params.push(Number(min_rating));
  }
}

async function getRooms(query) {
  const { page = 1, limit = 20 } = query;
  const db = getDb();
  const filters = ['1 = 1'];
  const params = [];
  appendListingFilters(filters, params, query);

  const where = filters.join(' AND ');
  const offset = (Number(page) - 1) * Number(limit);

  const rooms = await db.all(
    `SELECT ${ROOM_SELECT}
     FROM rooms
     JOIN room_types ON rooms.room_type_id = room_types.id
     WHERE ${where}
     ORDER BY rooms.price ASC, rooms.id DESC
     LIMIT ? OFFSET ?`,
    ...params,
    Number(limit),
    offset
  );

  const countRow = await db.get(
    `SELECT COUNT(*) AS total FROM rooms JOIN room_types ON rooms.room_type_id = room_types.id WHERE ${where}`,
    ...params
  );

  return { rooms, total: countRow.total, page: Number(page), limit: Number(limit) };
}

async function getAvailableRooms(query) {
  const { check_in_date, check_out_date, page = 1, limit = 20 } = query;
  const db = getDb();
  const filters = ['1 = 1'];
  const params = [];
  appendListingFilters(filters, params, query);

  const whereExtra = filters.join(' AND ');
  const offset = (Number(page) - 1) * Number(limit);

  const rooms = await db.all(
    `SELECT ${ROOM_SELECT}
     FROM rooms
     JOIN room_types ON rooms.room_type_id = room_types.id
     WHERE rooms.status != 'maintenance'
       AND ${whereExtra}
       AND rooms.id NOT IN (
         SELECT room_id FROM bookings
         WHERE status IN ('pending', 'confirmed', 'occupied')
           AND NOT (? >= check_out_date OR ? <= check_in_date)
       )
     ORDER BY rooms.price ASC, rooms.id DESC
     LIMIT ? OFFSET ?`,
    ...params,
    check_in_date,
    check_out_date,
    Number(limit),
    offset
  );

  const countRow = await db.get(
    `SELECT COUNT(*) AS total
     FROM rooms
     JOIN room_types ON rooms.room_type_id = room_types.id
     WHERE rooms.status != 'maintenance'
       AND ${whereExtra}
       AND rooms.id NOT IN (
         SELECT room_id FROM bookings
         WHERE status IN ('pending', 'confirmed', 'occupied')
           AND NOT (? >= check_out_date OR ? <= check_in_date)
       )`,
    ...params,
    check_in_date,
    check_out_date
  );

  return { rooms, total: countRow.total, page: Number(page), limit: Number(limit) };
}

async function getRoomById(id) {
  const db = getDb();
  return db.get(
    `SELECT ${ROOM_SELECT}
     FROM rooms
     JOIN room_types ON rooms.room_type_id = room_types.id
     WHERE rooms.id = ?`,
    id
  );
}

async function createRoom(room) {
  const db = getDb();
  const result = await db.run(
    `INSERT INTO rooms (room_number, room_type_id, price, capacity, status, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    room.room_number,
    room.room_type_id,
    room.price,
    room.capacity,
    room.status || 'available',
    room.description || null
  );
  return getRoomById(result.lastID);
}

async function updateRoom(id, room) {
  const db = getDb();
  await db.run(
    `UPDATE rooms SET room_number = ?, room_type_id = ?, price = ?, capacity = ?, status = ?, description = ? WHERE id = ?`,
    room.room_number,
    room.room_type_id,
    room.price,
    room.capacity,
    room.status,
    room.description,
    id
  );
  return getRoomById(id);
}

async function hasActiveBookings(roomId) {
  const db = getDb();
  const row = await db.get(
    `SELECT COUNT(*) AS c FROM bookings WHERE room_id = ? AND status IN ('pending', 'confirmed', 'occupied')`,
    roomId
  );
  return Number(row?.c || 0) > 0;
}

async function deleteRoom(id) {
  const db = getDb();
  return db.run('DELETE FROM rooms WHERE id = ?', id);
}

module.exports = {
  getRooms,
  getAvailableRooms,
  getRoomById,
  createRoom,
  updateRoom,
  hasActiveBookings,
  deleteRoom,
};
