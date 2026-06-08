/**
 * Kiểm thử đơn vị — Hàm tiện ích thật của dự án
 *
 * Import và test các hàm từ:
 * - src/utils/dateFormat.js
 * - src/utils/roomMeta.js
 * - src/utils/storage.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── dateFormat.js ───────────────────────────────────────────
import {
  formatDate,
  formatDateTime,
  formatDateRange,
  parseDisplayDate,
  isoDatePart,
  nightsBetween,
  isCheckOutAfterCheckIn,
  addDaysISO,
  subtractDaysISO,
  formatMonthYear,
  formatChartDayLabel,
} from '../utils/dateFormat';

// ─── roomMeta.js ─────────────────────────────────────────────
import {
  resolveRoomImageUrl,
  getDisplayPricing,
  getRoomStatusPresentation,
  amenityPresetKeyFromTypeName,
  amenitiesForRoomType,
} from '../utils/roomMeta';

// ─── storage.js ──────────────────────────────────────────────
import { storageGet, storageSet, storageRemove } from '../utils/storage';

// ═══════════════════════════════════════════════════════════════
// dateFormat.js
// ═══════════════════════════════════════════════════════════════
describe('dateFormat — formatDate()', () => {
  it('chuyển ISO YYYY-MM-DD sang DD/MM/YYYY', () => {
    expect(formatDate('2024-06-15')).toBe('15/06/2024');
  });

  it('trả về "—" khi giá trị rỗng hoặc null', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate('')).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });

  it('xử lý chuỗi ISO có phần giờ', () => {
    expect(formatDate('2024-06-15T10:30:00.000Z')).toBe('15/06/2024');
  });
});

describe('dateFormat — formatDateTime()', () => {
  it('trả về định dạng DD/MM/YYYY HH:mm', () => {
    const result = formatDateTime('2024-06-15T10:30:00');
    expect(result).toContain('15/06/2024');
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it('trả về "—" khi giá trị không hợp lệ', () => {
    expect(formatDateTime(null)).toBe('—');
  });
});

describe('dateFormat — formatDateRange()', () => {
  it('tạo chuỗi phạm vi ngày đúng', () => {
    const result = formatDateRange('2024-06-10', '2024-06-15');
    expect(result).toBe('10/06/2024 → 15/06/2024');
  });

  it('dùng separator tùy chỉnh', () => {
    const result = formatDateRange('2024-06-10', '2024-06-15', ' - ');
    expect(result).toBe('10/06/2024 - 15/06/2024');
  });
});

describe('dateFormat — parseDisplayDate()', () => {
  it('chuyển DD/MM/YYYY sang YYYY-MM-DD (ISO)', () => {
    expect(parseDisplayDate('15/06/2024')).toBe('2024-06-15');
  });

  it('trả về null khi chuỗi không đúng định dạng', () => {
    expect(parseDisplayDate('2024-06-15')).toBeNull();
    expect(parseDisplayDate('abc')).toBeNull();
    expect(parseDisplayDate('')).toBeNull();
  });
});

describe('dateFormat — isoDatePart()', () => {
  it('trích xuất phần ngày từ chuỗi ISO datetime', () => {
    expect(isoDatePart('2024-06-15T10:30:00.000Z')).toBe('2024-06-15');
  });

  it('giữ nguyên khi đã là YYYY-MM-DD', () => {
    expect(isoDatePart('2024-06-15')).toBe('2024-06-15');
  });

  it('trả về chuỗi rỗng khi falsy', () => {
    expect(isoDatePart(null)).toBe('');
    expect(isoDatePart('')).toBe('');
  });
});

describe('dateFormat — nightsBetween()', () => {
  it('tính đúng số đêm giữa hai ngày', () => {
    expect(nightsBetween('2024-06-10', '2024-06-15')).toBe(5);
    expect(nightsBetween('2024-06-01', '2024-06-30')).toBe(29);
    expect(nightsBetween('2024-06-10', '2024-06-11')).toBe(1);
  });

  it('trả về ít nhất 1 đêm khi ngày không hợp lệ hoặc bằng nhau', () => {
    expect(nightsBetween('2024-06-10', '2024-06-10')).toBe(1);
    expect(nightsBetween('invalid', 'also-invalid')).toBe(1);
  });
});

describe('dateFormat — isCheckOutAfterCheckIn()', () => {
  it('trả về true khi check-out sau check-in', () => {
    expect(isCheckOutAfterCheckIn('2024-06-10', '2024-06-15')).toBe(true);
  });

  it('trả về false khi check-out trước hoặc bằng check-in', () => {
    expect(isCheckOutAfterCheckIn('2024-06-15', '2024-06-10')).toBe(false);
    expect(isCheckOutAfterCheckIn('2024-06-10', '2024-06-10')).toBe(false);
  });

  it('trả về false khi ngày không hợp lệ', () => {
    expect(isCheckOutAfterCheckIn('invalid', '2024-06-15')).toBe(false);
  });
});

describe('dateFormat — addDaysISO() / subtractDaysISO()', () => {
  it('addDaysISO cộng đúng số ngày', () => {
    expect(addDaysISO('2024-06-10', 5)).toBe('2024-06-15');
    expect(addDaysISO('2024-06-28', 3)).toBe('2024-07-01');
  });

  it('subtractDaysISO trừ đúng số ngày', () => {
    expect(subtractDaysISO('2024-06-15', 5)).toBe('2024-06-10');
  });

  it('addDaysISO trả về nguyên gốc khi ISO không hợp lệ', () => {
    expect(addDaysISO('ngay-sai', 5)).toBe('ngay-sai');
  });
});

describe('dateFormat — formatMonthYear()', () => {
  it('chuyển YYYY-MM thành MM/YYYY', () => {
    expect(formatMonthYear('2024-06')).toBe('06/2024');
    expect(formatMonthYear('2024-12')).toBe('12/2024');
  });
});

describe('dateFormat — formatChartDayLabel()', () => {
  it('chuyển ISO sang nhãn DD/MM', () => {
    expect(formatChartDayLabel('2024-06-15')).toBe('15/06');
  });
});

// ═══════════════════════════════════════════════════════════════
// roomMeta.js
// ═══════════════════════════════════════════════════════════════
describe('roomMeta — resolveRoomImageUrl()', () => {
  it('trả về null khi url rỗng', () => {
    expect(resolveRoomImageUrl(null, 'http://localhost:5000')).toBeNull();
    expect(resolveRoomImageUrl('', 'http://localhost:5000')).toBeNull();
  });

  it('giữ nguyên URL đã có http', () => {
    const url = 'https://example.com/image.jpg';
    expect(resolveRoomImageUrl(url, 'http://localhost:5000')).toBe(url);
  });

  it('ghép host vào URL tương đối', () => {
    expect(resolveRoomImageUrl('/uploads/rooms/img.jpg', 'http://localhost:5000')).toBe(
      'http://localhost:5000/uploads/rooms/img.jpg'
    );
  });

  it('chuẩn hoá dấu backslash thành slash', () => {
    const result = resolveRoomImageUrl('uploads\\rooms\\img.jpg', 'http://localhost:5000');
    expect(result).toContain('/');
    expect(result).not.toContain('\\');
  });
});

describe('roomMeta — getDisplayPricing()', () => {
  it('trả về price, listPrice và discountPct', () => {
    const result = getDisplayPricing({ price: 1000000, id: 1 });
    expect(result).toHaveProperty('price', 1000000);
    expect(result).toHaveProperty('listPrice');
    expect(result).toHaveProperty('discountPct');
    expect(result.listPrice).toBeGreaterThan(result.price);
  });

  it('discountPct không vượt quá 35%', () => {
    const result = getDisplayPricing({ price: 1000000, id: 5 });
    expect(result.discountPct).toBeLessThanOrEqual(35);
    expect(result.discountPct).toBeGreaterThanOrEqual(0);
  });

  it('xử lý phòng không có price (mặc định 0)', () => {
    const result = getDisplayPricing({});
    expect(result.price).toBe(0);
  });
});

describe('roomMeta — getRoomStatusPresentation()', () => {
  it('trả về label "Còn Trống" cho status available', () => {
    const result = getRoomStatusPresentation('available', 5);
    expect(result.label).toBe('Còn Trống');
  });

  it('trả về label "Đang Sử Dụng" cho status occupied', () => {
    expect(getRoomStatusPresentation('occupied').label).toBe('Đang Sử Dụng');
  });

  it('trả về label "Đã Đặt" cho status booked', () => {
    expect(getRoomStatusPresentation('booked').label).toBe('Đã Đặt');
  });

  it('trả về label "Đang Bảo Trì" cho status maintenance', () => {
    expect(getRoomStatusPresentation('maintenance').label).toBe('Đang Bảo Trì');
  });

  it('hiển thị fewLeftBadge khi còn ≤3 phòng cùng loại', () => {
    const result = getRoomStatusPresentation('available', 2);
    expect(result.fewLeftBadge).toBe(true);
  });

  it('không hiển thị fewLeftBadge khi còn > 3 phòng', () => {
    const result = getRoomStatusPresentation('available', 10);
    expect(result.fewLeftBadge).toBe(false);
  });

  it('xử lý status không xác định', () => {
    const result = getRoomStatusPresentation('unknown-status');
    expect(result).toHaveProperty('label');
    expect(result).toHaveProperty('className');
  });
});

describe('roomMeta — amenityPresetKeyFromTypeName()', () => {
  it('trả về "ocean" cho tên phòng có từ "biển"', () => {
    expect(amenityPresetKeyFromTypeName('Phòng Hướng Biển')).toBe('ocean');
  });

  it('trả về "suite" cho tên có "Suite"', () => {
    expect(amenityPresetKeyFromTypeName('Phòng Suite Sang Trọng')).toBe('suite');
  });

  it('trả về "wifi" cho phòng tiêu chuẩn', () => {
    expect(amenityPresetKeyFromTypeName('Phòng Tiêu Chuẩn')).toBe('wifi');
  });

  it('trả về "default" cho tên không khớp', () => {
    expect(amenityPresetKeyFromTypeName('Loại phòng lạ')).toBe('default');
  });
});

describe('roomMeta — amenitiesForRoomType()', () => {
  it('trả về mảng tiện nghi không rỗng', () => {
    const amenities = amenitiesForRoomType('Phòng Cao Cấp');
    expect(Array.isArray(amenities)).toBe(true);
    expect(amenities.length).toBeGreaterThan(0);
  });

  it('mỗi tiện nghi có id và label', () => {
    const amenities = amenitiesForRoomType('Phòng Suite Sang Trọng');
    amenities.forEach((a) => {
      expect(a).toHaveProperty('id');
      expect(a).toHaveProperty('label');
      expect(typeof a.id).toBe('string');
      expect(typeof a.label).toBe('string');
    });
  });

  it('không có tiện nghi trùng id', () => {
    const amenities = amenitiesForRoomType('Phòng Hướng Biển');
    const ids = amenities.map((a) => a.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('phòng tiêu chuẩn không có ăn sáng', () => {
    const amenities = amenitiesForRoomType('Phòng Tiêu Chuẩn');
    const hasBreakfast = amenities.some((a) => a.id === 'breakfast');
    expect(hasBreakfast).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════
// storage.js
// ═══════════════════════════════════════════════════════════════
describe('storage — storageGet/storageSet/storageRemove()', () => {
  const TEST_KEY = '__vitest_storage_test__';

  beforeEach(() => {
    storageRemove(TEST_KEY);
  });

  it('storageGet trả về null khi chưa có giá trị', () => {
    expect(storageGet(TEST_KEY)).toBeNull();
  });

  it('storageSet và storageGet hoạt động đúng', () => {
    storageSet(TEST_KEY, 'hello');
    expect(storageGet(TEST_KEY)).toBe('hello');
  });

  it('storageRemove xóa giá trị', () => {
    storageSet(TEST_KEY, 'to-be-deleted');
    storageRemove(TEST_KEY);
    expect(storageGet(TEST_KEY)).toBeNull();
  });

  it('storageSet ghi đè giá trị cũ', () => {
    storageSet(TEST_KEY, 'old-value');
    storageSet(TEST_KEY, 'new-value');
    expect(storageGet(TEST_KEY)).toBe('new-value');
  });
});
