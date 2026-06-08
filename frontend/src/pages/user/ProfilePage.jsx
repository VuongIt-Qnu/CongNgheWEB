import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ProfileHeader from '../../components/profile/ProfileHeader';
import AvatarUpload from '../../components/profile/AvatarUpload';
import PersonalInfoForm from '../../components/profile/PersonalInfoForm';
import ChangePasswordForm from '../../components/profile/ChangePasswordForm';
import BookingHistoryCard from '../../components/profile/BookingHistoryCard';
import UserReviewCard from '../../components/profile/UserReviewCard';

export default function ProfilePage() {
  const { user, updateProfile, uploadAvatar, changePassword, logout, refreshMe } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [avatarOpen, setAvatarOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Refresh user data on mount
  useEffect(() => {
    setLoading(true);
    setError(null);
    refreshMe()
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Không thể tải thông tin người dùng';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [refreshMe]);

  // Load bookings
  useEffect(() => {
    setBookingsLoading(true);
    api
      .get('/bookings', { params: { limit: 5, page: 1 } })
      .then((res) => setBookings(res.data.bookings || []))
      .catch(() => setBookings([]))
      .finally(() => setBookingsLoading(false));
  }, []);

  // Load reviews
  useEffect(() => {
    setReviewsLoading(true);
    api
      .get('/auth/me/reviews', { params: { limit: 20 } })
      .then((res) => setReviews(res.data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, []);

  const handleAvatarUpload = useCallback(
    async (file) => {
      await uploadAvatar(file);
      toast.success('Đã cập nhật ảnh đại diện');
    },
    [uploadAvatar]
  );

  const handleProfileSave = useCallback(
    async ({ name, phone, address }) => {
      await updateProfile({ name, phone, address });
    },
    [updateProfile]
  );

  const handleChangePassword = useCallback(
    async ({ current_password, new_password }) => {
      await changePassword({ current_password, new_password });
    },
    [changePassword]
  );

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleReviewUpdate = useCallback((updated) => {
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
  }, []);

  const handleReviewDelete = useCallback((deletedId) => {
    setReviews((prev) => prev.filter((r) => r.id !== deletedId));
  }, []);

  if (!user && !loading && error) {
    return (
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-navy-900 sm:text-3xl">Quản lý hồ sơ</h1>
        </motion.div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="text-sm font-semibold text-rose-800">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-block rounded-full bg-navy-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-navy-800"
          >
            Tải lại trang
          </button>
        </div>
      </section>
    );
  }

  if (!user && !loading) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
          <Sparkles className="h-4 w-4" />
          Tài khoản của tôi
        </div>
        <h1 className="text-heading-lg mt-1 text-2xl font-bold text-navy-900 sm:text-3xl">
          Quản lý hồ sơ
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Xem và cập nhật thông tin cá nhân, bảo mật và lịch sử hoạt động
        </p>
      </motion.div>

      {loading ? (
        <>
          {/* Profile Header Skeleton */}
          <div className="mb-8 animate-pulse rounded-3xl border border-slate-200/60 bg-white shadow-luxury">
            <div className="h-40 bg-gradient-to-r from-slate-200 to-slate-300 sm:h-48" />
            <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
              <div className="-mt-16 mb-4 flex items-end gap-5 sm:-mt-20 sm:gap-6">
                <div className="h-28 w-28 flex-shrink-0 rounded-2xl bg-slate-200 sm:h-36 sm:w-36 sm:rounded-3xl" />
                <div className="pb-1 flex-1">
                  <div className="h-8 w-48 bg-slate-200 rounded-lg" />
                  <div className="mt-2 h-6 w-32 bg-slate-200 rounded-full" />
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((k) => (
                  <div key={k} className="h-16 bg-slate-100 rounded-xl" />
                ))}
              </div>
            </div>
          </div>

          {/* Forms Skeleton */}
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="animate-pulse h-96 rounded-3xl bg-slate-100" />
            <div className="animate-pulse h-96 rounded-3xl bg-slate-100" />
          </div>

          {/* Booking History Skeleton */}
          <div className="mt-8 animate-pulse rounded-3xl bg-slate-100 h-64" />

          {/* Reviews Skeleton */}
          <div className="mt-8 animate-pulse rounded-3xl bg-slate-100 h-64" />
        </>
      ) : user ? (
        <>
          {/* Profile Header */}
          <ProfileHeader user={user} onAvatarClick={() => setAvatarOpen(true)} />

          {/* Avatar Upload Modal */}
          <AvatarUpload
            open={avatarOpen}
            onClose={() => setAvatarOpen(false)}
            onUpload={handleAvatarUpload}
          />

          {/* Forms Grid */}
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <PersonalInfoForm user={user} onSave={handleProfileSave} />
            <ChangePasswordForm onChangePassword={handleChangePassword} onLogout={handleLogout} />
          </div>

          {/* Booking History */}
          <div className="mt-8">
            <BookingHistoryCard bookings={bookings} loading={bookingsLoading} />
          </div>

          {/* My Reviews */}
          <div className="mt-8">
            <UserReviewCard
              reviews={reviews}
              loading={reviewsLoading}
              onUpdate={handleReviewUpdate}
              onDelete={handleReviewDelete}
            />
          </div>
        </>
      ) : null}
    </section>
  );
}
