import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Save, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PersonalInfoForm({ user, onSave }) {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Họ tên không được để trống';
    if (phone.trim() && !/^0\d{9}$/.test(phone.trim())) {
      e.phone = 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      await onSave({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      toast.success('Đã cập nhật thông tin cá nhân');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không thể cập nhật');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-card sm:p-8"
    >
      <div className="mb-6">
        <h2 className="text-heading text-lg font-bold text-navy-900">Thông tin cá nhân</h2>
        <p className="mt-1 text-sm text-slate-500">Cập nhật thông tin hiển thị của bạn</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">
            Họ và tên <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="Nguyễn Văn A"
              className={`w-full rounded-xl border bg-slate-50/80 py-3 pl-11 pr-4 text-sm font-medium text-navy-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
                errors.name
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/30'
                  : 'border-slate-200 hover:border-slate-300 focus:border-gold-500 focus:ring-gold-500/30'
              }`}
            />
          </div>
          {errors.name && <p className="mt-1 text-xs font-semibold text-rose-500">{errors.name}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">
            Số điện thoại
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
              }}
              placeholder="0901234567"
              className={`w-full rounded-xl border bg-slate-50/80 py-3 pl-11 pr-4 text-sm font-medium text-navy-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
                errors.phone
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/30'
                  : 'border-slate-200 hover:border-slate-300 focus:border-gold-500 focus:ring-gold-500/30'
              }`}
            />
          </div>
          {errors.phone && <p className="mt-1 text-xs font-semibold text-rose-500">{errors.phone}</p>}
        </div>

        {/* Address */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">
            Địa chỉ
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
              rows={2}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-sm font-medium text-navy-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-gold-500 focus:bg-white focus:ring-2 focus:ring-gold-500/30"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
