const jwt = require('jsonwebtoken');
const util = require('util');
const config = require('../config/config');
const userModel = require('../models/userModel');

const jwtVerify = util.promisify(jwt.verify);

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Missing token' });

    const payload = await jwtVerify(token, config.jwtSecret);
    const u = await userModel.findById(payload.id);
    if (!u) return res.status(403).json({ message: 'Invalid token' });
    if (Number(u.is_active) !== 1) {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa hoặc vô hiệu' });
    }

    req.user = { id: u.id, email: u.email, role: u.role, name: u.name };
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };
