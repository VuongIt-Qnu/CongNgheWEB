const express = require('express');
const { listActivityFeed } = require('../controllers/activityController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, authorizeRoles('admin', 'staff'), listActivityFeed);

module.exports = router;
