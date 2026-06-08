const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const userModel = require('../models/userModel');
const reviewModel = require('../models/reviewModel');
const passwordResetModel = require('../models/passwordResetModel');
const { sendEmail } = require('../services/emailService');
const { forgotPasswordEmail } = require('../utils/emailTemplates');

const FORGOT_PASSWORD_SUCCESS = {
  success: true,
  message: 'Nếu tài khoản tồn tại, liên kết đặt lại mật khẩu đã được gửi.',
};

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email đã được sử dụng' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await userModel.createUser({ name, email, password: hashed, role });

    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findByEmailWithPassword(email);
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    if (Number(user.is_active ?? 1) !== 1) {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa hoặc vô hiệu' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

    const fullUser = await userModel.findById(user.id);
    res.json({ token, user: fullUser });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function updateMe(req, res, next) {
  try {
    const { name, phone, address } = req.body;
    const currentUser = await userModel.findById(req.user.id);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });
    const updated = await userModel.updateUser(req.user.id, {
      name: String(name).trim(),
      email: currentUser.email,
      role: currentUser.role,
      phone: phone !== undefined ? String(phone).trim() : currentUser.phone,
      address: address !== undefined ? String(address).trim() : currentUser.address,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Ảnh avatar là bắt buộc' });
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const updated = await userModel.updateUser(req.user.id, { avatar_url: avatarUrl });
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body;
    const user = await userModel.findByEmailWithPassword(req.user.email);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const ok = await bcrypt.compare(current_password, user.password);
    if (!ok) return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    await userModel.updateUser(user.id, {
      name: user.name,
      email: user.email,
      role: user.role,
      password: await bcrypt.hash(new_password, 10),
    });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}

async function getMyReviews(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await reviewModel.getReviewsByUser(req.user.id, { page, limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await userModel.findByEmailWithPassword(email);

    if (user && Number(user.is_active ?? 1) === 1) {
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashResetToken(token);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      await passwordResetModel.createResetToken(user.id, tokenHash, expiresAt);

      const template = forgotPasswordEmail(token, config.frontendUrl);
      await sendEmail({
        to: user.email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
    }

    res.json(FORGOT_PASSWORD_SUCCESS);
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu xác nhận không khớp',
      });
    }

    const tokenHash = hashResetToken(token);
    const resetRecord = await passwordResetModel.findValidToken(tokenHash);

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
      });
    }

    const user = await userModel.findByEmailWithPassword(
      (await userModel.findById(resetRecord.user_id))?.email ?? ''
    );
    if (!user || Number(user.is_active ?? 1) !== 1) {
      return res.status(400).json({
        success: false,
        message: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await userModel.updateUser(user.id, {
      name: user.name,
      email: user.email,
      role: user.role,
      password: hashed,
    });
    await passwordResetModel.markTokenUsed(resetRecord.id);

    res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  me,
  updateMe,
  uploadAvatar,
  changePassword,
  getMyReviews,
  forgotPassword,
  resetPassword,
};
