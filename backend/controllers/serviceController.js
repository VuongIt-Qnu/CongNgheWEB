const serviceModel = require('../models/serviceModel');

async function getServices(req, res, next) {
  try {
    const { search, page, limit } = req.query;
    const result = await serviceModel.getAllServices({ search, page, limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getService(req, res, next) {
  try {
    const service = await serviceModel.getServiceById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    res.json(service);
  } catch (error) {
    next(error);
  }
}

async function createService(req, res, next) {
  try {
    const service = await serviceModel.createService(req.body);
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
}

async function updateService(req, res, next) {
  try {
    const service = await serviceModel.updateService(req.params.id, req.body);
    res.json(service);
  } catch (error) {
    next(error);
  }
}

async function deleteService(req, res, next) {
  try {
    await serviceModel.deleteService(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

module.exports = { getServices, getService, createService, updateService, deleteService };
