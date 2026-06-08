import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Mail, Send } from 'lucide-react';

import AuthLayout from '../../components/auth/AuthLayout';
import { requestPasswordReset } from '../../services/authApi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }
    try {
      setLoading(true);
      const data = await requestPasswordReset(email.trim());
      setSubmitted(true);
      toast.success(data.message || 'Đã gửi liên kết đặt lại mật khẩu');
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        'Không thể gửi yêu cầu. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Quên mật khẩu"
      subtitle="Nhập email đăng ký tài khoản. Chúng tôi sẽ gửi liên kết đặt lại mật khẩu nếu email tồn tại trong hệ thống."
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-md sm:p-8"
      >
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5 text-center"
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <Send className="h-7 w-7" />
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              Nếu tài khoản tồn tại, liên kết đặt lại mật khẩu đã được gửi tới email của bạn.
              Vui lòng kiểm tra hộp thư (và thư mục spam).
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gold-600 hover:text-gold-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại đăng nhập
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="forgot-email" className="text-sm font-semibold text-slate-700">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                <input
                  ref={emailRef}
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 bg-white/80 py-3.5 pl-11 pr-4 text-sm font-medium text-navy-900 outline-none ring-gold-500/30 transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-gold-500 focus:bg-white focus:ring-2"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-navy-900/25 transition-all duration-300 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                'Gửi liên kết đặt lại mật khẩu'
              )}
            </button>

            <p className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-navy-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại đăng nhập
              </Link>
            </p>
          </form>
        )}
      </motion.div>
    </AuthLayout>
  );
}
