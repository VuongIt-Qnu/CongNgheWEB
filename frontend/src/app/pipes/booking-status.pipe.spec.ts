import { BookingStatusPipe, BOOKING_STATUS_MAP } from './booking-status.pipe';

describe('BookingStatusPipe', () => {
  let pipe: BookingStatusPipe;

  beforeEach(() => {
    pipe = new BookingStatusPipe();
  });

  it('tạo được instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('trả về đúng label mặc định (field không truyền) cho từng trạng thái đã biết', () => {
    for (const status of Object.keys(BOOKING_STATUS_MAP)) {
      expect(pipe.transform(status)).toBe(BOOKING_STATUS_MAP[status].label);
    }
  });

  it('trả về đúng icon khi field = "icon"', () => {
    expect(pipe.transform('pending', 'icon')).toBe('🟡');
    expect(pipe.transform('confirmed', 'icon')).toBe('🔵');
  });

  it('trả về đúng cssClass khi field = "cssClass"', () => {
    expect(pipe.transform('completed', 'cssClass')).toBe('completed');
    expect(pipe.transform('no_show', 'cssClass')).toBe('no_show');
  });

  it('trả về nguyên giá trị đầu vào khi status không tồn tại trong map', () => {
    expect(pipe.transform('unknown_status')).toBe('unknown_status');
    expect(pipe.transform('unknown_status', 'icon')).toBe('unknown_status');
  });
});
