import { Pipe, PipeTransform } from '@angular/core';

/** Trạng thái thanh toán tổng hợp của 1 đơn đặt phòng (Booking.paymentStatus) */
export const BOOKING_PAYMENT_STATUS_MAP: Record<string, { label: string; icon: string; cssClass: string }> = {
  unpaid:  { label: 'Chưa thanh toán',      icon: '⚪', cssClass: 'unpaid' },
  partial: { label: 'Đã thanh toán một phần', icon: '🟡', cssClass: 'partial' },
  paid:    { label: 'Đã thanh toán đủ',      icon: '🟢', cssClass: 'paid' },
};

/** Trạng thái của 1 giao dịch thanh toán (Payment.status) */
export const PAYMENT_TX_STATUS_MAP: Record<string, { label: string; icon: string; cssClass: string }> = {
  pending:   { label: 'Chờ xác nhận', icon: '🟡', cssClass: 'pending' },
  completed: { label: 'Đã xác nhận',  icon: '🟢', cssClass: 'completed' },
  failed:    { label: 'Thất bại',     icon: '🔴', cssClass: 'failed' },
  refunded:  { label: 'Đã hoàn tiền', icon: '🔵', cssClass: 'refunded' },
};

/** Phương thức thanh toán */
export const PAYMENT_METHOD_MAP: Record<string, { label: string; icon: string }> = {
  cash:          { label: 'Tiền mặt tại quầy', icon: '💵' },
  bank_transfer: { label: 'Chuyển khoản',      icon: '🏦' },
  credit_card:   { label: 'Thẻ tín dụng',      icon: '💳' },
};

@Pipe({ name: 'bookingPaymentStatus', standalone: true })
export class BookingPaymentStatusPipe implements PipeTransform {
  transform(status: string, field: 'label' | 'icon' | 'cssClass' = 'label'): string {
    const entry = BOOKING_PAYMENT_STATUS_MAP[status];
    if (!entry) return status;
    return entry[field];
  }
}

@Pipe({ name: 'paymentTxStatus', standalone: true })
export class PaymentTxStatusPipe implements PipeTransform {
  transform(status: string, field: 'label' | 'icon' | 'cssClass' = 'label'): string {
    const entry = PAYMENT_TX_STATUS_MAP[status];
    if (!entry) return status;
    return entry[field];
  }
}

@Pipe({ name: 'paymentMethod', standalone: true })
export class PaymentMethodPipe implements PipeTransform {
  transform(method: string, field: 'label' | 'icon' = 'label'): string {
    const entry = PAYMENT_METHOD_MAP[method];
    if (!entry) return method;
    return entry[field];
  }
}
