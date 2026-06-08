import clsx from 'clsx';
import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeftRight,
  BarChart3,
  CreditCard,
  Hotel,
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ScrollText,
  Settings,
  Sofa,
  Layers,
  Users,
  Utensils,
  ClipboardList,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminTheme } from '../../contexts/AdminThemeContext';

const items = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/rooms', label: 'Phòng', icon: Sofa },
  { to: '/admin/room-types', label: 'Loại phòng', icon: Layers },
  { to: '/admin/bookings', label: 'Booking', icon: ClipboardList },
  { to: '/admin/customers', label: 'Khách hàng', icon: Users },
  { to: '/admin/services', label: 'Dịch vụ', icon: Utensils },
  { to: '/admin/payments', label: 'Thanh toán', icon: CreditCard },
  { to: '/admin/reviews', label: 'Đánh giá', icon: MessageSquare },
  { to: '/admin/users', label: 'Người dùng', icon: ArrowLeftRight, adminOnly: true },
  { to: '/admin/reports', label: 'Báo cáo', icon: BarChart3 },
  { to: '/admin/activity', label: 'Hoạt động', icon: ScrollText },
  { to: '/admin/settings', label: 'Cài đặt', icon: Settings },
];

export default function AdminSidebar({ onLogout }) {
  const { user } = useAuth();
  const { sidebarCollapsed, toggleSidebar, mobileNavOpen, setMobileNavOpen } = useAdminTheme();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const [hoverCollapse, setHoverCollapse] = useState(false);

  return (
    <>
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
    <aside
      className={clsx(
        'fixed left-0 top-0 z-40 flex h-full flex-col border-r bg-gradient-to-b from-[#0a1520] to-[#081226] shadow-2xl transition-all duration-300 ease-out dark:border-slate-700/90',
        'border-white/5',
        sidebarCollapsed ? 'w-[72px]' : 'w-64 xl:w-[280px]',
        mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/8 px-4 py-5">
        <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 text-slate-900 shadow-lg">
          <Hotel className="h-5 w-5 font-bold" />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.15em] text-gold-400">Aurora</p>
            <p className="truncate text-sm font-bold text-white">Aurora Resort</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-5">
        <p className={clsx(
          'mb-4 px-3 text-[11px] font-bold uppercase tracking-widest text-white/50 transition-opacity duration-200',
          sidebarCollapsed && 'sr-only'
        )}>
          HỆ THỐNG QUẢN TRỊ
        </p>
        <div className="flex flex-col gap-1.5">
          {items.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <div key={item.to} className="relative">
                <NavLink
                  to={item.to}
                  title={sidebarCollapsed ? item.label : ''}
                  onClick={() => setMobileNavOpen(false)}
                  className={clsx(
                    'group relative flex items-center gap-3.5 rounded-lg px-3.5 py-3 text-sm font-semibold transition-all duration-200 ease-out',
                    isActive
                      ? 'bg-gradient-to-r from-gold-500/25 via-gold-500/15 to-transparent text-white shadow-md ring-1 ring-gold-500/30 ring-inset'
                      : 'text-white/80 hover:text-white hover:bg-white/8'
                  )}
                >
                  <Icon className={clsx(
                    'h-5 w-5 flex-shrink-0 transition-all duration-200',
                    'text-gold-400'
                  )} />
                  {!sidebarCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </NavLink>
                {isActive && !sidebarCollapsed && (
                  <div className="absolute inset-y-0 left-0 w-1 rounded-r-lg bg-gradient-to-b from-gold-400 to-gold-500" />
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="space-y-1.5 border-t border-white/8 bg-gradient-to-t from-slate-900/40 to-transparent p-3">
        <div className="relative group">
          <button
            type="button"
            onClick={toggleSidebar}
            onMouseEnter={() => setHoverCollapse(true)}
            onMouseLeave={() => setHoverCollapse(false)}
            className={clsx(
              'flex w-full items-center justify-center gap-3 rounded-lg px-3.5 py-3 text-sm font-semibold transition-all duration-200',
              'text-white/75 hover:text-white hover:bg-white/8'
            )}
            title={sidebarCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5 transition-transform duration-200" />
            ) : (
              <ChevronLeft className="h-5 w-5 transition-transform duration-200" />
            )}
            {!sidebarCollapsed && <span className="flex-1 text-left">Thu gọn</span>}
          </button>
          
          {/* Tooltip */}
          {sidebarCollapsed && hoverCollapse && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white shadow-lg pointer-events-none">
              Mở rộng sidebar
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onLogout}
          className={clsx(
            'flex w-full items-center justify-center gap-3 rounded-lg px-3.5 py-3 text-sm font-semibold transition-all duration-200',
            'text-red-300/90 hover:text-white hover:bg-red-500/15'
          )}
          title={sidebarCollapsed ? 'Đăng xuất' : ''}
        >
          <LogOut className="h-5 w-5" />
          {!sidebarCollapsed && <span className="flex-1 text-left">Đăng xuất</span>}
        </button>
      </div>
    </aside>
    </>
  );
}
