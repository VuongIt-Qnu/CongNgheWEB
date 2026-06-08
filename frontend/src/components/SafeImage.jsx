import { useState, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { hotelImages } from '../constants/images';
import { BRAND } from '../constants/branding';

const DEFAULT_FALLBACK =
  hotelImages.resort ||
  'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1200&q=80';

export default function SafeImage({
  src,
  alt = BRAND.full,
  className = '',
  containerClassName = '',
  fallbackSrc = DEFAULT_FALLBACK,
  aspectRatio = 'aspect-[16/11]',
  objectFit = 'cover',
  hoverZoom = false,
  onClick,
  priority = false,
}) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setLoading(true);
    setFailed(false);
  }, [src, fallbackSrc]);

  const finishLoad = useCallback(() => setLoading(false), []);

  const handleError = useCallback(() => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setLoading(true);
      return;
    }
    setFailed(true);
    setLoading(false);
  }, [imgSrc, fallbackSrc]);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    if (el.complete) {
      if (el.naturalWidth > 0) finishLoad();
      else if (imgSrc) handleError();
    }
  }, [imgSrc, finishLoad, handleError]);

  const fitClass =
    objectFit === 'contain' ? 'object-contain' : objectFit === 'fill' ? 'object-fill' : 'object-cover';

  return (
    <div
      className={clsx(
        'relative w-full overflow-hidden bg-slate-200/90',
        aspectRatio,
        containerClassName,
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      {loading && (
        <div className="absolute inset-0 z-10 shimmer bg-slate-200/95">
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500/25 border-t-gold-500" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Đang tải</span>
          </div>
        </div>
      )}

      <img
        ref={imgRef}
        src={imgSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={finishLoad}
        onError={handleError}
        className={clsx(
          'h-full w-full transition-all duration-700 ease-out',
          fitClass,
          loading ? 'scale-105 opacity-0 blur-sm' : 'scale-100 opacity-100 blur-0',
          hoverZoom && 'group-hover:scale-105 group-hover/card:scale-105',
          className
        )}
      />

      {failed && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-br from-navy-900 to-navy-800 p-4 text-center">
          <span className="text-2xl">🏨</span>
          <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gold-500">
            {BRAND.short} Resort
          </span>
        </div>
      )}
    </div>
  );
}
