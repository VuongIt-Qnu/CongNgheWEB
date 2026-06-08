const express = require('express');
const {
  getReviewsByRoom,
  getEligibleBookings,
  createReview,
  deleteReview,
  updateReview,
  getAllReviews,
  setReviewVisibility,
} = require('../controllers/reviewController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/handleValidation');
const { sanitizeBody } = require('../middleware/sanitize');
const revV = require('../middleware/validators/reviewValidator');

const router = express.Router();

router.get('/room/:roomId', getReviewsByRoom);
router.get('/eligible/room/:roomId', authenticateToken, getEligibleBookings);

router.get('/', authenticateToken, authorizeRoles('admin', 'staff'), getAllReviews);

router.post('/', authenticateToken, revV.createReview, handleValidation, sanitizeBody('comment'), createReview);
router.put('/:id', authenticateToken, revV.updateReview, handleValidation, sanitizeBody('comment'), updateReview);
router.patch('/:id/visibility', authenticateToken, authorizeRoles('admin', 'staff'), setReviewVisibility);
router.delete('/:id', authenticateToken, deleteReview);

module.exports = router;
