const { getDb } = require('../database/db');

async function getDashboard(req, res, next) {
  try {
    const db = getDb();
    const summary = await db.get(`
      SELECT
        (SELECT COUNT(*) FROM rooms) AS totalRooms,
        (SELECT COUNT(*) FROM rooms WHERE status = 'available') AS availableRooms,
        (SELECT COUNT(*) FROM rooms WHERE status IN ('occupied', 'booked')) AS busyRooms,
        (SELECT COUNT(*) FROM rooms WHERE status = 'occupied') AS occupiedRooms,
        (SELECT COUNT(*) FROM bookings) AS totalBookings,
        (SELECT COUNT(*) FROM customers) AS totalCustomers,
        (SELECT IFNULL(SUM(amount), 0) FROM payments WHERE DATE(payment_date) = DATE('now','localtime')) AS revenueToday,
        (SELECT IFNULL(SUM(amount), 0) FROM payments WHERE strftime('%Y-%m', payment_date) = strftime('%Y-%m', 'now','localtime')) AS revenueMonthPayments,
        (SELECT IFNULL(SUM(total_price), 0) FROM bookings WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m','now','localtime') AND status != 'cancelled') AS revenueMonthBookings
    `);

    summary.revenueMonth = Math.max(Number(summary.revenueMonthPayments || 0), Number(summary.revenueMonthBookings || 0));

    const roomStatus = await db.all(`SELECT status, COUNT(*) AS count FROM rooms GROUP BY status`);

    const recentBookings = await db.all(
      `SELECT bookings.id AS id,
              bookings.customer_id,
              bookings.room_id,
              bookings.check_in_date,
              bookings.check_out_date,
              bookings.total_price,
              bookings.status,
              bookings.created_at,
              customers.name AS customer_name,
              rooms.room_number AS room_number
       FROM bookings
       LEFT JOIN customers ON bookings.customer_id = customers.id
       LEFT JOIN rooms ON bookings.room_id = rooms.id
       ORDER BY bookings.created_at DESC LIMIT 12`
    );

    const recentCustomers = await db.all(`SELECT id, name, email, phone, created_at FROM customers ORDER BY datetime(created_at) DESC LIMIT 10`);

    const revenueByMonth = await db.all(
      `SELECT strftime('%Y-%m', datetime(created_at)) AS ym,
              IFNULL(SUM(total_price),0) AS amount
       FROM bookings
       WHERE status != 'cancelled'
       GROUP BY ym
       ORDER BY ym DESC
       LIMIT 12`
    );
    revenueByMonth.reverse();

    const bookingsByDay = await db.all(
      `SELECT date(created_at) AS day, COUNT(*) AS count
       FROM bookings
       WHERE date(created_at) >= date('now', '-21 days')
       GROUP BY date(created_at)
       ORDER BY day ASC`
    );

    const topRooms = await db.all(
      `SELECT rooms.id AS room_id,
              rooms.room_number,
              room_types.name AS room_type_name,
              COUNT(bookings.id) AS booking_count,
              IFNULL(SUM(bookings.total_price),0) AS revenue
       FROM bookings
       JOIN rooms ON rooms.id = bookings.room_id
       JOIN room_types ON room_types.id = rooms.room_type_id
       GROUP BY rooms.id
       ORDER BY booking_count DESC
       LIMIT 6`
    );

    const notificationBookings = await db.all(
      `SELECT bookings.id, bookings.created_at AS at, bookings.status,
              rooms.room_number, customers.name AS customer_name
       FROM bookings
       LEFT JOIN rooms ON bookings.room_id = rooms.id
       LEFT JOIN customers ON bookings.customer_id = customers.id
       WHERE bookings.status = 'pending'
       ORDER BY bookings.created_at DESC
       LIMIT 15`
    );

    const activityModel = require('../models/activityModel');
    let activityFeed = [];
    try {
      activityFeed = await activityModel.listActivity({ limit: 25 });
    } catch (_) {
      activityFeed = [];
    }

    const BOOKING_STATUS_VI = {
      pending: 'Chờ Xác Nhận',
      confirmed: 'Đã Xác Nhận',
      occupied: 'Đang Lưu Trú',
      completed: 'Hoàn Thành',
      cancelled: 'Đã Hủy',
    };

    const pieBookingsStatusRaw = await db.all(
      `SELECT status AS label, COUNT(*) AS count FROM bookings GROUP BY status`
    );
    const pieBookingsStatus = pieBookingsStatusRaw.map((p) => ({
      ...p,
      label: BOOKING_STATUS_VI[p.label] || p.label,
    }));

    res.json({
      summary,
      roomStatus,
      recentBookings,
      recentCustomers,
      revenueByMonth,
      bookingsByDay,
      topRooms,
      notifications: notificationBookings,
      activity: activityFeed,
      pieBookingsStatus,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getDashboard };
