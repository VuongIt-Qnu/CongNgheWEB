/** Chỉ cho phép đường dẫn nội bộ (giảm redirect mở). */
export function getSafeRedirect(value) {
  if (!value || typeof value !== 'string') return '';
  try {
    const decoded = decodeURIComponent(value.trim());
    if (!decoded.startsWith('/') || decoded.startsWith('//')) return '';
    return decoded;
  } catch {
    return '';
  }
}
