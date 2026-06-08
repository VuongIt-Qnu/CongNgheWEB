const paymentModel = require('../models/paymentModel');
const bookingModel = require('../models/bookingModel');
const {
  normalizePaymentStatus,
  isPaidStatus,
  isActivePaymentStatus,
  applyBookingAfterPaymentCreate,
  applyBookingAfterPaymentApproved,
} = require('../utils/paymentBookingSync');

function generateTxId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rand = '';
  for (let i = 0; i < 8; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AUR-${Date.now()}-${rand}`;
}

function isStaffOrAdmin(user) {
  return user?.role === 'admin' || user?.role === 'staff';
}

async function createPayment(req, res, next) {
  try {
    const { booking_id, amount, payment_method, notes } = req.body;
    const isAdmin = isStaffOrAdmin(req.user);

    const booking = await bookingModel.getBookingById(booking_id);
    if (!booking) {
      return res.status(404).json({ message: 'Đặt phòng không tồn tại' });
    }

    const prevPayments = await paymentModel.getPayments({ booking_id, limit: 100 });
    const hasPaid = prevPayments.payments.some((p) => isPaidStatus(p.payment_status));
    if (hasPaid) {
      return res.status(400).json({ message: 'Đặt phòng này đã được thanh toán thành công trước đó' });
    }

    const hasActive = prevPayments.payments.some((p) => isActivePaymentStatus(p.payment_status));
    if (hasActive) {
      return res.status(400).json({ message: 'Đặt phòng này đang có giao dịch thanh toán chờ xác nhận' });
    }

    // Khách hàng không được tự đặt trạng thái paid — luôn pending/processing
    let normalizedStatus = 'pending';
    if (isAdmin && req.body.payment_status) {
      normalizedStatus = normalizePaymentStatus(req.body.payment_status);
    } else if (payment_method !== 'cash' && payment_method !== 'bank_transfer') {
      // Online: đã gửi yêu cầu, chờ xác nhận
      normalizedStatus = 'processing';
    }

    const transaction_id = req.body.transaction_id || generateTxId();

    const payment = await paymentModel.createPayment({
      booking_id,
      user_id: req.user?.id || booking.user_id || null,
      amount,
      payment_method,
      payment_status: normalizedStatus,
      transaction_id,
      notes,
    });

    await applyBookingAfterPaymentCreate(booking, payment_method, normalizedStatus);

    const updatedBooking = await bookingModel.getBookingById(booking_id);

    res.status(201).json({
      ...payment,
      booking_status: updatedBooking?.status || booking.status,
    });
  } catch (error) {
    next(error);
  }
}

async function getPayments(req, res, next) {
  try {
    const { booking_id, payment_status, payment_method, search, page, limit } = req.query;
    const result = await paymentModel.getPayments({
      booking_id,
      payment_status,
      payment_method,
      search,
      page,
      limit,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getPaymentById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const payment = await paymentModel.getPaymentById(id);
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    }
    res.json(payment);
  } catch (error) {
    next(error);
  }
}

async function updatePayment(req, res, next) {
  try {
    const id = Number(req.params.id);
    const payment = await paymentModel.getPaymentById(id);
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    }

    const { payment_status, payment_method, notes, transaction_id } = req.body;
    const normalizedStatus = payment_status ? normalizePaymentStatus(payment_status) : undefined;

    const updated = await paymentModel.updatePayment(id, {
      payment_status: normalizedStatus,
      payment_method,
      notes,
      transaction_id,
    });

    if (normalizedStatus === 'paid') {
      await applyBookingAfterPaymentApproved(updated.booking_id);
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function approvePayment(req, res, next) {
  try {
    const id = Number(req.params.id);
    const payment = await paymentModel.getPaymentById(id);
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    }

    const currentStatus = normalizePaymentStatus(payment.payment_status);
    if (!['pending', 'processing'].includes(currentStatus)) {
      return res.status(400).json({ message: 'Chỉ có thể xác nhận giao dịch đang chờ xử lý' });
    }

    const updated = await paymentModel.updatePayment(id, {
      payment_status: 'paid',
      notes: payment.notes
        ? `${payment.notes}\n[Xác nhận] Admin xác nhận thanh toán lúc ${new Date().toISOString()}`
        : `[Xác nhận] Admin xác nhận thanh toán lúc ${new Date().toISOString()}`,
    });

    await applyBookingAfterPaymentApproved(updated.booking_id);

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function rejectPayment(req, res, next) {
  try {
    const id = Number(req.params.id);
    const payment = await paymentModel.getPaymentById(id);
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    }

    const currentStatus = normalizePaymentStatus(payment.payment_status);
    if (!['pending', 'processing'].includes(currentStatus)) {
      return res.status(400).json({ message: 'Chỉ có thể từ chối giao dịch đang chờ xử lý' });
    }

    const { reason } = req.body;
    const rejectReason = reason || 'Giao dịch không hợp lệ hoặc chưa nhận được tiền';

    const updated = await paymentModel.updatePayment(id, {
      payment_status: 'failed',
      notes: payment.notes
        ? `${payment.notes}\n[Từ chối] ${rejectReason}`
        : `[Từ chối] ${rejectReason}`,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function refundPayment(req, res, next) {
  try {
    const id = Number(req.params.id);
    const payment = await paymentModel.getPaymentById(id);
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    }

    const { amount, reason } = req.body;
    const refundAmount = amount !== undefined ? Number(amount) : payment.amount;
    const refundReason = reason || 'Yêu cầu từ khách hàng';

    if (refundAmount <= 0) {
      return res.status(400).json({ message: 'Số tiền hoàn trả phải lớn hơn 0' });
    }
    if (refundAmount > payment.amount) {
      return res.status(400).json({ message: 'Số tiền hoàn trả không thể lớn hơn số tiền thanh toán ban đầu' });
    }

    const updated = await paymentModel.refundPayment(id, {
      refund_amount: refundAmount,
      refund_reason: refundReason,
    });

    if (refundAmount === payment.amount) {
      const booking = await bookingModel.getBookingById(payment.booking_id);
      if (booking && ['pending', 'confirmed'].includes(booking.status)) {
        await bookingModel.updateBooking(payment.booking_id, {
          customer_id: booking.customer_id,
          room_id: booking.room_id,
          check_in_date: booking.check_in_date,
          check_out_date: booking.check_out_date,
          status: 'cancelled',
          total_price: booking.total_price,
        });
      }
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function deletePayment(req, res, next) {
  try {
    const id = Number(req.params.id);
    const payment = await paymentModel.getPaymentById(id);
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    }
    await paymentModel.deletePayment(id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function getUserPayments(req, res, next) {
  try {
    const payments = await paymentModel.getUserPayments(req.user.id);
    res.json(payments);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  approvePayment,
  rejectPayment,
  refundPayment,
  deletePayment,
  getUserPayments,
};
