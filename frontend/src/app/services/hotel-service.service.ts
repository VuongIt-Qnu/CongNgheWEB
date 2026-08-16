import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HotelService } from '../models/models';

@Injectable({ providedIn: 'root' })
export class HotelServiceService {
  private apiUrl = 'http://localhost:5000/api/services';

  constructor(private http: HttpClient) {}

  getAll(): Observable<HotelService[]> {
    return this.http.get<HotelService[]>(this.apiUrl);
  }

  getById(id: number): Observable<HotelService> {
    return this.http.get<HotelService>(`${this.apiUrl}/${id}`);
  }

  create(service: Partial<HotelService>): Observable<HotelService> {
    return this.http.post<HotelService>(this.apiUrl, service);
  }

  update(id: number, service: Partial<HotelService>): Observable<HotelService> {
    return this.http.put<HotelService>(`${this.apiUrl}/${id}`, service);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
