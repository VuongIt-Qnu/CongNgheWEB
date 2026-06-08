import clsx from 'clsx';
import { motion } from 'framer-motion';
import SafeImage from './SafeImage';

export default function ImageCard({
  src,
  alt = 'Aurora Gallery',
  title,
  subtitle,
  aspectRatio = 'aspect-[4/3]',
  containerClassName = '',
  imageClassName = '',
  objectFit = 'cover',
  hoverZoom = true,
  onClick,
  overlayOpacity = 'opacity-0 group-hover:opacity-100',
  titleColor = 'text-white',
  subtitleColor = 'text-gold-400',
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'group relative overflow-hidden rounded-[24px] md:rounded-[32px] bg-slate-900',
        'shadow-[0_8px_30px_rgba(10,26,54,0.06)] border border-white/5',
        'transition-all duration-500 ease-out-expo hover:-translate-y-1.5 hover:shadow-[0_25px_55px_rgba(10,26,54,0.18)] hover:border-gold-500/20',
        onClick && 'cursor-pointer',
        containerClassName
      )}
    >
      {/* 1. Safe Image Component */}
      <SafeImage
        src={src}
        alt={alt}
        aspectRatio={aspectRatio}
        objectFit={objectFit}
        hoverZoom={hoverZoom}
        className={imageClassName}
      />

      {/* 2. Premium Luxury Dark Gradient Overlay */}
      <div
        className={clsx(
          'absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/30 to-transparent',
          'transition-opacity duration-500 ease-out-expo pointer-events-none',
          overlayOpacity
        )}
      />

      {/* 3. Sliding Text Captions (Only shown if title/subtitle is provided) */}
      {(title || subtitle) && (
        <div className="absolute inset-x-0 bottom-0 z-20 p-6 md:p-8 flex flex-col justify-end text-left pointer-events-none transform translate-y-3 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          {subtitle && (
            <p className={clsx('text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-1.5', subtitleColor)}>
              {subtitle}
            </p>
          )}
          {title && (
            <h4 className={clsx('text-base md:text-lg font-bold tracking-wide font-display leading-tight', titleColor)}>
              {title}
            </h4>
          )}
        </div>
      )}
    </div>
  );
}
