import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ImagePlus, Upload, X, ZoomIn } from 'lucide-react';
import toast from 'react-hot-toast';

const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Utility: crop image from canvas and return a Blob.
 */
async function getCroppedBlob(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (e) => reject(e));
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

export default function AvatarUpload({ open, onClose, onUpload }) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh (JPG, PNG, WEBP, GIF)');
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('Kích thước ảnh tối đa 5MB');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer?.files?.[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = (e) => {
    handleFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleUpload = async () => {
    if (!preview || !croppedAreaPixels) return;
    try {
      setUploading(true);
      const blob = await getCroppedBlob(preview, croppedAreaPixels);
      const file = new File([blob], fileName || 'avatar.jpg', { type: 'image/jpeg' });
      await onUpload(file);
      reset();
      onClose();
    } catch (err) {
      toast.error('Tải ảnh thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setFileName('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative mx-4 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-luxury"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-gold-500" />
                <h3 className="text-lg font-bold text-navy-900">Cập nhật ảnh đại diện</h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {!preview ? (
                /* Drop zone */
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed py-16 transition-colors duration-200 ${
                    dragOver
                      ? 'border-gold-500 bg-gold-500/5'
                      : 'border-slate-200 bg-slate-50/50 hover:border-gold-500/40 hover:bg-slate-50'
                  }`}
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900/5">
                    <ImagePlus className="h-8 w-8 text-navy-900/40" />
                  </div>
                  <p className="text-sm font-semibold text-navy-900">Kéo thả ảnh vào đây</p>
                  <p className="mt-1 text-xs text-slate-400">hoặc nhấn để chọn file · JPG, PNG, WEBP · Tối đa 5MB</p>
                  <input
                    type="file"
                    accept={ACCEPTED}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                </label>
              ) : (
                /* Cropper */
                <div>
                  <div className="relative mx-auto h-72 w-72 overflow-hidden rounded-2xl bg-slate-900 sm:h-80 sm:w-80">
                    <Cropper
                      image={preview}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="round"
                      showGrid={false}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <ZoomIn className="h-4 w-4 text-slate-400" />
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.05}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-gold-500 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={reset}
                    className="mt-2 text-xs font-semibold text-slate-400 transition hover:text-rose-500"
                  >
                    Chọn ảnh khác
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {preview && (
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={uploading}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Lưu ảnh đại diện
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
