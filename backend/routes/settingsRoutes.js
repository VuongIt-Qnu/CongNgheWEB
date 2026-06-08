const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, authorizeRoles('admin', 'staff'), getSettings);
router.put('/', authenticateToken, authorizeRoles('admin'), updateSettings);

module.exports = router;
