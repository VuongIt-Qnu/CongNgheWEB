const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  register,
  login,
  me,
  updateMe,
  uploadAvatar,
  changePassword,
  getMyReviews,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/handleValidation');
const { sanitizeBody } = require('../middleware/sanitize');
const authV = require('../middleware/validators/authValidator');

const router = express.Router();

// Avatar upload setup
const avatarDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: avatarDir,
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${file.originalname}`.replace(/\s+/g, '-');
      cb(null, unique);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp|gif)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF'));
    }
  },
});

router.post('/register', authV.register, handleValidation, register);
router.post('/login', authV.login, handleValidation, login);
router.post('/forgot-password', authV.forgotPassword, handleValidation, forgotPassword);
router.post('/reset-password', authV.resetPassword, handleValidation, resetPassword);
router.get('/me', authenticateToken, me);
router.put('/me', authenticateToken, authV.updateMe, handleValidation, sanitizeBody('address'), updateMe);
router.put('/me/password', authenticateToken, authV.changePassword, handleValidation, changePassword);
router.post('/me/avatar', authenticateToken, upload.single('avatar'), uploadAvatar);
router.get('/me/reviews', authenticateToken, getMyReviews);

module.exports = router;
