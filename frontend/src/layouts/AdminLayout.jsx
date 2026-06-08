import clsx from 'clsx';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { AdminThemeProvider, useAdminTheme } from '../contexts/AdminThemeContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

function AdminLayoutInner() {
  const { logout } = useAuth();
  const { sidebarCollapsed } = useAdminTheme();
  const mainPad = sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[280px]';

  return (
    <div className="min-h-screen bg-slate-50 bg-[linear-gradient(180deg,#eef2f8_0%,#f8fafc_50%,#f1f5f9_100%)] transition-colors dark:bg-navy-950 dark:bg-none">
      <AdminSidebar onLogout={logout} />
      <div className={clsx(mainPad, 'min-h-screen transition-[margin] duration-300 lg:min-h-[100dvh]', 'flex-1')}>
        <div className="mx-auto px-4 pb-10 pt-4 lg:max-w-[1600px] lg:px-6">
          <AdminHeader />
          <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="mt-6">
            <Outlet />
          </motion.main>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AdminThemeProvider>
      <AdminLayoutInner />
    </AdminThemeProvider>
  );
}
