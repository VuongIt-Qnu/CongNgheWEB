import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock } from 'lucide-react';

import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { getSafeRedirect } from '../../utils/redirectSafe';
import AuthLayout from '../../components/auth/AuthLayout';
import PasswordInput from '../../components/auth/PasswordInput';
import SocialLogin from '../../components/auth/SocialLogin';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = getSafeRedirect(searchParams.get('redirect'));
  const { login, isAuthenticated, role } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  if (isAuthenticated) {
    const target = ['admin', 'staff'].includes(role) ? '/admin/dashboard' : redirect || '/';
    return <Navigate to={target} replace />;
  }

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      triggerShake();
      return;
    }
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      login(response.data);
      toast.success('Đăng nhập thành công!');
      const okRedirect =
        redirect && !['admin', 'staff'].includes(response.data.user.role) ? redirect : '/';
      const target = ['admin', 'staff'].includes(response.data.user.role)
        ? '/admin/dashboard'
        : okRedirect;
      navigate(target || '/', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Chào mừng trở lại"
      subtitle="Đăng nhập để quản lý đặt phòng, theo dõi kỳ nghỉ và trải nghiệm dịch vụ cao cấp."
    >
      <motion.form
        onSubmit={submit}
        animate={shake ? { x: [0, -12, 12, -8, 8, 0] } : {}}
        transition={{ duration: 0.45 }}
        className="space-y-5"
      >
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-sm font-semibold text-slate-700">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <input
              ref={emailRef}
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 bg-white/80 py-3.5 pl-11 pr-4 text-sm font-medium text-navy-900 outline-none ring-gold-500/30 transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-gold-500 focus:bg-white focus:ring-2"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-semibold text-slate-700">
              Mật khẩu
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-gold-600 transition-colors hover:text-gold-700"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <PasswordInput
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={Lock}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-navy-900/25 transition-all duration-300 hover:shadow-xl hover:shadow-navy-900/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {/* Hover glow effect */}
          <span className="absolute inset-0 bg-gradient-to-r from-gold-500/0 via-gold-500/20 to-gold-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <span className="relative flex items-center gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Đăng nhập'
            )}
          </span>
        </button>

        {/* Social Login */}
        <SocialLogin />

        {/* Register link */}
        <p className="pt-2 text-center text-sm text-slate-500">
          Chưa có tài khoản?{' '}
          <Link
            to={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'}
            className="font-semibold text-navy-900 underline decoration-gold-400/40 decoration-2 underline-offset-2 transition-colors hover:text-gold-600 hover:decoration-gold-500"
          >
            Tạo tài khoản miễn phí
          </Link>
        </p>
      </motion.form>
    </AuthLayout>
  );
}
