const customerModel = require('../models/customerModel');

/**
 * Trả về true nếu yêu cầu có thể truy cập dữ liệu booking này.
 * Admin/nhân viên luôn được phép; khách hàng chỉ nếu booking thuộc về họ.
 */
async function canAccessBooking(req, booking) {
  if (!booking) return false;
  if (req.user.role === 'admin' || req.user.role === 'staff') return true;
  if (req.user.role !== 'customer') return false;

  const customer = await customerModel.getCustomerById(booking.customer_id);
  if (!customer) return false;

  if (customer.user_id === req.user.id) return true;

  if (
    customer.email &&
    req.user.email &&
    customer.email.toLowerCase() === req.user.email.toLowerCase()
  ) {
    return true;
  }

  return false;
}

module.exports = { canAccessBooking };
