const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const customerModel = require('../models/customerModel');

async function getUsers(req, res, next) {
  try {
    const { search, page, limit } = req.query;
    const result = await userModel.getUsers({ search, page, limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });
    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Tên, email và mật khẩu là bắt buộc' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email đã được sử dụng' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await userModel.createUser({ name, email, password: hashed, role });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const { name, email, password, role, is_active } = req.body;
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    const updatePayload = { name, email, role, is_active };
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
      }
      updatePayload.password = await bcrypt.hash(password, 10);
    }

    const updated = await userModel.updateUser(req.params.id, updatePayload);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    // Hủy liên kết các khách hàng liên quan trước khi xóa người dùng
    await customerModel.unlinkCustomersByUserId(req.params.id);
    await userModel.deleteUser(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser };