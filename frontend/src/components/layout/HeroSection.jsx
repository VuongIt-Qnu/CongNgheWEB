import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { BRAND } from '../../constants/branding';

export default function HeroSection({
  slides,
  badge = BRAND.full,
  primaryCta = { to: '/rooms', label: 'Khám phá căn hộ & biệt thự' },
  secondaryCta = { to: '/register', label: 'Đăng ký thành viên VIP' },
  children,
  fullScreen = true,
  className,
}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const scrollToContent = () => {
    const el = document.getElementById('hero-scroll-target');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      className={clsx(
        'relative w-full overflow-hidden bg-navy-900',
        fullScreen ? 'min-h-[100dvh]' : 'min-h-[72vh] min-h-[520px]',
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1 }}
          className="absolute inset-0"
        >
          <motion.img
            src={slides[currentSlide].image}
            alt=""
            initial={{ scale: 1.05 }}
            animate={{ scale: 1.12 }}
            transition={{ duration: 6, ease: 'easeOut' }}
            className="h-full w-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/30 via-navy-900/45 to-navy-900/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-900/60 via-transparent to-transparent" />

      <div className="relative mx-auto flex min-h-[inherit] max-w-7xl flex-col justify-center px-4 pb-28 pt-28 sm:px-6 lg:px-8 lg:pb-32 lg:pt-32">
        <motion.div
          key={`hero-text-${currentSlide}`}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.15 }}
          className="max-w-3xl space-y-5 text-white"
        >
          <span className="inline-flex items-center rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-gold-400 backdrop-blur-md">
            {badge}
          </span>
          <h1 className="text-heading-xl text-4xl font-bold leading-[1.12] sm:text-5xl md:text-6xl lg:text-[3.35rem]">
            {slides[currentSlide].title}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-slate-200/95 sm:text-lg">
            {slides[currentSlide].subtitle}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to={primaryCta.to}
              className="rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 px-7 py-3.5 text-sm font-bold text-navy-900 shadow-xl transition hover:scale-[1.02] hover:from-gold-600 hover:to-gold-700"
            >
              {primaryCta.label}
            </Link>
            {secondaryCta && (
              <Link
                to={secondaryCta.to}
                className="rounded-xl border border-white/35 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        </motion.div>

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mt-10 w-full max-w-5xl"
          >
            {children}
          </motion.div>
        )}
      </div>

      <div className="absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            className={clsx(
              'h-1.5 rounded-full transition-all duration-500',
              idx === currentSlide ? 'w-8 bg-gold-500' : 'w-2 bg-white/40 hover:bg-white/70'
            )}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-white/70 transition hover:text-white"
        aria-label="Cuộn xuống"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Khám phá</span>
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
          <ChevronDown className="h-6 w-6" />
        </motion.span>
      </button>
    </section>
  );
}
