import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoomType } from '../models/models';

@Injectable({ providedIn: 'root' })
export class RoomTypeService {
  private apiUrl = 'http://localhost:5000/api/roomtypes';

  constructor(private http: HttpClient) {}

  getAll(): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(this.apiUrl);
  }

  getById(id: number): Observable<RoomType> {
    return this.http.get<RoomType>(`${this.apiUrl}/${id}`);
  }

  create(roomType: Partial<RoomType>): Observable<RoomType> {
    return this.http.post<RoomType>(this.apiUrl, roomType);
  }

  update(id: number, roomType: Partial<RoomType>): Observable<RoomType> {
    return this.http.put<RoomType>(`${this.apiUrl}/${id}`, roomType);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
