import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function StaffRoute() {
  const { role } = useAuth();
  if (!role) return <Navigate to="/login" replace />;
  if (!['admin', 'staff'].includes(role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
