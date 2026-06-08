const express = require('express');
const {
  getRoomTypes,
  getRoomType,
  createRoomType,
  updateRoomType,
  deleteRoomType,
} = require('../controllers/roomTypeController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/handleValidation');
const { sanitizeBody } = require('../middleware/sanitize');
const rtV = require('../middleware/validators/roomTypeValidator');

const router = express.Router();

router.get('/', getRoomTypes);
router.get('/:id', getRoomType);
router.post('/', authenticateToken, authorizeRoles('admin', 'staff'), rtV.createRoomType, handleValidation, sanitizeBody('description'), createRoomType);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'staff'), rtV.updateRoomType, handleValidation, sanitizeBody('description'), updateRoomType);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'staff'), deleteRoomType);

module.exports = router;
