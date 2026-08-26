import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Trả về chuỗi ngày dạng "YYYY-MM-DD" theo giờ địa phương (không dùng toISOString()
 * vì nó quy đổi sang UTC, có thể lệch 1 ngày tùy múi giờ trình duyệt).
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Trả về chuỗi ngày kế tiếp (dateStr + 1 ngày), cùng định dạng "YYYY-MM-DD". */
export function getNextDayString(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + 1);
  return getLocalDateString(d);
}

/** Parse "YYYY-MM-DD" thành Date theo giờ địa phương (tránh lệch ngày do new Date(str) hiểu là UTC). */
export function parseLocalDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

/** Chuẩn hóa giá trị ngày (Date của mat-datepicker hoặc string "YYYY-MM-DD") về cùng 1 dạng string để so sánh. */
function toComparableDateString(value: string | Date | null | undefined): string {
  if (!value) return '';
  return value instanceof Date ? getLocalDateString(value) : value;
}

export interface DateRangeValidatorOptions {
  /** Tên control chứa ngày nhận/bắt đầu trong FormGroup. Mặc định 'checkInDate'. */
  checkInControlName?: string;
  /** Tên control chứa ngày trả/kết thúc trong FormGroup. Mặc định 'checkOutDate'. */
  checkOutControlName?: string;
  /** true: checkIn phải >= hôm nay. Dùng false khi cho phép sửa booking đã tạo trong quá khứ. */
  minDateToday?: boolean;
}

/**
 * Validator dùng chung cho các FormGroup có 2 control ngày phụ thuộc lẫn nhau
 * (VD: booking-form checkInDate/checkOutDate, dashboard search bar).
 * Thay cho logic validateDates()/performSearch() từng viết tay lặp lại ở nhiều component.
 *
 * Lỗi trả về gắn ở cấp FormGroup (không phải control con), dạng:
 *   { checkInRequired: true } | { checkOutRequired: true } |
 *   { checkInPast: true } | { checkOutBeforeCheckIn: true }
 */
export function dateRangeValidator(options: DateRangeValidatorOptions = {}): ValidatorFn {
  const {
    checkInControlName = 'checkInDate',
    checkOutControlName = 'checkOutDate',
    minDateToday = true,
  } = options;

  return (group: AbstractControl): ValidationErrors | null => {
    const checkIn = toComparableDateString(group.get(checkInControlName)?.value);
    const checkOut = toComparableDateString(group.get(checkOutControlName)?.value);

    if (!checkIn) return { checkInRequired: true };
    if (!checkOut) return { checkOutRequired: true };

    if (minDateToday && checkIn < getLocalDateString()) {
      return { checkInPast: true };
    }

    if (checkOut <= checkIn) {
      return { checkOutBeforeCheckIn: true };
    }

    return null;
  };
}
