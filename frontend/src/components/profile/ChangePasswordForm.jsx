import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Eye, EyeOff, Key, Lock, LogOut, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

function getStrength(pw) {
  if (!pw) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { level: 1, label: 'Yếu', color: 'bg-rose-500' };
  if (score <= 3) return { level: 2, label: 'Trung bình', color: 'bg-amber-500' };
  return { level: 3, label: 'Mạnh', color: 'bg-emerald-500' };
}

function PasswordField({ id, label, value, onChange, error, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">
        {label}
      </label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border bg-slate-50/80 py-3 pl-11 pr-12 text-sm font-medium text-navy-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/30'
              : 'border-slate-200 hover:border-slate-300 focus:border-gold-500 focus:ring-gold-500/30'
          }`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:text-navy-900"
          aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs font-semibold text-rose-500">{error}</p>}
    </div>
  );
}

export default function ChangePasswordForm({ onChangePassword, onLogout }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const strength = useMemo(() => getStrength(newPassword), [newPassword]);

  const validate = () => {
    const e = {};
    if (!currentPassword) e.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    if (!newPassword) e.newPassword = 'Vui lòng nhập mật khẩu mới';
    else if (newPassword.length < 6) e.newPassword = 'Mật khẩu mới tối thiểu 6 ký tự';
    if (!confirmPassword) e.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    else if (newPassword !== confirmPassword) e.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      await onChangePassword({ current_password: currentPassword, new_password: newPassword });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      toast.success('Đổi mật khẩu thành công! Đăng xuất sau 5 giây...');

      let sec = 5;
      setCountdown(sec);
      const timer = setInterval(() => {
        sec -= 1;
        setCountdown(sec);
        if (sec <= 0) {
          clearInterval(timer);
          onLogout();
        }
      }, 1000);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Đổi mật khẩu thất bại';
      toast.error(msg);
      if (msg.includes('hiện tại')) {
        setErrors({ currentPassword: msg });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-card sm:p-8"
    >
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-gold-500" />
          <h2 className="text-heading text-lg font-bold text-navy-900">Bảo mật tài khoản</h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">Thay đổi mật khẩu để bảo vệ tài khoản</p>
      </div>

      {success && countdown > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3">
          <LogOut className="h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Đổi mật khẩu thành công</p>
            <p className="text-xs text-amber-600">
              Tự động đăng xuất sau <span className="font-bold">{countdown}</span> giây...
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordField
          id="current-password"
          label="Mật khẩu hiện tại"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            if (errors.currentPassword) setErrors((p) => ({ ...p, currentPassword: '' }));
          }}
          error={errors.currentPassword}
          placeholder="Nhập mật khẩu hiện tại"
          autoComplete="current-password"
        />

        <div>
          <PasswordField
            id="new-password"
            label="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (errors.newPassword) setErrors((p) => ({ ...p, newPassword: '' }));
            }}
            error={errors.newPassword}
            placeholder="Tối thiểu 6 ký tự"
            autoComplete="new-password"
          />
          {/* Strength indicator */}
          {newPassword && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= strength.level ? strength.color : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1 text-[11px] font-semibold text-slate-500">
                Độ mạnh:{' '}
                <span
                  className={
                    strength.level === 1
                      ? 'text-rose-600'
                      : strength.level === 2
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }
                >
                  {strength.label}
                </span>
              </p>
            </div>
          )}
        </div>

        <PasswordField
          id="confirm-password"
          label="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: '' }));
          }}
          error={errors.confirmPassword}
          placeholder="Nhập lại mật khẩu mới"
          autoComplete="new-password"
        />

        {/* Security note */}
        <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
          <p className="text-xs text-slate-500">
            Sau khi đổi mật khẩu, bạn sẽ được tự động đăng xuất và cần đăng nhập lại bằng mật khẩu mới.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || success}
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Key className="h-4 w-4" />
                Đổi mật khẩu
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
