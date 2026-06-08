const bookingServiceModel = require('../models/bookingServiceModel');
const bookingModel = require('../models/bookingModel');
const { canAccessBooking } = require('../utils/bookingOwnership');

async function addBookingService(req, res, next) {
  try {
    const booking_id = Number(req.params.id) || req.body.booking_id;
    const { service_id, quantity, total_price } = req.body;

    if (!booking_id || !service_id) {
      return res.status(400).json({ message: 'Booking và dịch vụ là bắt buộc' });
    }

    const booking = await bookingModel.getBookingById(booking_id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!(await canAccessBooking(req, booking))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const serviceTotal = Number(total_price) || 0;
    const bookingService = await bookingServiceModel.addBookingService({
      booking_id,
      service_id,
      quantity: Number(quantity) || 1,
      total_price: serviceTotal,
    });

    res.status(201).json(bookingService);
  } catch (error) {
    next(error);
  }
}

async function getBookingServices(req, res, next) {
  try {
    const booking = await bookingModel.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!(await canAccessBooking(req, booking))) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const services = await bookingServiceModel.getServicesByBooking(req.params.id);
    res.json(services);
  } catch (error) {
    next(error);
  }
}

module.exports = { addBookingService, getBookingServices };