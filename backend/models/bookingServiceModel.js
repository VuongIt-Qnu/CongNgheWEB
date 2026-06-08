const { getDb } = require('../database/db');

async function addBookingService(service) {
  const db = getDb();
  const result = await db.run(
    `INSERT INTO booking_services (booking_id, service_id, quantity, total_price)
     VALUES (?, ?, ?, ?)`,
    service.booking_id,
    service.service_id,
    service.quantity || 1,
    service.total_price || 0
  );
  return db.get('SELECT * FROM booking_services WHERE id = ?', result.lastID);
}

async function getServicesByBooking(bookingId) {
  const db = getDb();
  return db.all(
    `SELECT bs.*, s.name as service_name, s.price as service_price
     FROM booking_services bs
     JOIN services s ON bs.service_id = s.id
     WHERE bs.booking_id = ?`,
    bookingId
  );
}

module.exports = { addBookingService, getServicesByBooking };