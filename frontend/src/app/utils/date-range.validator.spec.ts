import { FormBuilder } from '@angular/forms';
import { dateRangeValidator, getLocalDateString, getNextDayString, parseLocalDate } from './date-range.validator';

describe('dateRangeValidator', () => {
  const fb = new FormBuilder();

  function buildGroup(checkInDate: unknown, checkOutDate: unknown) {
    return fb.group({ checkInDate: [checkInDate], checkOutDate: [checkOutDate] });
  }

  it('báo lỗi checkOutBeforeCheckIn khi ngày trả phòng <= ngày nhận phòng', () => {
    const group = buildGroup('2026-09-10', '2026-09-10');
    const errors = dateRangeValidator()(group);
    expect(errors).toEqual({ checkOutBeforeCheckIn: true });
  });

  it('báo lỗi checkOutBeforeCheckIn khi ngày trả phòng trước ngày nhận phòng', () => {
    const group = buildGroup('2026-09-10', '2026-09-05');
    const errors = dateRangeValidator()(group);
    expect(errors).toEqual({ checkOutBeforeCheckIn: true });
  });

  it('báo lỗi checkInPast khi tạo mới (minDateToday: true) và ngày nhận phòng ở quá khứ', () => {
    const group = buildGroup('2000-01-01', '2000-01-02');
    const errors = dateRangeValidator({ minDateToday: true })(group);
    expect(errors).toEqual({ checkInPast: true });
  });

  it('không báo lỗi checkInPast khi sửa đơn cũ (minDateToday: false) dù ngày nhận phòng ở quá khứ', () => {
    const group = buildGroup('2000-01-01', '2000-01-02');
    const errors = dateRangeValidator({ minDateToday: false })(group);
    expect(errors).toBeNull();
  });

  it('không báo lỗi khi khoảng ngày hợp lệ (checkOut sau checkIn ít nhất 1 ngày, không ở quá khứ)', () => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    const futureNext = new Date(future);
    futureNext.setDate(futureNext.getDate() + 1);

    const group = buildGroup(getLocalDateString(future), getLocalDateString(futureNext));
    const errors = dateRangeValidator()(group);
    expect(errors).toBeNull();
  });

  it('báo lỗi checkInRequired khi thiếu ngày nhận phòng', () => {
    const group = buildGroup('', '2026-09-10');
    const errors = dateRangeValidator()(group);
    expect(errors).toEqual({ checkInRequired: true });
  });

  it('báo lỗi checkOutRequired khi thiếu ngày trả phòng', () => {
    const group = buildGroup('2026-09-10', '');
    const errors = dateRangeValidator()(group);
    expect(errors).toEqual({ checkOutRequired: true });
  });

  it('hoạt động đúng khi giá trị control là đối tượng Date (mat-datepicker) thay vì string', () => {
    const checkIn = new Date(2026, 8, 10); // 2026-09-10
    const checkOut = new Date(2026, 8, 9); // 2026-09-09 (trước checkIn)
    const group = buildGroup(checkIn, checkOut);
    const errors = dateRangeValidator({ minDateToday: false })(group);
    expect(errors).toEqual({ checkOutBeforeCheckIn: true });
  });

  it('hỗ trợ tên control tùy chỉnh qua checkInControlName/checkOutControlName', () => {
    const group = fb.group({ from: ['2026-09-10'], to: ['2026-09-09'] });
    const errors = dateRangeValidator({
      checkInControlName: 'from',
      checkOutControlName: 'to',
      minDateToday: false,
    })(group);
    expect(errors).toEqual({ checkOutBeforeCheckIn: true });
  });
});

describe('getLocalDateString', () => {
  it('trả về đúng định dạng YYYY-MM-DD', () => {
    const d = new Date(2026, 0, 5); // 05/01/2026
    expect(getLocalDateString(d)).toBe('2026-01-05');
  });

  it('mặc định dùng ngày hiện tại khi không truyền tham số', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(getLocalDateString()).toBe(expected);
  });
});

describe('getNextDayString', () => {
  it('trả về ngày kế tiếp cùng định dạng YYYY-MM-DD', () => {
    expect(getNextDayString('2026-01-31')).toBe('2026-02-01');
  });

  it('trả về chuỗi rỗng khi đầu vào rỗng', () => {
    expect(getNextDayString('')).toBe('');
  });
});

describe('parseLocalDate', () => {
  it('parse đúng "YYYY-MM-DD" thành Date theo giờ địa phương (không lệch ngày do UTC)', () => {
    const d = parseLocalDate('2026-03-15');
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(2); // 0-indexed: tháng 3
    expect(d!.getDate()).toBe(15);
  });

  it('trả về null khi đầu vào rỗng hoặc không hợp lệ', () => {
    expect(parseLocalDate('')).toBeNull();
    expect(parseLocalDate('not-a-date')).toBeNull();
  });
});
