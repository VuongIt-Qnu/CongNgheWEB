import { motion } from 'framer-motion';
import { Calendar, Camera, Crown, Mail, MapPin, Phone, Shield, User } from 'lucide-react';
import { API_HOST } from '../../services/api';
import { formatDate } from '../../utils/dateFormat';

const ROLE_MAP = {
  admin: { label: 'Quản trị viên', color: 'bg-rose-500/15 text-rose-700 ring-rose-500/30' },
  staff: { label: 'Nhân viên', color: 'bg-sky-500/15 text-sky-700 ring-sky-500/30' },
  customer: { label: 'Khách hàng', color: 'bg-emerald-500/15 text-emerald-700 ring-emerald-500/30' },
};

function AvatarFallback({ name }) {
  const initials = (name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gold-500 to-gold-600 text-3xl font-bold text-white sm:text-4xl">
      {initials}
    </div>
  );
}

export default function ProfileHeader({ user, onAvatarClick }) {
  if (!user) return null;

  const avatarSrc = user.avatar_url
    ? user.avatar_url.startsWith('http')
      ? user.avatar_url
      : `${API_HOST}${user.avatar_url}`
    : null;

  const role = ROLE_MAP[user.role] || ROLE_MAP.customer;
  const createdDate = formatDate(user.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-luxury"
    >
      {/* Gradient Banner */}
      <div className="h-36 bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 sm:h-44">
        <div className="absolute inset-x-0 top-0 h-36 sm:h-44">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(198,169,106,0.2),_transparent_60%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/10 to-transparent" />
        </div>
      </div>

      {/* Content */}
      <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
        {/* Avatar */}
        <div className="-mt-16 mb-4 flex items-end gap-5 sm:-mt-20 sm:gap-6">
          <button
            type="button"
            onClick={onAvatarClick}
            className="group relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl border-4 border-white shadow-lg transition-transform duration-300 hover:scale-[1.03] sm:h-36 sm:w-36 sm:rounded-3xl"
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div style={{ display: avatarSrc ? 'none' : 'flex' }} className="h-full w-full">
              <AvatarFallback name={user.name} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-navy-900/0 transition-colors duration-300 group-hover:bg-navy-900/50">
              <Camera className="h-6 w-6 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          </button>

          <div className="min-w-0 pb-1">
            <h1 className="text-heading-lg truncate text-2xl font-bold text-navy-900 sm:text-3xl">
              {user.name || 'Người dùng'}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ${role.color}`}
              >
                {user.role === 'admin' ? (
                  <Crown className="h-3 w-3" />
                ) : (
                  <Shield className="h-3 w-3" />
                )}
                {role.label}
              </span>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem icon={Mail} label="Email" value={user.email} />
          <InfoItem icon={Phone} label="Điện thoại" value={user.phone || 'Chưa cập nhật'} muted={!user.phone} />
          <InfoItem icon={MapPin} label="Địa chỉ" value={user.address || 'Chưa cập nhật'} muted={!user.address} />
          <InfoItem icon={Calendar} label="Tham gia" value={createdDate} />
        </div>
      </div>
    </motion.div>
  );
}

function InfoItem({ icon: Icon, label, value, muted }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50/80 px-4 py-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-navy-900/5">
        <Icon className="h-4 w-4 text-navy-900/60" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className={`truncate text-sm font-semibold ${muted ? 'text-slate-400 italic' : 'text-navy-900'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
