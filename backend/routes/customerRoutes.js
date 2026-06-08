const express = require('express');
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/handleValidation');
const { sanitizeBody } = require('../middleware/sanitize');
const custV = require('../middleware/validators/customerValidator');

const router = express.Router();

router.get('/', authenticateToken, getCustomers);
router.get('/:id', authenticateToken, getCustomer);
router.post('/', authenticateToken, authorizeRoles('admin', 'staff'), custV.createCustomer, handleValidation, sanitizeBody('address'), createCustomer);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'staff'), custV.updateCustomer, handleValidation, sanitizeBody('address'), updateCustomer);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'staff'), deleteCustomer);

module.exports = router;
