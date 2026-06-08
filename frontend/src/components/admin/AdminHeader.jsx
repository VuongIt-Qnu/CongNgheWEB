import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { Bell, Menu, Moon, Search, Sun } from 'lucide-react';
import { formatDate } from '../../utils/dateFormat';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminTheme } from '../../contexts/AdminThemeContext';
import api from '../../services/api';
import { displayRoomName, bookingStatusLabel } from '../../constants/labels';
import { BRAND } from '../../constants/branding';

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const { dark, toggleDark, setMobileNavOpen } = useAdminTheme();
  const [q, setQ] = useState('');
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const profileRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setNotifs(data.notifications?.slice(0, 12) || []);
      } catch {
        setNotifs([]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    function onDoc(e) {
      if (!profileRef.current?.contains(e.target)) setOpenProfile(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200/90 bg-white/90 px-4 backdrop-blur-md dark:border-slate-700/90 dark:bg-slate-900/90 lg:h-[72px] lg:rounded-2xl lg:border lg:px-6"
    >
      <button
        type="button"
        className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 lg:hidden dark:border-slate-700 dark:text-slate-200"
        aria-label="Mở menu"
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>
      <p className="font-display text-sm font-bold text-navy-900 lg:hidden dark:text-white">{BRAND.adminNav}</p>
      <div className="relative mx-auto hidden w-full max-w-md flex-1 md:block lg:mx-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Tra cứu nhanh… (booking, phòng, khách)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none ring-gold-500/25 transition focus:bg-white focus:ring-2 dark:border-slate-600 dark:bg-slate-800 dark:focus:bg-slate-800"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && q.trim()) window.location.href = `/admin/bookings?search=${encodeURIComponent(q.trim())}`;
          }}
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => toggleDark()}
          aria-label={dark ? 'Light mode' : 'Dark mode'}
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenNotif((x) => !x)}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Bell className="h-4 w-4" />
            {notifs.length > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 animate-pulse rounded-full bg-gold-500 shadow-glow" />
            )}
          </button>
          {openNotif && (
            <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-slate-200 bg-white py-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
              <p className="border-b border-slate-100 px-4 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-slate-700">
                Thông báo
              </p>
              <div className="max-h-72 overflow-y-auto">
                {notifs.length ? (
                  notifs.map((n) => (
                    <div
                      key={n.id}
                      className="border-b border-slate-50 px-4 py-2.5 text-sm last:border-0 dark:border-slate-800"
                    >
                      <p className="font-semibold text-navy-900 dark:text-white">Booking #{n.id}</p>
                      <p className="text-xs text-slate-500">{n.customer_name || 'Khách'} · {displayRoomName(n.room_number)}</p>
                      <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-900/30 dark:text-amber-300">
                        {bookingStatusLabel(n.status)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-6 text-center text-sm text-slate-500">Không có chờ xử lý.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setOpenProfile((x) => !x)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-3 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-navy-900 to-navy-700 text-xs font-bold uppercase text-white">
              {(user?.name || '?').slice(0, 2)}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-bold text-navy-900 dark:text-white">{user?.name || 'Admin'}</p>
              <p className="text-[10px] font-semibold text-gold-600">{BRAND.adminProfile}</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{user?.role}</p>
            </div>
          </button>
          {openProfile && (
            <div className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-slate-200 bg-white py-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
              <Link
                to="/"
                className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setOpenProfile(false)}
              >
                Về trang chủ site
              </Link>
              <Link
                to="/admin/settings"
                className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setOpenProfile(false)}
              >
                Đổi mật khẩu / cài đặt
              </Link>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                onClick={() => logout()}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>

        <div className="hidden h-8 w-[1px] bg-slate-200 dark:bg-slate-700 sm:block" />
        <div className="hidden text-xs text-slate-400 md:block">{formatDate(new Date())}</div>
      </div>
    </header>
  );
}
