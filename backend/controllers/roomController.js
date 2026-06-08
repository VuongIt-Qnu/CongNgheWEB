const fs = require('fs');
const path = require('path');
const roomModel = require('../models/roomModel');
const roomImageModel = require('../models/roomImageModel');

async function getRooms(req, res, next) {
  try {
    const { search, type, types, status, page, limit, min_price, max_price, min_capacity, min_rating } = req.query;
    const result = await roomModel.getRooms({
      search, type, types, status, page, limit, min_price, max_price, min_capacity, min_rating,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getAvailableRooms(req, res, next) {
  try {
    const {
      check_in_date, check_out_date, page, limit, search,
      type, types, status, min_price, max_price, min_capacity, min_rating,
    } = req.query;
    if (!check_in_date || !check_out_date) {
      return res.status(400).json({ message: 'Ngày check-in và check-out là bắt buộc' });
    }
    const result = await roomModel.getAvailableRooms({
      check_in_date, check_out_date, page, limit, search,
      type, types, status, min_price, max_price, min_capacity, min_rating,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getRoom(req, res, next) {
  try {
    const room = await roomModel.getRoomById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    const images = await roomImageModel.getImagesByRoom(room.id);
    res.json({ ...room, images });
  } catch (error) {
    next(error);
  }
}

async function createRoom(req, res, next) {
  try {
    const room = await roomModel.createRoom(req.body);
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
}

async function updateRoom(req, res, next) {
  try {
    const room = await roomModel.updateRoom(req.params.id, req.body);
    res.json(room);
  } catch (error) {
    next(error);
  }
}

async function deleteRoom(req, res, next) {
  try {
    const hasActive = await roomModel.hasActiveBookings(req.params.id);
    if (hasActive) {
      return res.status(400).json({ message: 'Không thể xóa — phòng còn booking đang hoạt động (pending/confirmed/occupied)' });
    }
    await roomModel.deleteRoom(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function uploadRoomImage(req, res, next) {
  try {
    if (!req.file || !req.body.room_id) {
      return res.status(400).json({ message: 'Room ID và ảnh là bắt buộc' });
    }
    const imageUrl = `/uploads/rooms/${req.file.filename}`;
    const image = await roomImageModel.addRoomImage(req.body.room_id, imageUrl);
    res.status(201).json(image);
  } catch (error) {
    next(error);
  }
}

async function getRoomImages(req, res, next) {
  try {
    const images = await roomImageModel.getImagesByRoom(req.params.id);
    res.json(images);
  } catch (error) {
    next(error);
  }
}

async function deleteRoomImage(req, res, next) {
  try {
    const image = await roomImageModel.deleteRoomImage(req.params.imageId);
    if (!image) return res.status(404).json({ success: false, message: 'Ảnh không tồn tại' });

    // Xóa file vật lý nếu nó là tệp tải lên cục bộ
    if (image.image_url && !image.image_url.startsWith('http')) {
      const filePath = path.join(__dirname, '..', image.image_url);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Failed to delete image file:', filePath, err.message);
        }
      });
    }

    res.json({ success: true, message: 'Xóa ảnh thành công', deletedId: image.id });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRooms, getRoom, createRoom, updateRoom, deleteRoom,
  getAvailableRooms, uploadRoomImage, getRoomImages, deleteRoomImage,
};
