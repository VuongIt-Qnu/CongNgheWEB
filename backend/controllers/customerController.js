const customerModel = require('../models/customerModel');

async function getCustomers(req, res, next) {
  try {
    const { search, page, limit } = req.query;
    const result = await customerModel.getCustomers({ search, page, limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getCustomer(req, res, next) {
  try {
    const customer = await customerModel.getCustomerById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Khách hàng không tồn tại' });
    res.json(customer);
  } catch (error) {
    next(error);
  }
}

async function createCustomer(req, res, next) {
  try {
    const customer = await customerModel.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
}

async function updateCustomer(req, res, next) {
  try {
    const customer = await customerModel.updateCustomer(req.params.id, req.body);
    res.json(customer);
  } catch (error) {
    next(error);
  }
}

async function deleteCustomer(req, res, next) {
  try {
    const hasActive = await customerModel.hasActiveBookings(req.params.id);
    if (hasActive) {
      return res.status(400).json({ message: 'Không thể xóa — khách hàng còn booking đang hoạt động (pending/confirmed/occupied)' });
    }
    await customerModel.deleteCustomer(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
