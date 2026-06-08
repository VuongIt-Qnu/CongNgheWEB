const express = require('express');
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  checkInBooking,
  checkOutBooking,
  cancelBookingAdmin,
  createDraftBooking,
  getBookingSummary,
  addBookingService,
  removeBookingService,
  confirmBookingPayment,
  completeBooking,
} = require('../controllers/bookingController');
const { getBookingServices } = require('../controllers/bookingServiceController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/handleValidation');
const bookingV = require('../middleware/validators/bookingValidator');

const router = express.Router();

router.get('/', authenticateToken, getBookings);
router.post('/', authenticateToken, authorizeRoles('admin', 'staff', 'customer'), bookingV.createBooking, handleValidation, createBooking);
router.post('/draft', authenticateToken, authorizeRoles('admin', 'staff', 'customer'), bookingV.createBooking, handleValidation, createDraftBooking);
router.post('/complete', authenticateToken, authorizeRoles('admin', 'staff', 'customer'), bookingV.completeBooking, handleValidation, completeBooking);

router.get('/:id/services', authenticateToken, getBookingServices);
router.get('/:id/summary', authenticateToken, getBookingSummary);

router.post('/:id/check-in', authenticateToken, authorizeRoles('admin', 'staff'), checkInBooking);
router.post('/:id/check-out', authenticateToken, authorizeRoles('admin', 'staff'), checkOutBooking);
router.post('/:id/cancel', authenticateToken, authorizeRoles('admin', 'staff'), cancelBookingAdmin);
router.post('/:id/services', authenticateToken, authorizeRoles('admin', 'staff', 'customer'), addBookingService);
router.delete('/:bookingId/services/:serviceId', authenticateToken, authorizeRoles('admin', 'staff', 'customer'), removeBookingService);
router.post('/:id/confirm-payment', authenticateToken, authorizeRoles('admin', 'staff', 'customer'), confirmBookingPayment);

router.get('/:id', authenticateToken, getBooking);

router.put('/:id', authenticateToken, authorizeRoles('admin', 'staff'), bookingV.updateBooking, handleValidation, updateBooking);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'staff'), deleteBooking);

module.exports = router;
