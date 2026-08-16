/**
 * Vietnamese Date Formatting Utilities
 * Handles timezone-safe parsing and formatting (DD/MM/YYYY, DD/MM/YYYY HH:mm)
 */

export function formatVNDate(value: string | Date | null | undefined): string {
  if (!value) return '';

  if (value instanceof Date) {
    const day = String(value.getDate()).padStart(2, '0');
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const year = value.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const str = String(value).trim();

  // If already in DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    return str;
  }

  // If format is YYYY-MM-DD (e.g. 2026-08-15)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [year, month, day] = str.split('-');
    return `${day}/${month}/${year}`;
  }

  // If format is YYYY-MM-DD HH:mm:ss or ISO
  if (str.includes('-') && str.length >= 10) {
    const datePart = str.substring(0, 10);
    const [year, month, day] = datePart.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
  }

  // Fallback to Date object parsing
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch {}

  return str;
}

export function formatVNDateTime(value: string | Date | null | undefined): string {
  if (!value) return '';

  try {
    const d = typeof value === 'string' ? new Date(value.replace(' ', 'T')) : value;
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
  } catch {}

  return formatVNDate(value);
}

export function formatVNDateFull(value: string | Date | null | undefined): string {
  if (!value) return '';

  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  try {
    let d: Date;
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      d = new Date(year, month - 1, day);
    } else {
      d = typeof value === 'string' ? new Date(value) : value;
    }

    if (!isNaN(d.getTime())) {
      const dayOfWeek = daysOfWeek[d.getDay()];
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${dayOfWeek}, ${day}/${month}/${year}`;
    }
  } catch {}

  return formatVNDate(value);
}
