const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const { getUserPayments } = require('../controllers/paymentController');

const router = express.Router();

router.get('/', authenticateToken, authorizeRoles('admin'), getUsers);
router.get('/me/payments', authenticateToken, getUserPayments);
router.get('/:id', authenticateToken, authorizeRoles('admin'), getUser);
router.post('/', authenticateToken, authorizeRoles('admin'), createUser);
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateUser);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteUser);

module.exports = router;