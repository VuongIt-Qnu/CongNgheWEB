const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
  uploadRoomImage,
  getRoomImages,
  deleteRoomImage,
} = require('../controllers/roomController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/handleValidation');
const { sanitizeBody } = require('../middleware/sanitize');
const roomV = require('../middleware/validators/roomValidator');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads', 'rooms');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${file.originalname}`.replace(/\s+/g, '-');
      cb(null, unique);
    },
  }),
});

router.get('/available', getAvailableRooms);
router.get('/', getRooms);
router.get('/:id', getRoom);
router.get('/:id/images', getRoomImages);
router.post('/', authenticateToken, authorizeRoles('admin', 'staff'), roomV.createRoom, handleValidation, sanitizeBody('description'), createRoom);
router.post('/upload-image', authenticateToken, authorizeRoles('admin', 'staff'), upload.single('image'), uploadRoomImage);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'staff'), roomV.updateRoom, handleValidation, sanitizeBody('description'), updateRoom);
router.delete('/images/:imageId', authenticateToken, authorizeRoles('admin', 'staff'), deleteRoomImage);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'staff'), deleteRoom);

module.exports = router;
