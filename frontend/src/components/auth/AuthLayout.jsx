import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import SafeImage from '../SafeImage';
import { BRAND, LOCATION } from '../../constants/branding';

const AUTH_HERO_IMAGE =
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1800&q=85';

const testimonial = {
  text: `Kỳ nghỉ tuyệt vời nhất tại ${LOCATION.city}. Dịch vụ hoàn hảo, view biển Quy Nhơn đẹp mê hồn.`,
  author: 'Nguyễn Minh Anh',
  title: 'Khách hàng VIP',
};

export default function AuthLayout({ children, heading, subtitle }) {
  return (
    <section className="relative grid min-h-screen lg:grid-cols-2">
      {/* ── LEFT HERO ── */}
      <div className="relative hidden overflow-hidden lg:block">
        <SafeImage
          src={AUTH_HERO_IMAGE}
          alt={BRAND.full}
          aspectRatio=""
          containerClassName="absolute inset-0 h-full w-full"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 z-10 pointer-events-none" />

        {/* Floating decorative shapes */}
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-navy-900/30 blur-3xl" />

        {/* Content overlay */}
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          {/* Top: Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-500/25">
                <span className="text-lg font-black text-white">A</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-400">
                  {BRAND.full}
                </p>
                <p className="text-[11px] font-medium text-white/60">{BRAND.tagline}</p>
              </div>
            </div>
          </motion.div>

          {/* Middle: Slogan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="max-w-lg"
          >
            <h2 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
              Nơi mỗi khoảnh khắc
              <span className="mt-2 block bg-gradient-to-r from-gold-300 to-gold-500 bg-clip-text text-transparent">
                trở thành kỷ niệm
              </span>
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/70">
              Trải nghiệm nghỉ dưỡng đẳng cấp 5 sao bên bờ biển {LOCATION.city}, {LOCATION.province} — nơi sự sang trọng hòa quyện cùng thiên nhiên ven biển.
            </p>
          </motion.div>

          {/* Bottom: Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
            className="max-w-md rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-md"
          >
            <Quote className="mb-3 h-6 w-6 text-gold-400/60" />
            <p className="text-sm leading-relaxed text-white/90 italic">
              "{testimonial.text}"
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-xs font-bold text-white shadow">
                {testimonial.author.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{testimonial.author}</p>
                <p className="text-xs text-white/50">{testimonial.title}</p>
              </div>
              <div className="ml-auto flex gap-0.5 text-gold-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT FORM ── */}
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 px-5 py-10 sm:px-8 lg:min-h-0 lg:px-12 xl:px-20">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-gold-500/[0.04] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-navy-900/[0.03] blur-3xl" />

        {/* Mobile brand header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center gap-2.5 lg:hidden"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-500/25">
            <span className="text-base font-black text-white">A</span>
          </div>
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-navy-900">
            {BRAND.resort}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Heading */}
          {heading && (
            <div className="mb-8">
              <h1 className="text-[28px] font-bold tracking-tight text-navy-900 sm:text-3xl">
                {heading}
              </h1>
              {subtitle && (
                <p className="mt-2 text-[15px] leading-relaxed text-slate-500">{subtitle}</p>
              )}
            </div>
          )}

          {/* Form content slot */}
          {children}
        </motion.div>

        {/* Footer copyright */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 text-center text-xs text-slate-400"
        >
          {BRAND.copyright()} All rights reserved.
        </motion.p>
      </div>
    </section>
  );
}
