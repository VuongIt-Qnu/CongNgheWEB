const roomTypeModel = require('../models/roomTypeModel');

async function getRoomTypes(req, res, next) {
  try {
    const types = await roomTypeModel.getAllRoomTypes();
    res.json(types);
  } catch (error) {
    next(error);
  }
}

async function getRoomType(req, res, next) {
  try {
    const type = await roomTypeModel.getRoomTypeById(req.params.id);
    if (!type) return res.status(404).json({ message: 'Loại phòng không tồn tại' });
    res.json(type);
  } catch (error) {
    next(error);
  }
}

async function createRoomType(req, res, next) {
  try {
    const type = await roomTypeModel.createRoomType(req.body);
    res.status(201).json(type);
  } catch (error) {
    next(error);
  }
}

async function updateRoomType(req, res, next) {
  try {
    const type = await roomTypeModel.updateRoomType(req.params.id, req.body);
    res.json(type);
  } catch (error) {
    next(error);
  }
}

async function deleteRoomType(req, res, next) {
  try {
    await roomTypeModel.deleteRoomType(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

module.exports = { getRoomTypes, getRoomType, createRoomType, updateRoomType, deleteRoomType };
