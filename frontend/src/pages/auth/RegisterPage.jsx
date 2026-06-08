import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, User, Phone, Check, X } from 'lucide-react';

import api from '../../services/api';
import { getSafeRedirect } from '../../utils/redirectSafe';
import AuthLayout from '../../components/auth/AuthLayout';
import { BRAND } from '../../constants/branding';
import PasswordInput from '../../components/auth/PasswordInput';
import SocialLogin from '../../components/auth/SocialLogin';

/* ── Password strength calculator ── */
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score: 1, label: 'Yếu', color: 'bg-rose-500' };
  if (score <= 2) return { score: 2, label: 'Trung bình', color: 'bg-amber-500' };
  if (score <= 3) return { score: 3, label: 'Khá', color: 'bg-sky-500' };
  return { score: 4, label: 'Mạnh', color: 'bg-emerald-500' };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = getSafeRedirect(searchParams.get('redirect'));

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [errors, setErrors] = useState({});
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const passwordsMismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Vui lòng nhập họ tên';
    if (!form.email.trim()) errs.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email không hợp lệ';
    if (!form.password) errs.password = 'Vui lòng nhập mật khẩu';
    else if (form.password.length < 6) errs.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Mật khẩu không khớp';
    if (!agreed) errs.agreed = 'Vui lòng đồng ý với điều khoản';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      triggerShake();
      return;
    }
    try {
      setLoading(true);
      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login', {
        replace: true,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể đăng ký');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (key) =>
    `w-full rounded-xl border bg-white/80 py-3.5 pl-11 pr-4 text-sm font-medium text-navy-900 outline-none ring-gold-500/30 transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
      errors[key]
        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/30'
        : 'border-slate-200 hover:border-slate-300 focus:border-gold-500'
    }`;

  return (
    <AuthLayout
      heading="Tạo tài khoản"
      subtitle="Đăng ký miễn phí để đặt phòng, tích điểm thưởng và nhận ưu đãi độc quyền."
    >
      <motion.form
        onSubmit={submit}
        animate={shake ? { x: [0, -12, 12, -8, 8, 0] } : {}}
        transition={{ duration: 0.45 }}
        className="space-y-4"
      >
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="reg-name" className="text-sm font-semibold text-slate-700">
            Họ và tên
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <input
              ref={nameRef}
              id="reg-name"
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Nguyễn Văn A"
              className={inputCls('name')}
            />
          </div>
          {errors.name && <p className="text-xs font-medium text-rose-500">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="reg-email" className="text-sm font-semibold text-slate-700">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <input
              id="reg-email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="name@example.com"
              autoComplete="email"
              className={inputCls('email')}
            />
          </div>
          {errors.email && <p className="text-xs font-medium text-rose-500">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label htmlFor="reg-phone" className="text-sm font-semibold text-slate-700">
            Số điện thoại{' '}
            <span className="font-normal text-slate-400">(không bắt buộc)</span>
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <input
              id="reg-phone"
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="0901 234 567"
              className="w-full rounded-xl border border-slate-200 bg-white/80 py-3.5 pl-11 pr-4 text-sm font-medium text-navy-900 outline-none ring-gold-500/30 transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-gold-500 focus:bg-white focus:ring-2"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="reg-password" className="text-sm font-semibold text-slate-700">
            Mật khẩu
          </label>
          <PasswordInput
            id="reg-password"
            value={form.password}
            onChange={set('password')}
            placeholder="Tối thiểu 6 ký tự"
            autoComplete="new-password"
            icon={Lock}
            error={!!errors.password}
          />
          {errors.password && (
            <p className="text-xs font-medium text-rose-500">{errors.password}</p>
          )}
          {/* Strength indicator */}
          {form.password.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <div className="flex flex-1 gap-1">
                {[1, 2, 3, 4].map((lvl) => (
                  <div
                    key={lvl}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      lvl <= strength.score ? strength.color : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-slate-500">{strength.label}</span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="reg-confirm" className="text-sm font-semibold text-slate-700">
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <PasswordInput
              id="reg-confirm"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              icon={Lock}
              error={!!errors.confirmPassword}
            />
            {/* Match indicator */}
            {form.confirmPassword.length > 0 && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2">
                {passwordsMatch ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <X className="h-4 w-4 text-rose-400" />
                )}
              </div>
            )}
          </div>
          {errors.confirmPassword && (
            <p className="text-xs font-medium text-rose-500">{errors.confirmPassword}</p>
          )}
          {passwordsMismatch && !errors.confirmPassword && (
            <p className="text-xs font-medium text-amber-500">Mật khẩu chưa khớp</p>
          )}
        </div>

        {/* Terms */}
        <label className="flex cursor-pointer items-start gap-3 py-1">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-gold-500 accent-gold-500"
          />
          <span className="text-xs leading-relaxed text-slate-500">
            Tôi đồng ý với{' '}
            <span className="font-semibold text-navy-900 underline decoration-gold-400/40 underline-offset-2">
              Điều khoản sử dụng
            </span>{' '}
            và{' '}
            <span className="font-semibold text-navy-900 underline decoration-gold-400/40 underline-offset-2">
              Chính sách bảo mật
            </span>{' '}
            của {BRAND.full}.
          </span>
        </label>
        {errors.agreed && <p className="-mt-2 text-xs font-medium text-rose-500">{errors.agreed}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-navy-900/25 transition-all duration-300 hover:shadow-xl hover:shadow-navy-900/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-gold-500/0 via-gold-500/20 to-gold-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <span className="relative flex items-center gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tạo tài khoản...
              </>
            ) : (
              'Đăng ký'
            )}
          </span>
        </button>

        {/* Social Login */}
        <SocialLogin />

        {/* Login link */}
        <p className="pt-2 text-center text-sm text-slate-500">
          Đã có tài khoản?{' '}
          <Link
            to={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'}
            className="font-semibold text-navy-900 underline decoration-gold-400/40 decoration-2 underline-offset-2 transition-colors hover:text-gold-600 hover:decoration-gold-500"
          >
            Đăng nhập
          </Link>
        </p>
      </motion.form>
    </AuthLayout>
  );
}
