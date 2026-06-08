import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Edit3, MessageSquare, Star, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dateFormat';
import api from '../../services/api';
import { displayRoomName } from '../../constants/labels';

function StarRating({ rating, onChange, interactive = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(i)}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
        >
          <Star
            className={`h-4 w-4 ${
              i <= (interactive ? hovered || rating : rating)
                ? 'fill-gold-500 text-gold-500'
                : 'fill-slate-200 text-slate-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewItem({ review, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating);
  const [editComment, setEditComment] = useState(review.comment);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    if (!editComment.trim()) {
      toast.error('Nội dung đánh giá không được để trống');
      return;
    }
    try {
      setSaving(true);
      const res = await api.put(`/reviews/${review.id}`, {
        rating: editRating,
        comment: editComment.trim(),
      });
      onUpdate(res.data);
      setEditing(false);
      toast.success('Đã cập nhật đánh giá');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không thể cập nhật');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/reviews/${review.id}`);
      onDelete(review.id);
      toast.success('Đã xóa đánh giá');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không thể xóa');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const createdDate = formatDate(review.created_at);

  return (
    <div className="group rounded-xl border border-slate-100 px-4 py-4 transition hover:border-gold-500/20 hover:bg-slate-50/60">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-navy-900">
            {displayRoomName(review.room_number)}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-400">
            {review.room_type_name} · {createdDate}
          </p>
        </div>
        {!editing && (
          <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setEditRating(review.rating);
                setEditComment(review.comment);
              }}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-navy-900"
              title="Sửa"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
              title="Xóa"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      {editing ? (
        <div className="mt-3 space-y-3">
          <StarRating rating={editRating} onChange={setEditRating} interactive />
          <textarea
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-navy-800 disabled:opacity-60"
            >
              {saving ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Check className="h-3 w-3" />
              )}
              Lưu
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            >
              <X className="h-3 w-3" />
              Hủy
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2">
          <StarRating rating={review.rating} />
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{review.comment}</p>
        </div>
      )}

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3">
              <p className="text-xs font-semibold text-rose-700">Xác nhận xóa đánh giá này?</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
                >
                  {deleting ? 'Đang xóa...' : 'Xóa'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function UserReviewCard({ reviews, loading, onUpdate, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-card sm:p-8"
    >
      <div className="mb-5 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-gold-500" />
        <h2 className="text-heading text-lg font-bold text-navy-900">Đánh giá của tôi</h2>
        {reviews && reviews.length > 0 && (
          <span className="ml-1 rounded-full bg-navy-900/10 px-2 py-0.5 text-[11px] font-bold text-navy-900">
            {reviews.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((k) => (
            <div key={k} className="h-24 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : !reviews || reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">Chưa có đánh giá nào</p>
          <p className="mt-1 text-xs text-slate-400">Đánh giá phòng sau khi hoàn thành kỳ nghỉ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <ReviewItem key={r.id} review={r} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
