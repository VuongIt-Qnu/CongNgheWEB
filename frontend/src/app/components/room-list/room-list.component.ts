import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { RoomService } from '../../services/room.service';
import { RoomTypeService } from '../../services/room-type.service';
import { Room, RoomType } from '../../models/models';
import { getPrimaryRoomImage, handleImageFallback } from '../../utils/room-images';
import { ROOM_STATUS_MAP } from '../../pipes/room-status.pipe';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatButtonToggleModule, MatIconModule
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header-row">
        <div>
          <span class="header-tag">QUẢN TRỊ KHO PHÒNG</span>
          <h1>Danh Sách Phòng Nghỉ</h1>
          <p>Quản lý toàn bộ thông tin phòng, tình trạng kinh doanh và giá phòng tại Aurora Resort.</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/rooms/new">+ Thêm phòng mới</a>
      </div>

      <!-- Quick Status Summary Filter -->
      <mat-button-toggle-group class="status-summary-bar" [value]="selectedStatus" (change)="setStatusFilter($event.value)">
        <mat-button-toggle value="" class="status-pill">
          <span>Tất cả phòng</span>
          <strong>{{ rooms.length }}</strong>
        </mat-button-toggle>
        <mat-button-toggle value="available" class="status-pill">
          <span class="status-dot green"></span>
          <span>Phòng trống</span>
          <strong>{{ getCountByStatus('available') }}</strong>
        </mat-button-toggle>
        <mat-button-toggle value="occupied" class="status-pill">
          <span class="status-dot orange"></span>
          <span>Đang có khách</span>
          <strong>{{ getCountByStatus('occupied') }}</strong>
        </mat-button-toggle>
        <mat-button-toggle value="maintenance" class="status-pill">
          <span class="status-dot red"></span>
          <span>Đang bảo trì</span>
          <strong>{{ getCountByStatus('maintenance') }}</strong>
        </mat-button-toggle>
      </mat-button-toggle-group>

      <!-- Search & Filters -->
      <div class="table-toolbar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-icon matPrefix>search</mat-icon>
          <input matInput type="text" [formControl]="searchControl" placeholder="Tìm theo số phòng, loại phòng, tiện nghi...">
          @if (searchControl.value) {
            <button mat-icon-button matSuffix type="button" (click)="searchControl.setValue('')" aria-label="Xóa tìm kiếm">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="type-filter-field">
          <mat-label>Loại phòng</mat-label>
          <mat-select [formControl]="typeFilterControl">
            <mat-option [value]="0">Tất cả loại phòng</mat-option>
            @for (rt of roomTypes; track rt.id) {
              <mat-option [value]="rt.id">{{ rt.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Main Table -->
      <div class="card-table-wrap">
        <table mat-table [dataSource]="filteredRooms" class="table-modern">
          <ng-container matColumnDef="room">
            <th mat-header-cell *matHeaderCellDef>Phòng & Hình ảnh</th>
            <td mat-cell *matCellDef="let room">
              <div class="room-cell">
                <img [src]="getRoomImg(room.roomTypeName, room.id)" (error)="onImgError($event)" [alt]="room.roomNumber" class="room-thumb-img">
                <div class="room-number-group">
                  <strong class="room-number">Phòng {{ room.roomNumber }}</strong>
                  <span class="room-id-sub">#ID-{{ room.id }}</span>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Loại phòng</th>
            <td mat-cell *matCellDef="let room"><span class="room-type-badge">{{ room.roomTypeName }}</span></td>
          </ng-container>

          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef>Giá niêm yết</th>
            <td mat-cell *matCellDef="let room">
              <strong class="price-text text-gold">{{ room.price | number:'1.0-0' }}₫</strong>
              <span class="price-sub">/ đêm</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="capacity">
            <th mat-header-cell *matHeaderCellDef>Sức chứa</th>
            <td mat-cell *matCellDef="let room"><span class="capacity-pill">👥 {{ room.capacity }} người</span></td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Mô tả tóm tắt</th>
            <td mat-cell *matCellDef="let room" class="desc-cell">
              <span class="truncate-desc">{{ room.description || 'Chưa có mô tả' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Trạng thái</th>
            <td mat-cell *matCellDef="let room"><span class="badge" [class]="room.status">{{ getRoomStatusLabel(room.status) }}</span></td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="text-align: right;">Thao tác</th>
            <td mat-cell *matCellDef="let room" style="text-align: right;">
              <div class="row-actions">
                <a mat-stroked-button [routerLink]="['/rooms/edit', room.id]" title="Chỉnh sửa">
                  <mat-icon>edit</mat-icon> Sửa
                </a>
                <button mat-button color="warn" (click)="deleteRoom(room.id)" title="Xóa phòng">
                  <mat-icon>delete</mat-icon> Xóa
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>

        @if (filteredRooms.length === 0) {
          <div class="empty-state">
            <span>🛏️</span>
            <p>Không tìm thấy phòng nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  rooms: Room[] = [];
  filteredRooms: Room[] = [];
  roomTypes: RoomType[] = [];
  searchControl = new FormControl('', { nonNullable: true });
  typeFilterControl = new FormControl(0, { nonNullable: true });
  selectedStatus = '';
  columns = ['room', 'type', 'price', 'capacity', 'description', 'status', 'actions'];

  constructor(private roomService: RoomService, private rtService: RoomTypeService) {}

  ngOnInit(): void {
    this.rtService.getAll().subscribe(types => this.roomTypes = types);
    this.loadRooms();
    // Gộp 2 control lại thành 1 subscription duy nhất (thay vì 2 subscription độc lập
    // cùng gọi filterRooms() — tránh chạy trùng khi cả 2 đổi gần như đồng thời) và
    // huỷ đúng vòng đời component.
    merge(this.searchControl.valueChanges, this.typeFilterControl.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.filterRooms());
  }

  loadRooms(): void {
    this.roomService.getAll().subscribe(data => {
      this.rooms = data;
      this.filterRooms();
    });
  }

  filterRooms(): void {
    const search = this.searchControl.value.toLowerCase();
    const typeId = this.typeFilterControl.value;

    this.filteredRooms = this.rooms.filter(r => {
      const matchSearch = !search ||
        r.roomNumber.toLowerCase().includes(search) ||
        r.roomTypeName.toLowerCase().includes(search) ||
        (r.description && r.description.toLowerCase().includes(search));

      const matchStatus = !this.selectedStatus || r.status === this.selectedStatus;
      const matchType = !typeId || r.roomTypeId === +typeId;

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
