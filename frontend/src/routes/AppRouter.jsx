import { Navigate, Route, Routes } from 'react-router-dom';
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import StaffRoute from './StaffRoute';
import AdminRoute from './AdminRoute';
import HomePage from '../pages/user/HomePage';
import RoomsPage from '../pages/user/RoomsPage';
import RoomDetailPage from '../pages/user/RoomDetailPage';
import BookingPage from '../pages/user/BookingPage';
import BookingSummaryPage from '../pages/user/BookingSummaryPage';
import MyBookingsPage from '../pages/user/MyBookingsPage';
import ProfilePage from '../pages/user/ProfilePage';
import PaymentPage from '../pages/user/PaymentPage';
import PaymentSuccessPage from '../pages/user/PaymentSuccessPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminRoomsPage from '../pages/admin/AdminRoomsPage';
import AdminBookingsPage from '../pages/admin/AdminBookingsPage';
import AdminCustomersPage from '../pages/admin/AdminCustomersPage';
import AdminServicesPage from '../pages/admin/AdminServicesPage';
import AdminPaymentsPage from '../pages/admin/AdminPaymentsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminRoomTypesPage from '../pages/admin/AdminRoomTypesPage';
import AdminReportsPage from '../pages/admin/AdminReportsPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
import AdminActivityPage from '../pages/admin/AdminActivityPage';
import AdminReviewsPage from '../pages/admin/AdminReviewsPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route element={<UserLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/room/:id" element={<RoomDetailPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking-summary/:bookingId" element={<BookingSummaryPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment-success/:bookingId" element={<PaymentSuccessPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<StaffRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="rooms" element={<AdminRoomsPage />} />
            <Route path="room-types" element={<AdminRoomTypesPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="activity" element={<AdminActivityPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route element={<AdminRoute />}>
              <Route path="users" element={<AdminUsersPage />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
