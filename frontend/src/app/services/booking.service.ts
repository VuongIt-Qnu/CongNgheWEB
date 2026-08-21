import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  getAll(status?: string, search?: string): Observable<Booking[]> {
    let params: any = {};
    if (status) params.status = status;
    if (search) params.search = search;
    return this.http.get<Booking[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  create(booking: any): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  update(id: number, booking: any): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}`, booking);
  }

  /** Cập nhật trạng thái booking theo workflow nghiệp vụ */
  updateStatus(id: number, status: string): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
