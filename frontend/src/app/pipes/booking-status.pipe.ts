import { Pipe, PipeTransform } from '@angular/core';

/** Mapping từ giá trị DB sang tiếng Việt cho Booking status */
export const BOOKING_STATUS_MAP: Record<string, { label: string; icon: string; cssClass: string }> = {
  pending:   { label: 'Chờ xử lý',    icon: '🟡', cssClass: 'pending'   },
  confirmed: { label: 'Đã xác nhận',  icon: '🔵', cssClass: 'confirmed' },
  occupied:  { label: 'Đang lưu trú', icon: '🟢', cssClass: 'occupied'  },
  completed: { label: 'Đã hoàn tất',  icon: '⚪', cssClass: 'completed' },
  cancelled: { label: 'Đã hủy',       icon: '🔴', cssClass: 'cancelled' },
  no_show:   { label: 'Không đến',    icon: '🟠', cssClass: 'no_show'   },
};

@Pipe({ name: 'bookingStatus', standalone: true })
export class BookingStatusPipe implements PipeTransform {
  transform(status: string, field: 'label' | 'icon' | 'cssClass' = 'label'): string {
    const entry = BOOKING_STATUS_MAP[status];
    if (!entry) return status;
    return entry[field];
  }
}
