import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hotel,
  LayoutDashboard,
  LogOut,
  Menu,
  UserCircle2,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { BRAND } from '../../constants/branding';

function NavLink({ to, children, onClick, light }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={clsx(
        'text-sm font-semibold tracking-wide transition-colors duration-300',
        light ? 'text-white/90 hover:text-gold-400' : 'text-slate-700 hover:text-gold-600'
      )}
    >
      {children}
    </Link>
  );
}

function useHeroOverlayRoute() {
  const { pathname } = useLocation();
  if (pathname === '/' || pathname === '/rooms') return true;
  if (/^\/room\/\d+$/.test(pathname)) return true;
  return false;
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroOverlay = useHeroOverlayRoute();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);
  const isTransparent = heroOverlay && !scrolled && !mobileOpen;

  return (
    <>
      <header
        className={clsx(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out',
          isTransparent
            ? 'border-transparent bg-transparent py-5'
            : 'border-b border-slate-200/60 bg-white/75 py-3 shadow-[0_8px_32px_rgba(10,26,54,0.06)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/65'
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            onClick={closeMobile}
            className={clsx(
              'flex min-w-0 items-center gap-2.5 font-display text-lg font-bold tracking-wider transition-colors duration-300',
              isTransparent ? 'text-white' : 'text-navy-900'
            )}
          >
            <span
              className={clsx(
                'grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors',
                isTransparent ? 'bg-white/10 text-gold-400' : 'bg-navy-900/5 text-gold-600'
              )}
            >
              <Hotel className="h-5 w-5" />
            </span>
            <span className="truncate">{BRAND.resort}</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <NavLink to="/" light={isTransparent}>
              Trang chủ
            </NavLink>
            <NavLink to="/rooms" light={isTransparent}>
              Phòng & đặt chỗ
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/my-bookings" light={isTransparent}>
                Booking của tôi
              </NavLink>
            )}
            {isAuthenticated && (
              <NavLink to="/profile" light={isTransparent}>
                Hồ sơ
              </NavLink>
            )}
            {isAuthenticated && ['admin', 'staff'].includes(user?.role) && (
              <Link
                to="/admin/dashboard"
                className={clsx(
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold shadow-md transition-all duration-300',
                  isTransparent
                    ? 'bg-white text-navy-900 hover:bg-slate-100'
                    : 'bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 hover:from-gold-600 hover:to-gold-700'
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                Quản trị
              </Link>
            )}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {!isAuthenticated && (
              <Link
                to="/register"
                className={clsx(
                  'rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300',
                  isTransparent
                    ? 'border border-white/30 text-white hover:bg-white/10'
                    : 'border border-slate-200 text-navy-900 hover:bg-slate-50'
                )}
              >
                Đăng ký
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <span
                  className={clsx(
                    'max-w-[140px] truncate text-sm font-semibold',
                    isTransparent ? 'text-white/75' : 'text-slate-600'
                  )}
                  title={user?.name || user?.email}
                >
                  {user?.name || user?.email}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className={clsx(
                    'inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-bold transition-all duration-300',
                    isTransparent
                      ? 'border-white/30 text-white hover:bg-white/10'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={clsx(
                  'inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold shadow-md transition-all duration-300',
                  isTransparent
                    ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 hover:from-gold-600 hover:to-gold-700'
                    : 'bg-navy-900 text-white hover:bg-navy-800'
                )}
              >
                <UserCircle2 className="h-4 w-4" />
                Đăng nhập
              </Link>
            )}
          </div>

          <button
            type="button"
            className={clsx(
              'grid h-10 w-10 place-items-center rounded-xl border transition-all duration-300 md:hidden',
              isTransparent
                ? 'border-white/30 text-white hover:bg-white/10'
                : 'border-slate-200 text-navy-900 hover:bg-slate-50'
            )}
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-navy-900/40 backdrop-blur-sm md:hidden"
              aria-label="Đóng menu"
              onClick={closeMobile}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 right-0 z-[70] flex w-[min(100%,320px)] flex-col border-l border-slate-200/80 bg-white shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <span className="font-display font-bold text-navy-900">Menu</span>
                <button
                  type="button"
                  onClick={closeMobile}
                  className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                  aria-label="Đóng"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
                <NavLink to="/" onClick={closeMobile}>
                  Trang chủ
                </NavLink>
                <NavLink to="/rooms" onClick={closeMobile}>
                  Phòng & đặt chỗ
                </NavLink>
                {isAuthenticated && (
                  <NavLink to="/my-bookings" onClick={closeMobile}>
                    Booking của tôi
                  </NavLink>
                )}
                {isAuthenticated && (
                  <NavLink to="/profile" onClick={closeMobile}>
                    Hồ sơ
                  </NavLink>
                )}
                {isAuthenticated && ['admin', 'staff'].includes(user?.role) && (
                  <Link
                    to="/admin/dashboard"
                    onClick={closeMobile}
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 py-3 text-sm font-bold text-navy-900"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Trang quản trị
                  </Link>
                )}
              </nav>
              <div className="space-y-2 border-t border-slate-100 p-4">
                {!isAuthenticated && (
                  <Link
                    to="/register"
                    onClick={closeMobile}
                    className="block rounded-xl border border-slate-200 py-3 text-center text-sm font-bold text-navy-900"
                  >
                    Đăng ký
                  </Link>
                )}
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      closeMobile();
                    }}
                    className="w-full rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-800"
                  >
                    Đăng xuất
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={closeMobile}
                    className="block rounded-xl bg-navy-900 py-3 text-center text-sm font-bold text-white"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
