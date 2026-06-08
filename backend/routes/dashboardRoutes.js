const express = require('express');
const { getDashboard } = require('../controllers/dashboardController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/', authenticateToken, authorizeRoles('admin', 'staff'), getDashboard);

module.exports = router;