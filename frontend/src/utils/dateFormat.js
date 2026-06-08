import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/vi';

dayjs.extend(customParseFormat);
dayjs.locale('vi');

export const DATE_FMT = 'DD/MM/YYYY';
export const DATETIME_FMT = 'DD/MM/YYYY HH:mm';
export const DATETIME_FULL_FMT = 'DD/MM/YYYY HH:mm:ss';
export const ISO_DATE_FMT = 'YYYY-MM-DD';

function parseValue(value) {
  if (value == null || value === '') return null;
  const raw = String(value).trim();
  const byIso = dayjs(raw.slice(0, 10), ISO_DATE_FMT, true);
  if (byIso.isValid()) return byIso;
  const parsed = dayjs(raw);
  return parsed.isValid() ? parsed : null;
}

/** DD/MM/YYYY — hiển thị ngày */
export function formatDate(value) {
  const d = parseValue(value);
  if (!d) return value ? String(value) : '—';
  return d.format(DATE_FMT);
}

/** DD/MM/YYYY HH:mm */
export function formatDateTime(value) {
  const d = parseValue(value);
  if (!d) return value ? String(value) : '—';
  return d.format(DATETIME_FMT);
}

/** DD/MM/YYYY HH:mm:ss */
export function formatDateTimeFull(value) {
  const d = parseValue(value);
  if (!d) return value ? String(value) : '—';
  return d.format(DATETIME_FULL_FMT);
}

/** YYYY-MM-DD → DD/MM/YYYY hoặc DD/MM/YYYY - DD/MM/YYYY */
export function formatDateRange(from, to, separator = ' → ') {
  return `${formatDate(from)}${separator}${formatDate(to)}`;
}

/**
 * Kiểm tra chuỗi DD/MM/YYYY có đúng ngày lịch hợp lệ không.
 * Trả về true nếu: đúng format, ngày/tháng/năm nằm trong phạm vi hợp lệ,
 * và round-trip qua dayjs không đổi (bắt 31/02, 30/02, v.v.).
 */
export function isValidCalendarDate(str) {
  const trimmed = String(str || '').trim();
  // Phải đúng format DD/MM/YYYY (2 chữ số / 2 chữ số / 4 chữ số)
  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  // Kiểm tra phạm vi cơ bản
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;

  // Round-trip: parse rồi format lại phải khớp (bắt 31/02 → 03/03 v.v.)
  const d = dayjs(trimmed, DATE_FMT, true);
  if (!d.isValid()) return false;
  return d.format(DATE_FMT) === trimmed;
}

/** Chuyển DD/MM/YYYY → YYYY-MM-DD (ISO cho API) */
export function parseDisplayDate(str) {
  const trimmed = String(str || '').trim();
  if (!isValidCalendarDate(trimmed)) return null;
  const d = dayjs(trimmed, DATE_FMT, true);
  return d.format(ISO_DATE_FMT);
}

/** Lấy phần ngày ISO từ chuỗi datetime */
export function isoDatePart(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

/** Tháng biểu đồ: 2026-05 → 05/2026 */
export function formatMonthYear(ym) {
  const d = dayjs(`${ym}-01`, ISO_DATE_FMT, true);
  return d.isValid() ? d.format('MM/YYYY') : ym;
}

/** Nhãn ngắn biểu đồ: DD/MM */
export function formatChartDayLabel(isoDay) {
  const d = dayjs(isoDay, ISO_DATE_FMT, true);
  return d.isValid() ? d.format('DD/MM') : isoDay;
}

export function localTodayISO() {
  return dayjs().format(ISO_DATE_FMT);
}

export function addDaysISO(isoDay, days) {
  const d = dayjs(isoDay, ISO_DATE_FMT, true);
  if (!d.isValid()) return isoDay;
  return d.add(Number(days), 'day').format(ISO_DATE_FMT);
}

export function subtractDaysISO(isoDay, days) {
  const d = dayjs(isoDay || localTodayISO(), ISO_DATE_FMT, true);
  return d.subtract(Number(days), 'day').format(ISO_DATE_FMT);
}

export function nightsBetween(checkIn, checkOut) {
  const ci = dayjs(checkIn, ISO_DATE_FMT, true);
  const co = dayjs(checkOut, ISO_DATE_FMT, true);
  if (!ci.isValid() || !co.isValid()) return 1;
  const n = co.diff(ci, 'day');
  return Math.max(1, n);
}

export function isCheckOutAfterCheckIn(checkIn, checkOut) {
  const ci = dayjs(checkIn, ISO_DATE_FMT, true);
  const co = dayjs(checkOut, ISO_DATE_FMT, true);
  if (!ci.isValid() || !co.isValid()) return false;
  return co.isAfter(ci);
}

export function currentMonthKey() {
  return dayjs().format('YYYY-MM');
}
