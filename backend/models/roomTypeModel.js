const { getDb } = require('../database/db');

async function getAllRoomTypes() {
  const db = getDb();
  return db.all('SELECT * FROM room_types');
}

async function getRoomTypeById(id) {
  const db = getDb();
  return db.get('SELECT * FROM room_types WHERE id = ?', id);
}

async function createRoomType(roomType) {
  const db = getDb();
  const result = await db.run(
    'INSERT INTO room_types (name, description) VALUES (?, ?)',
    roomType.name,
    roomType.description
  );
  return getRoomTypeById(result.lastID);
}

async function updateRoomType(id, roomType) {
  const db = getDb();
  await db.run(
    'UPDATE room_types SET name = ?, description = ? WHERE id = ?',
    roomType.name,
    roomType.description,
    id
  );
  return getRoomTypeById(id);
}

async function deleteRoomType(id) {
  const db = getDb();
  return db.run('DELETE FROM room_types WHERE id = ?', id);
}

module.exports = {
  getAllRoomTypes,
  getRoomTypeById,
  createRoomType,
  updateRoomType,
  deleteRoomType,
};
