import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Hotel, Mail, MapPin, Phone, Send, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { BRAND, LOCATION } from '../../constants/branding';

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function Footer() {
  const [email, setEmail] = useState('');

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-5">
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-navy-900">
              <Hotel className="h-6 w-6 text-gold-500" />
              {BRAND.full}
            </Link>
            <p className="text-body-sm text-slate-500">
              Resort cao cấp bên bờ biển {LOCATION.city} — nơi hội tụ thiên nhiên ven biển Bình Định và
              dịch vụ sang trọng chuẩn 5 sao quốc tế.
            </p>
            <div className="flex gap-3">
              {[
                { href: 'https://facebook.com', label: 'Facebook', Icon: FacebookIcon },
                { href: 'https://instagram.com', label: 'Instagram', Icon: InstagramIcon },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:border-gold-500 hover:bg-gold-500 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-title text-sm font-bold uppercase tracking-wide text-navy-900">
              Khám phá
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/rooms" className="transition hover:text-gold-600">Phòng & Suite</Link></li>
              <li><Link to="/rooms" className="transition hover:text-gold-600">Biệt thự hướng biển</Link></li>
              <li><Link to="/" className="transition hover:text-gold-600">Ẩm thực & Spa</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-title text-sm font-bold uppercase tracking-wide text-navy-900">
              Hỗ trợ
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/my-bookings" className="transition hover:text-gold-600">Hướng dẫn nhận phòng</Link></li>
              <li>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="h-4 w-4 shrink-0 text-gold-500" />
                  {LOCATION.fullAddress}
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-title text-sm font-bold uppercase tracking-wide text-navy-900">
              Ưu đãi VIP
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!email.trim()) return;
                toast.success('Đăng ký bản tin thành công!', { icon: '🎁' });
                setEmail('');
              }}
              className="flex gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email của bạn"
                required
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-gold-500 focus:bg-white"
              />
              <button
                type="submit"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-900 text-white hover:bg-gold-500"
                aria-label="Gửi"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-100 pt-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex flex-wrap items-center gap-1.5">
            <span>{BRAND.copyright()}</span>
            <ShieldCheck className="h-3.5 w-3.5 text-gold-500" />
            <span>Chuẩn 5 sao quốc tế</span>
          </p>
          <div className="flex flex-wrap gap-4">
            <a href={`tel:${LOCATION.phone.replace(/\s/g, '')}`} className="flex items-center gap-1 hover:text-navy-900">
              <Phone className="h-3.5 w-3.5 text-gold-500" /> Hotline: {LOCATION.phoneDisplay}
            </a>
            <a href={`mailto:${LOCATION.email}`} className="flex items-center gap-1 hover:text-navy-900">
              <Mail className="h-3.5 w-3.5 text-gold-500" /> {LOCATION.email}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
