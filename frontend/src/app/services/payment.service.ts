import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment, CreatePayment } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  /** Admin/staff: danh sách toàn bộ giao dịch, có thể lọc theo trạng thái */
  getAll(status?: string): Observable<Payment[]> {
    let params: any = {};
    if (status) params.status = status;
    return this.http.get<Payment[]>(this.apiUrl, { params });
  }

  /** Lịch sử thanh toán của 1 đơn đặt phòng (customer chỉ xem được đơn của chính mình) */
  getByBooking(bookingId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/booking/${bookingId}`);
  }

  create(payload: CreatePayment): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, payload);
  }

  /** Admin/staff xác nhận đã nhận tiền / từ chối / hoàn tiền */
  updateStatus(id: number, status: string, notes?: string): Observable<Payment> {
    return this.http.patch<Payment>(`${this.apiUrl}/${id}/status`, { status, notes });
  }
}
