const { getDb } = require('../database/db');

async function addRoomImage(room_id, image_url) {
  const db = getDb();
  const result = await db.run(
    'INSERT INTO room_images (room_id, image_url) VALUES (?, ?)',
    room_id,
    image_url
  );
  return db.get('SELECT * FROM room_images WHERE id = ?', result.lastID);
}

async function getImagesByRoom(room_id) {
  const db = getDb();
  return db.all('SELECT * FROM room_images WHERE room_id = ?', room_id);
}

async function getImageById(id) {
  const db = getDb();
  return db.get('SELECT * FROM room_images WHERE id = ?', id);
}

async function deleteRoomImage(id) {
  const db = getDb();
  const image = await db.get('SELECT * FROM room_images WHERE id = ?', id);
  if (!image) return null;
  await db.run('DELETE FROM room_images WHERE id = ?', id);
  return image;
}

module.exports = { addRoomImage, getImagesByRoom, getImageById, deleteRoomImage };