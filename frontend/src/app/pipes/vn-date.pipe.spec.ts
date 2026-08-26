import { VnDatePipe } from './vn-date.pipe';

describe('VnDatePipe', () => {
  let pipe: VnDatePipe;

  beforeEach(() => {
    pipe = new VnDatePipe();
  });

  it('tạo được instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('trả về chuỗi rỗng khi giá trị null/undefined/rỗng', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('mode "date" (mặc định): chuyển "YYYY-MM-DD" sang "DD/MM/YYYY"', () => {
    expect(pipe.transform('2026-08-15')).toBe('15/08/2026');
    expect(pipe.transform('2026-08-15', 'date')).toBe('15/08/2026');
  });

  it('mode "date" nhận trực tiếp đối tượng Date', () => {
    const d = new Date(2026, 7, 15); // 15/08/2026
    expect(pipe.transform(d, 'date')).toBe('15/08/2026');
  });

  it('mode "time": bao gồm cả giờ:phút', () => {
    const result = pipe.transform('2026-08-15 10:05:00', 'time');
    expect(result).toContain('15/08/2026');
    expect(result).toMatch(/\d{2}:\d{2}$/);
  });

  it('mode "full": bao gồm thứ trong tuần bằng tiếng Việt', () => {
    // 2026-08-15 là Thứ Bảy
    const result = pipe.transform('2026-08-15', 'full');
    expect(result).toContain('15/08/2026');
    expect(result).toMatch(/^(Chủ Nhật|Thứ Hai|Thứ Ba|Thứ Tư|Thứ Năm|Thứ Sáu|Thứ Bảy),/);
  });
});
