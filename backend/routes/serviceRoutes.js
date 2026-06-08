const express = require('express');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/handleValidation');
const { sanitizeBody } = require('../middleware/sanitize');
const svcV = require('../middleware/validators/serviceValidator');

const router = express.Router();

router.get('/', authenticateToken, getServices);
router.get('/:id', authenticateToken, getService);
router.post('/', authenticateToken, authorizeRoles('admin', 'staff'), svcV.createService, handleValidation, sanitizeBody('description'), createService);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'staff'), svcV.updateService, handleValidation, sanitizeBody('description'), updateService);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'staff'), deleteService);

module.exports = router;
