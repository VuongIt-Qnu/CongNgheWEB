const reviewModel = require('../models/reviewModel');
const bookingModel = require('../models/bookingModel');
const { canAccessBooking } = require('../utils/bookingOwnership');

async function getReviewsByRoom(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await reviewModel.getReviewsByRoom(req.params.roomId, { page, limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getEligibleBookings(req, res, next) {
  try {
    const roomId = Number(req.params.roomId);
    if (!roomId) return res.status(400).json({ message: 'roomId không hợp lệ' });
    const rows = await reviewModel.getEligibleBookingsForRoom(roomId, req.user.id, req.user.email || '');
    res.json({ bookings: rows });
  } catch (error) {
    next(error);
  }
}

async function createReview(req, res, next) {
  try {
    const { room_id, booking_id, rating, comment } = req.body;
    const rid = Number(room_id);
    const bid = Number(booking_id);
    const rNum = Number(rating);
    const commentTrim = typeof comment === 'string' ? comment.trim() : '';

    const existing = await reviewModel.getReviewByBookingId(bid);
    if (existing) {
      return res.status(409).json({ message: 'Booking này đã có đánh giá' });
    }

    const booking = await bookingModel.getBookingById(bid);
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy booking' });
    if (!(await canAccessBooking(req, booking))) {
      return res.status(403).json({ message: 'Bạn không có quyền đánh giá booking này' });
    }
    if (String(booking.status || '').toLowerCase() !== 'completed') {
      return res.status(400).json({ message: 'Chỉ đánh giá được khi booking đã hoàn thành' });
    }
    if (Number(booking.room_id) !== rid) {
      return res.status(400).json({ message: 'Booking không thuộc phòng này' });
    }

    let review;
    try {
      review = await reviewModel.createReview({
        user_id: req.user.id,
        room_id: rid,
        booking_id: bid,
        rating: rNum,
        comment: commentTrim,
      });
    } catch (err) {
      if (String(err?.message || '').includes('UNIQUE') || err?.errno === 19) {
        return res.status(409).json({ message: 'Booking này đã có đánh giá' });
      }
      throw err;
    }
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
}

async function deleteReview(req, res, next) {
  try {
    const review = await reviewModel.getReviewById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Đánh giá không tồn tại' });

    const isMod = req.user.role === 'admin' || req.user.role === 'staff';
    if (review.user_id !== req.user.id && !isMod) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await reviewModel.deleteReview(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function updateReview(req, res, next) {
  try {
    const { rating, comment } = req.body;
    const rNum = Number(rating);
    const commentTrim = typeof comment === 'string' ? comment.trim() : '';

    const review = await reviewModel.getReviewById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Đánh giá không tồn tại' });
    if (review.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Chỉ người viết mới có thể sửa đánh giá' });
    }

    const updated = await reviewModel.updateReview(req.params.id, rNum, commentTrim);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function getAllReviews(req, res, next) {
  try {
    const { page, limit, search, hidden } = req.query;
    const result = await reviewModel.getAllReviews({ page, limit, search, hidden });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function setReviewVisibility(req, res, next) {
  try {
    const { is_hidden } = req.body;
    const hidden = Boolean(is_hidden);
    const review = await reviewModel.getReviewById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Đánh giá không tồn tại' });
    const updated = await reviewModel.setReviewHidden(req.params.id, hidden);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getReviewsByRoom,
  getEligibleBookings,
  createReview,
  deleteReview,
  updateReview,
  getAllReviews,
  setReviewVisibility,
};
