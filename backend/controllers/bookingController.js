const bookingModel = require('../models/bookingModel');
const customerModel = require('../models/customerModel');
const userModel = require('../models/userModel');
const roomModel = require('../models/roomModel');
const paymentModel = require('../models/paymentModel');
const activityModel = require('../models/activityModel');
const { canAccessBooking } = require('../utils/bookingOwnership');
const { normalizePaymentStatus, isPaidStatus } = require('../utils/paymentBookingSync');

function stayNightsBetween(check_in_date, check_out_date) {
  const [y1, m1, d1] = String(check_in_date).split('-').map((x) => parseInt(x, 10));
  const [y2, m2, d2] = String(check_out_date).split('-').map((x) => parseInt(x, 10));
  const t1 = new Date(y1, m1 - 1, d1).getTime();
  const t2 = new Date(y2, m2 - 1, d2).getTime();
  if (Number.isNaN(t1) || Number.isNaN(t2) || t2 <= t1) return 1;
  return Math.round((t2 - t1) / 86400000);
}

async function logActivitySafe(actorId, action, detail, entity_type, entity_id) {
  try {
    await activityModel.logActivity({ actorId, action, detail, entity_type, entity_id });
  } catch (_) {
    /* ignore */
  }
}

async function syncRoomPayload(roomId, status) {
  const r = await roomModel.getRoomById(roomId);
  if (!r) return null;
  await roomModel.updateRoom(roomId, {
    room_number: r.room_number,
    room_type_id: r.room_type_id,
    price: r.price,
    capacity: r.capacity,
    status,
    description: r.description || '',
  });
  return r;
}

async function getBookings(req, res, next) {
  try {
    const { status, from, to, page, limit, search, customer_id } = req.query;
    const customerUserId = req.user?.role === 'customer' ? req.user.id : undefined;
    const result = await bookingModel.getBookings({
      status, from, to, customerUserId, customer_id, search, page, limit,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getBooking(req, res, next) {
  try {
    const booking = await bookingModel.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!(await canAccessBooking(req, booking))) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(booking);
  } catch (error) {
    next(error);
  }
}

async function resolveCustomerProfile(req) {
  const account = await userModel.findById(req.user.id);
  const displayName = account?.name || account?.email || req.user.email;

  let customer = await customerModel.getCustomerByUserId(req.user.id);
  if (customer) return customer;

  const byEmail = await customerModel.getCustomerByEmail(req.user.email);
  if (byEmail) {
    if (byEmail.user_id == null) {
      return customerModel.linkCustomerToUser(byEmail.id, req.user.id);
    }
    return byEmail;
  }

  return customerModel.createCustomer({
    name: displayName,
    email: req.user.email,
    phone: '',
    id_card: '',
    address: '',
    user_id: req.user.id,
  });
}

async function createBooking(req, res, next) {
  try {
    let customer_id = req.body.customer_id;
    const { room_id, check_in_date, check_out_date } = req.body;

    if (req.user?.role === 'customer') {
      const profile = await resolveCustomerProfile(req);
      customer_id = profile.id;
    }

    if (!customer_id) {
      return res.status(400).json({ message: 'Thông tin khách hàng không đầy đủ' });
    }

    const rid = Number(room_id);
    const room = await roomModel.getRoomById(rid);
    if (!room) return res.status(404).json({ message: 'Phòng không tồn tại' });
    if ((room.status || '').toLowerCase() === 'maintenance') {
      return res.status(400).json({ message: 'Phòng đang bảo trì, không nhận đặt' });
    }

    const overlap = await bookingModel.hasRoomBookingOverlap(rid, check_in_date, check_out_date);
    if (overlap) {
      return res.status(409).json({ message: 'Phòng đã có booking trong khoảng thời gian đã chọn' });
    }

    const nights = stayNightsBetween(check_in_date, check_out_date);
    const computedTotal = nights * Number(room.price || 0);

    const booking = await bookingModel.createBooking({
      customer_id,
      room_id: rid,
      check_in_date,
      check_out_date,
      status: req.user?.role === 'customer' ? 'pending' : req.body.status || 'pending',
      total_price: computedTotal,
    });

    if (req.user && ['admin', 'staff'].includes(req.user.role)) {
      await logActivitySafe(req.user.id, 'booking.created', `#${booking.id} phòng ${room.room_number}`, 'booking', booking.id);
    }

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
}

async function updateBooking(req, res, next) {
  try {
    const id = Number(req.params.id);
    const cur = await bookingModel.getBookingById(id);
    if (!cur) return res.status(404).json({ message: 'Booking not found' });

    const merged = {
      customer_id: req.body.customer_id !== undefined ? req.body.customer_id : cur.customer_id,
      room_id: req.body.room_id !== undefined ? Number(req.body.room_id) : cur.room_id,
      check_in_date: req.body.check_in_date ?? cur.check_in_date,
      check_out_date: req.body.check_out_date ?? cur.check_out_date,
      status: req.body.status ?? cur.status,
      total_price: req.body.total_price !== undefined ? Number(req.body.total_price) : Number(cur.total_price),
    };

    // Kiểm tra chồng lấn nếu phòng hoặc ngày tháng thay đổi
    const roomChanged = merged.room_id !== cur.room_id;
    const datesChanged = merged.check_in_date !== cur.check_in_date || merged.check_out_date !== cur.check_out_date;
    if ((roomChanged || datesChanged) && ['pending', 'confirmed', 'occupied'].includes(merged.status)) {
      const overlap = await bookingModel.hasRoomBookingOverlap(
        merged.room_id, merged.check_in_date, merged.check_out_date, id
      );
      if (overlap) {
        return res.status(409).json({ message: 'Phòng đã có booking trong khoảng thời gian đã chọn' });
      }
    }

    const booking = await bookingModel.updateBooking(id, merged);
    await logActivitySafe(req.user?.id, 'booking.updated', `#${id} · ${booking.status}`, 'booking', id);
    res.json(booking);
  } catch (error) {
    next(error);
  }
}

async function checkInBooking(req, res, next) {
  try {
    const id = Number(req.params.id);
    const cur = await bookingModel.getBookingById(id);
    if (!cur) return res.status(404).json({ message: 'Không tìm thấy booking' });

    const s = String(cur.status || '').toLowerCase();
    if (!['pending', 'confirmed'].includes(s)) {
      return res.status(400).json({ message: 'Booking không trong trạng thái cho phép check-in' });
    }

    const booking = await bookingModel.updateBooking(id, {
      customer_id: cur.customer_id, room_id: cur.room_id,
      check_in_date: cur.check_in_date, check_out_date: cur.check_out_date,
      status: 'occupied', total_price: Number(cur.total_price || 0),
    });
    await syncRoomPayload(booking.room_id, 'occupied');
    await logActivitySafe(req.user?.id, 'booking.check_in', `#${id} · phòng ${booking.room_number}`, 'booking', id);
    res.json(booking);
  } catch (error) {
    next(error);
  }
}

async function checkOutBooking(req, res, next) {
  try {
    const id = Number(req.params.id);
    const cur = await bookingModel.getBookingById(id);
    if (!cur) return res.status(404).json({ message: 'Không tìm thấy booking' });

    if (String(cur.status || '').toLowerCase() !== 'occupied') {
      return res.status(400).json({ message: 'Chỉ check-out được khi khách đang ở (occupied)' });
    }

    const booking = await bookingModel.updateBooking(id, {
      customer_id: cur.customer_id, room_id: cur.room_id,
      check_in_date: cur.check_in_date, check_out_date: cur.check_out_date,
      status: 'completed', total_price: Number(cur.total_price || 0),
    });
    await syncRoomPayload(booking.room_id, 'available');
    await logActivitySafe(req.user?.id, 'booking.check_out', `#${id} · đã hoàn thành`, 'booking', id);
    res.json(booking);
  } catch (error) {
    next(error);
  }
}

async function cancelBookingAdmin(req, res, next) {
  try {
    const id = Number(req.params.id);
    const cur = await bookingModel.getBookingById(id);
    if (!cur) return res.status(404).json({ message: 'Không tìm thấy booking' });
    const s = String(cur.status || '').toLowerCase();
    if (['completed', 'cancelled'].includes(s)) {
      return res.status(400).json({ message: 'Booking đã đóng, không thể hủy' });
    }

    const booking = await bookingModel.updateBooking(id, {
      customer_id: cur.customer_id, room_id: cur.room_id,
      check_in_date: cur.check_in_date, check_out_date: cur.check_out_date,
      status: 'cancelled', total_price: Number(cur.total_price || 0),
    });

    if (s === 'occupied') {
      await syncRoomPayload(booking.room_id, 'available');
    }

    await logActivitySafe(req.user?.id, 'booking.cancelled', `#${id}`, 'booking', id);
    res.json(booking);
  } catch (error) {
    next(error);
  }
}

async function deleteBooking(req, res, next) {
  try {
    const id = Number(req.params.id);
    const cur = await bookingModel.getBookingById(id);

    // Đồng bộ trạng thái phòng nếu booking đang chiếm dụng
    if (cur && String(cur.status || '').toLowerCase() === 'occupied') {
      await syncRoomPayload(cur.room_id, 'available');
    }

    await bookingModel.deleteBooking(id);
    await logActivitySafe(req.user?.id, 'booking.deleted', cur ? `#${id}` : `#${req.params.id}`, 'booking', id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function createDraftBooking(req, res, next) {
  try {
    let customer_id = req.body.customer_id;
    const { room_id, check_in_date, check_out_date } = req.body;

    if (req.user?.role === 'customer') {
      const profile = await resolveCustomerProfile(req);
      customer_id = profile.id;
    }

    if (!customer_id) {
      return res.status(400).json({ message: 'Thông tin khách hàng không đầy đủ' });
    }

    const rid = Number(room_id);
    const room = await roomModel.getRoomById(rid);
    if (!room) return res.status(404).json({ message: 'Phòng không tồn tại' });
    if ((room.status || '').toLowerCase() === 'maintenance') {
      return res.status(400).json({ message: 'Phòng đang bảo trì, không nhận đặt' });
    }

    const overlap = await bookingModel.hasRoomBookingOverlap(rid, check_in_date, check_out_date);
    if (overlap) {
      return res.status(409).json({ message: 'Phòng đã có booking trong khoảng thời gian đã chọn' });
    }

    const nights = stayNightsBetween(check_in_date, check_out_date);
    const computedTotal = nights * Number(room.price || 0);

    const booking = await bookingModel.createDraftBooking({
      customer_id,
      room_id: rid,
      check_in_date,
      check_out_date,
      total_price: computedTotal,
    });

    await logActivitySafe(req.user?.id, 'booking.draft_created', `#${booking.id} phòng ${room.room_number}`, 'booking', booking.id);

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
}

async function getBookingSummary(req, res, next) {
  try {
    const id = Number(req.params.id);
    const booking = await bookingModel.getBookingSummary(id);
    if (!booking) return res.status(404).json({ message: 'Booking không tìm thấy' });

    if (!(await canAccessBooking(req, booking))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
}

async function addBookingService(req, res, next) {
  try {
    const bookingId = Number(req.params.id);
    const { service_id, quantity } = req.body;

    const booking = await bookingModel.getBookingById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking không tìm thấy' });

    if (!(await canAccessBooking(req, booking))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (booking.status !== 'draft') {
      return res.status(400).json({ message: 'Chỉ có thể thêm dịch vụ cho booking ở trạng thái draft' });
    }

    await bookingModel.addBookingService(bookingId, service_id, quantity || 1);
    const updated = await bookingModel.getBookingSummary(bookingId);

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function removeBookingService(req, res, next) {
  try {
    const bookingId = Number(req.params.bookingId);
    const serviceId = Number(req.params.serviceId);

    const booking = await bookingModel.getBookingById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking không tìm thấy' });

    if (!(await canAccessBooking(req, booking))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (booking.status !== 'draft') {
      return res.status(400).json({ message: 'Chỉ có thể xóa dịch vụ từ booking ở trạng thái draft' });
    }

    await bookingModel.removeBookingService(serviceId);
    const updated = await bookingModel.getBookingSummary(bookingId);

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function confirmBookingPayment(req, res, next) {
  try {
    const bookingId = Number(req.params.id);
    const { payment_id, discount_amount, tax_amount, payment_method } = req.body;

    const booking = await bookingModel.getBookingById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking không tìm thấy' });

    if (!(await canAccessBooking(req, booking))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (booking.status !== 'draft') {
      return res.status(400).json({ message: 'Booking không ở trạng thái draft' });
    }

    const paymentMethod = String(payment_method || '').toLowerCase();
    let newStatus = 'pending_payment';
    if (paymentMethod === 'cash') {
      newStatus = 'confirmed';
    } else if (paymentMethod === 'bank_transfer') {
      newStatus = 'pending_confirmation';
    }

    await bookingModel.updateBookingPayment(bookingId, payment_id, discount_amount || 0, tax_amount || 0);
    const updated = await bookingModel.updateBookingStatus(bookingId, newStatus);

    await logActivitySafe(req.user?.id, 'booking.payment_confirmed', `#${bookingId} · ${newStatus}`, 'booking', bookingId);

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /bookings/complete
 * Atomic endpoint: tạo booking + payment trong 1 request duy nhất.
 * Chỉ gọi khi user xác nhận thanh toán ở bước cuối cùng.
 * Trước bước này, mọi dữ liệu chỉ tồn tại trong React state.
 */
async function completeBooking(req, res, next) {
  try {
    const { room_id, check_in_date, check_out_date, payment_method, services } = req.body;

    // 1. Resolve customer profile
    let customer_id = req.body.customer_id;
    if (req.user?.role === 'customer') {
      const profile = await resolveCustomerProfile(req);
      customer_id = profile.id;
    }
    if (!customer_id) {
      return res.status(400).json({ message: 'Thông tin khách hàng không đầy đủ' });
    }

    // 2. Validate room
    const rid = Number(room_id);
    const room = await roomModel.getRoomById(rid);
    if (!room) return res.status(404).json({ message: 'Phòng không tồn tại' });
    if ((room.status || '').toLowerCase() === 'maintenance') {
      return res.status(400).json({ message: 'Phòng đang bảo trì, không nhận đặt' });
    }

    // 3. Check overlap
    const overlap = await bookingModel.hasRoomBookingOverlap(rid, check_in_date, check_out_date);
    if (overlap) {
      return res.status(409).json({ message: 'Phòng đã có booking trong khoảng thời gian đã chọn' });
    }

    // 4. Calculate total price (room)
    const nights = stayNightsBetween(check_in_date, check_out_date);
    const roomTotal = nights * Number(room.price || 0);

    // 5. Determine booking status based on payment method
    let bookingStatus = 'pending';
    if (payment_method === 'cash') {
      bookingStatus = 'confirmed';
    }

    // 6. Create booking
    const booking = await bookingModel.createBooking({
      customer_id,
      room_id: rid,
      check_in_date,
      check_out_date,
      status: bookingStatus,
      total_price: roomTotal,
    });

    // 7. Add services if any
    let serviceTotal = 0;
    if (Array.isArray(services) && services.length > 0) {
      for (const svc of services) {
        try {
          await bookingModel.addBookingService(booking.id, svc.service_id, svc.quantity || 1);
        } catch (_) {
          // skip invalid service
        }
      }
      // Recalculate service total
      const addedServices = await bookingModel.getBookingServices(booking.id);
      serviceTotal = addedServices.reduce((sum, s) => sum + (s.total_price || 0), 0);
    }

    // 8. Calculate payment amount (room + services + tax)
    const subtotal = roomTotal + serviceTotal;
    const taxAmount = subtotal * 0.1;
    const paymentAmount = subtotal + taxAmount;

    // 9. Generate transaction ID
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let txRand = '';
    for (let i = 0; i < 8; i++) txRand += chars.charAt(Math.floor(Math.random() * chars.length));
    const transactionId = `AUR-${Date.now()}-${txRand}`;

    // 10. Determine payment status
    let paymentStatus = 'pending';
    if (payment_method !== 'cash' && payment_method !== 'bank_transfer') {
      paymentStatus = 'processing';
    }

    // 11. Create payment
    const payment = await paymentModel.createPayment({
      booking_id: booking.id,
      user_id: req.user?.id || null,
      amount: paymentAmount,
      payment_method,
      payment_status: paymentStatus,
      transaction_id: transactionId,
      notes: `Thanh toán qua ${payment_method === 'cash' ? 'quầy lễ tân' : payment_method === 'bank_transfer' ? 'chuyển khoản' : payment_method}`,
    });

    // 12. Link payment to booking
    await bookingModel.updateBookingPayment(booking.id, payment.id, 0, taxAmount);

    // 13. Log activity
    await logActivitySafe(
      req.user?.id,
      'booking.completed',
      `#${booking.id} phòng ${room.room_number} · ${payment_method}`,
      'booking',
      booking.id
    );

    // 14. Return complete info
    const finalBooking = await bookingModel.getBookingById(booking.id);
    res.status(201).json({
      booking: finalBooking,
      payment,
      serviceTotal,
      taxAmount,
      paymentAmount,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBookings, getBooking, createBooking, updateBooking,
  checkInBooking, checkOutBooking, cancelBookingAdmin, deleteBooking,
  createDraftBooking, getBookingSummary, addBookingService, removeBookingService, confirmBookingPayment,
  completeBooking,
};
