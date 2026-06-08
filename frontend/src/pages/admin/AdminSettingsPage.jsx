import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Building2, KeyRound } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';
import { BRAND, LOCATION } from '../../constants/branding';

export default function AdminSettingsPage() {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [hotel, setHotel] = useState({
    hotel_name: '',
    hotel_email: '',
    hotel_phone: '',
    hotel_address: '',
    logo_url: '',
    banner_url: '',
  });

  const [pwd, setPwd] = useState({ current_password: '', new_password: '', confirm: '' });

  useEffect(() => {
    api
      .get('/settings')
      .then(({ data }) => {
        setHotel((h) => ({ ...h, ...data }));
      })
      .catch(() => toast.error('Không tải được cài đặt'));
  }, []);

  const saveHotel = async () => {
    if (!isAdmin) return;
    try {
      await api.put('/settings', hotel);
      toast.success('Đã cập nhật thông tin khách sạn');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lưu thất bại');
    }
  };

  const savePassword = async () => {
    if (pwd.new_password !== pwd.confirm) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }
    try {
      await api.put('/auth/me/password', {
        current_password: pwd.current_password,
        new_password: pwd.new_password,
      });
      toast.success('Đã đổi mật khẩu');
      setPwd({ current_password: '', new_password: '', confirm: '' });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Đổi mật khẩu thất bại');
    }
  };

  const input =
    'w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium outline-none ring-gold-500/25 focus:ring-2 dark:border-slate-600 dark:bg-slate-950';

  const card = clsx(
    'rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition',
    'dark:border-slate-700 dark:bg-slate-900/70'
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-900 dark:text-white lg:text-3xl">Cài đặt</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Thông tin khách sạn, logo · banner và bảo mật tài khoản.</p>
      </div>

      <section className={card}>
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gold-500/15 text-gold-600 dark:text-gold-400">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy-900 dark:text-white">Thông tin khách sạn</h2>
            {!isAdmin && <p className="text-xs text-amber-600 dark:text-amber-400">Chỉ Admin có thể chỉnh và lưu mục này.</p>}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Tên khách sạn</span>
            <input
              disabled={!isAdmin}
              className={input}
              placeholder={BRAND.full}
              value={hotel.hotel_name}
              onChange={(e) => setHotel({ ...hotel, hotel_name: e.target.value })}
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Email</span>
            <input
              disabled={!isAdmin}
              type="email"
              className={input}
              value={hotel.hotel_email}
              onChange={(e) => setHotel({ ...hotel, hotel_email: e.target.value })}
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Điện thoại</span>
            <input
              disabled={!isAdmin}
              className={input}
              value={hotel.hotel_phone}
              onChange={(e) => setHotel({ ...hotel, hotel_phone: e.target.value })}
            />
          </label>
          <label className="grid gap-1.5 text-sm sm:col-span-2">
            <span className="font-semibold">Địa chỉ</span>
            <input
              disabled={!isAdmin}
              className={input}
              placeholder={LOCATION.fullAddress}
              value={hotel.hotel_address}
              onChange={(e) => setHotel({ ...hotel, hotel_address: e.target.value })}
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">URL logo</span>
            <input
              disabled={!isAdmin}
              className={input}
              placeholder="https://..."
              value={hotel.logo_url}
              onChange={(e) => setHotel({ ...hotel, logo_url: e.target.value })}
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">URL banner</span>
            <input
              disabled={!isAdmin}
              className={input}
              placeholder="https://..."
              value={hotel.banner_url}
              onChange={(e) => setHotel({ ...hotel, banner_url: e.target.value })}
            />
          </label>
        </div>
        {isAdmin && (
          <div className="mt-6 flex justify-end">
            <button type="button" className="rounded-xl bg-navy-900 px-6 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-navy-900" onClick={saveHotel}>
              Lưu thông tin
            </button>
          </div>
        )}
      </section>

      <section className={card}>
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy-900 dark:text-white">Đổi mật khẩu</h2>
            <p className="text-xs text-slate-500">Áp dụng cho tài khoản đang đăng nhập.</p>
          </div>
        </div>
        <div className="grid max-w-lg gap-4">
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Mật khẩu hiện tại</span>
            <input
              type="password"
              className={input}
              value={pwd.current_password}
              onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })}
              autoComplete="current-password"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Mật khẩu mới</span>
            <input
              type="password"
              className={input}
              value={pwd.new_password}
              onChange={(e) => setPwd({ ...pwd, new_password: e.target.value })}
              autoComplete="new-password"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Xác nhận mật khẩu</span>
            <input
              type="password"
              className={input}
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              autoComplete="new-password"
            />
          </label>
          <button type="button" className="w-fit rounded-xl border border-navy-900 px-6 py-2.5 text-sm font-bold dark:border-white dark:text-white" onClick={savePassword}>
            Cập nhật mật khẩu
          </button>
        </div>
      </section>
    </div>
  );
}
