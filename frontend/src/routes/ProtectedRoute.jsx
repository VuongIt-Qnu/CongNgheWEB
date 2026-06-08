import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const qs = location.pathname + location.search;
    const to = `/login?redirect=${encodeURIComponent(qs)}`;
    return <Navigate to={to} replace state={{ from: location }} />;
  }
  return <Outlet />;
}
