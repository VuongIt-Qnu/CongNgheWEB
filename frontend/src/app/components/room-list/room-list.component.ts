import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { RoomTypeService } from '../../services/room-type.service';
import { Room, RoomType } from '../../models/models';
import { getPrimaryRoomImage, handleImageFallback } from '../../utils/room-images';
import { ROOM_STATUS_MAP } from '../../pipes/room-status.pipe';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header-row">
        <div>
          <span class="header-tag">QUẢN TRỊ KHO PHÒNG</span>
          <h1>Danh Sách Phòng Nghỉ</h1>
          <p>Quản lý toàn bộ thông tin phòng, tình trạng kinh doanh và giá phòng tại Aurora Resort.</p>
        </div>
        <a routerLink="/rooms/new" class="btn btn-gold">+ Thêm phòng mới</a>
      </div>

      <!-- Quick Status Summary Cards -->
      <div class="status-summary-bar">
        <div class="status-pill" [class.active]="selectedStatus === ''" (click)="setStatusFilter('')">
          <span>Tất cả phòng</span>
          <strong>{{ rooms.length }}</strong>
        </div>
        <div class="status-pill" [class.active]="selectedStatus === 'available'" (click)="setStatusFilter('available')">
          <span class="status-dot green"></span>
          <span>Phòng trống</span>
          <strong>{{ getCountByStatus('available') }}</strong>
        </div>
        <div class="status-pill" [class.active]="selectedStatus === 'occupied'" (click)="setStatusFilter('occupied')">
          <span class="status-dot orange"></span>
          <span>Đang có khách</span>
          <strong>{{ getCountByStatus('occupied') }}</strong>
        </div>
        <div class="status-pill" [class.active]="selectedStatus === 'maintenance'" (click)="setStatusFilter('maintenance')">
          <span class="status-dot red"></span>
          <span>Đang bảo trì</span>
          <strong>{{ getCountByStatus('maintenance') }}</strong>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="table-toolbar">
        <div class="search-input-wrap">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (ngModelChange)="filterRooms()" 
            placeholder="Tìm theo số phòng, loại phòng, tiện nghi..."
          >
          <button *ngIf="searchTerm" (click)="searchTerm = ''; filterRooms()" class="btn-clear">✕</button>
        </div>

        <div class="type-filter-wrap">
          <select [(ngModel)]="selectedTypeId" (change)="filterRooms()" class="form-select">
            <option [value]="0">Tất cả loại phòng</option>
            <option *ngFor="let rt of roomTypes" [value]="rt.id">{{ rt.name }}</option>
          </select>
        </div>
      </div>

      <!-- Main Table -->
      <div class="card-table-wrap">
        <table class="table-modern">
          <thead>
            <tr>
              <th>Phòng & Hình ảnh</th>
              <th>Loại phòng</th>
              <th>Giá niêm yết</th>
              <th>Sức chứa</th>
              <th>Mô tả tóm tắt</th>
              <th>Trạng thái</th>
              <th style="text-align: right;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let room of filteredRooms">
              <td>
                <div class="room-cell">
                  <img 
                    [src]="getRoomImg(room.roomTypeName, room.id)" 
                    (error)="onImgError($event)" 
                    [alt]="room.roomNumber" 
                    class="room-thumb-img"
                  >
                  <div class="room-number-group">
                    <strong class="room-number">Phòng {{ room.roomNumber }}</strong>
                    <span class="room-id-sub">#ID-{{ room.id }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="room-type-badge">{{ room.roomTypeName }}</span>
              </td>
              <td>
                <strong class="price-text text-gold">{{ room.price | number:'1.0-0' }}₫</strong>
                <span class="price-sub">/ đêm</span>
              </td>
              <td>
                <span class="capacity-pill">👥 {{ room.capacity }} người</span>
              </td>
              <td class="desc-cell">
                <span class="truncate-desc">{{ room.description || 'Chưa có mô tả' }}</span>
              </td>
              <td>
                <span class="badge" [class]="room.status">{{ getRoomStatusLabel(room.status) }}</span>
              </td>
              <td style="text-align: right;">
                <div class="row-actions">
                  <a [routerLink]="['/rooms/edit', room.id]" class="btn btn-secondary btn-sm" title="Chỉnh sửa">
                    ✏️ Sửa
                  </a>
                  <button (click)="deleteRoom(room.id)" class="btn btn-danger btn-sm" title="Xóa phòng">
                    🗑️ Xóa
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="filteredRooms.length === 0">
              <td colspan="7" class="empty-table-cell">
                <div class="empty-state">
                  <span>🛏️</span>
                  <p>Không tìm thấy phòng nào phù hợp với bộ lọc hiện tại.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent implements OnInit {
  rooms: Room[] = [];
  filteredRooms: Room[] = [];
  roomTypes: RoomType[] = [];
  searchTerm = '';
  selectedStatus = '';
  selectedTypeId: number = 0;

  constructor(private roomService: RoomService, private rtService: RoomTypeService) {}

  ngOnInit(): void {
    this.rtService.getAll().subscribe(types => this.roomTypes = types);
    this.loadRooms();
  }

  loadRooms(): void {
    this.roomService.getAll().subscribe(data => {
      this.rooms = data;
      this.filterRooms();
    });
  }

  filterRooms(): void {
    this.filteredRooms = this.rooms.filter(r => {
      const matchSearch = !this.searchTerm ||
        r.roomNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        r.roomTypeName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchStatus = !this.selectedStatus || r.status === this.selectedStatus;
      const matchType = !this.selectedTypeId || r.roomTypeId === +this.selectedTypeId;

      return matchSearch && matchStatus && matchType;
    });
  }

  setStatusFilter(status: string): void {
    this.selectedStatus = status;
    this.filterRooms();
  }

  getCountByStatus(status: string): number {
    return this.rooms.filter(r => r.status === status).length;
  }

  getRoomImg(typeName?: string, id: number = 0): string {
    return getPrimaryRoomImage(typeName, id);
  }

  onImgError(event: Event): void {
    handleImageFallback(event);
  }

  getRoomStatusLabel(status: string): string {
    return ROOM_STATUS_MAP[status]?.label || status;
  }

  deleteRoom(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa phòng này khỏi hệ thống?')) {
      this.roomService.delete(id).subscribe(() => this.loadRooms());
    }
  }
}
