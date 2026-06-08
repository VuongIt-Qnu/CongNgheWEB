const express = require('express');
const {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  approvePayment,
  rejectPayment,
  refundPayment,
  deletePayment,
  getUserPayments,
} = require('../controllers/paymentController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/handleValidation');
const payV = require('../middleware/validators/paymentValidator');

const router = express.Router();

router.get('/me', authenticateToken, getUserPayments);

router.get('/', authenticateToken, authorizeRoles('admin', 'staff'), getPayments);
router.post('/', authenticateToken, payV.createPayment, handleValidation, createPayment);
router.get('/:id', authenticateToken, getPaymentById);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'staff'), payV.updatePayment, handleValidation, updatePayment);
router.post('/:id/approve', authenticateToken, authorizeRoles('admin', 'staff'), approvePayment);
router.post('/:id/reject', authenticateToken, authorizeRoles('admin', 'staff'), payV.rejectPayment, handleValidation, rejectPayment);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deletePayment);
router.post('/:id/refund', authenticateToken, authorizeRoles('admin', 'staff'), payV.refundPayment, handleValidation, refundPayment);

module.exports = router;
