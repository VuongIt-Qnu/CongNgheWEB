import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Lock } from 'lucide-react';

import AuthLayout from '../../components/auth/AuthLayout';
import PasswordInput from '../../components/auth/PasswordInput';
import { resetPassword } from '../../services/authApi';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!token) {
      toast.error('Liên kết không hợp lệ');
    }
  }, [token]);

  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 3000);
    return () => clearTimeout(timer);
  }, [success, navigate]);

  const validate = () => {
    const errs = {};
    if (!newPassword) errs.newPassword = 'Vui lòng nhập mật khẩu mới';
    else if (newPassword.length < 6) errs.newPassword = 'Mật khẩu tối thiểu 6 ký tự';
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Mật khẩu không khớp';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!token) {
      toast.error('Liên kết không hợp lệ');
      return;
    }
    if (!validate()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }
    try {
      setLoading(true);
      const data = await resetPassword(token, newPassword, confirmPassword);
      setSuccess(true);
      toast.success(data.message || 'Đặt lại mật khẩu thành công');
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        'Không thể đặt lại mật khẩu. Liên kết có thể đã hết hạn.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Đặt lại mật khẩu"
      subtitle="Nhập mật khẩu mới cho tài khoản Aurora Resort của bạn."
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-md sm:p-8"
      >
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5 text-center"
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h2 className="text-lg font-bold text-navy-900">
              Mật khẩu đã được cập nhật thành công
            </h2>
            <p className="text-sm text-slate-500">
              Bạn sẽ được chuyển về trang đăng nhập sau 3 giây...
            </p>
            <Link
              to="/login"
              className="inline-block text-sm font-semibold text-gold-600 hover:text-gold-700"
            >
              Đăng nhập ngay
            </Link>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={submit}
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="space-y-1.5">
              <label htmlFor="reset-password" className="text-sm font-semibold text-slate-700">
                Mật khẩu mới
              </label>
              <PasswordInput
                id="reset-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
                icon={Lock}
                error={errors.newPassword}
              />
              {errors.newPassword && (
                <p className="text-xs text-rose-500">{errors.newPassword}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reset-confirm" className="text-sm font-semibold text-slate-700">
                Nhập lại mật khẩu
              </label>
              <PasswordInput
                id="reset-confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                icon={Lock}
                error={errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-rose-500">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-navy-900/25 transition-all duration-300 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Đặt lại mật khẩu'
              )}
            </button>

            <p className="text-center text-sm text-slate-500">
              <Link to="/login" className="font-semibold text-navy-900 hover:text-gold-600">
                Quay lại đăng nhập
              </Link>
            </p>
          </motion.form>
        )}
      </motion.div>
    </AuthLayout>
  );
}
