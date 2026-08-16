import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { RoomTypeService } from '../../services/room-type.service';
import { RoomType } from '../../models/models';
import { getPrimaryRoomImage, handleImageFallback } from '../../utils/room-images';

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="form-container">
      <!-- Breadcrumb & Title -->
      <div class="form-header">
        <a routerLink="/rooms" class="back-link">← Quay lại danh sách phòng</a>
        <h1>{{ isEdit ? 'Chỉnh Sửa Thông Tin Phòng ' + (room.roomNumber || '') : 'Thêm Phòng Nghỉ Mới' }}</h1>
        <p>Cập nhật chi tiết tiện nghi, đơn giá và cấu hình hiển thị phòng trên hệ thống.</p>
      </div>

      <div class="form-layout">
        <!-- Main Form Fields -->
        <form (ngSubmit)="onSubmit()" class="form-card-main">
          <div class="form-grid-2">
            <div class="form-group">
              <label for="roomNumber">Số phòng <span class="required">*</span></label>
              <input 
                id="roomNumber" 
                type="text" 
                [(ngModel)]="room.roomNumber" 
                name="roomNumber" 
                class="form-control" 
                placeholder="VD: 801, 1205..." 
                required
              >
            </div>

            <div class="form-group">
              <label for="roomTypeId">Loại phòng <span class="required">*</span></label>
              <select 
                id="roomTypeId" 
                [(ngModel)]="room.roomTypeId" 
                name="roomTypeId" 
                class="form-select" 
                (change)="onTypeChange()" 
                required
              >
                <option *ngFor="let rt of roomTypes" [value]="rt.id">{{ rt.name }}</option>
              </select>
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label for="price">Giá phòng mỗi đêm (VNĐ) <span class="required">*</span></label>
              <input 
                id="price" 
                type="number" 
                [(ngModel)]="room.price" 
                name="price" 
                class="form-control" 
                placeholder="VD: 2500000" 
                required
              >
              <span class="price-hint" *ngIf="room.price">Hiển thị: <strong>{{ room.price | number:'1.0-0' }}₫</strong> / đêm</span>
            </div>

            <div class="form-group">
              <label for="capacity">Sức chứa tối đa (Người) <span class="required">*</span></label>
              <input 
                id="capacity" 
                type="number" 
                [(ngModel)]="room.capacity" 
                name="capacity" 
                class="form-control" 
                min="1" 
                max="20" 
                required
              >
            </div>
          </div>

          <div class="form-group">
            <label for="status">Trạng thái kinh doanh</label>
            <select id="status" [(ngModel)]="room.status" name="status" class="form-select">
              <option value="available">🟢 Phòng trống (Sẵn sàng đón khách)</option>
              <option value="occupied">🟠 Đang có khách lưu trú</option>
              <option value="maintenance">🔴 Đang bảo trì / Sửa chữa</option>
            </select>
          </div>

          <div class="form-group">
            <label for="description">Mô tả chi tiết phòng & Tiện ích</label>
            <textarea 
              id="description" 
              [(ngModel)]="room.description" 
              name="description" 
              rows="4" 
              class="form-control" 
              placeholder="VD: Tone trắng và gỗ sồi, ban công hướng vườn, giường King size..."
            ></textarea>
          </div>

          <div class="form-actions-row">
            <button type="submit" class="btn btn-gold btn-lg">
              {{ isEdit ? '💾 Lưu thay đổi' : '✨ Tạo phòng mới' }}
            </button>
            <button type="button" class="btn btn-secondary btn-lg" (click)="cancel()">Hủy</button>
          </div>
        </form>

        <!-- Live Visual Preview Card -->
        <div class="preview-sidebar">
          <h3>Xem trước hiển thị</h3>
          <div class="preview-room-card">
            <img [src]="currentPreviewImg" (error)="onImgError($event)" alt="Preview Room" class="preview-img">
            <div class="preview-body">
              <div class="preview-badge">{{ selectedTypeName }}</div>
              <h4>Phòng {{ room.roomNumber || '---' }}</h4>
              <p class="preview-desc">{{ room.description || 'Mô tả phòng sẽ hiển thị tại đây khi nhập...' }}</p>
              <div class="preview-footer">
                <span class="preview-price">{{ (room.price || 0) | number:'1.0-0' }}₫ <small>/ đêm</small></span>
                <span class="badge" [class]="room.status">{{ room.status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./room-form.component.scss']
})
export class RoomFormComponent implements OnInit {
  room: any = { roomNumber: '', roomTypeId: 1, price: 1890000, capacity: 2, status: 'available', description: '' };
  roomTypes: RoomType[] = [];
  isEdit = false;
  id = 0;

  constructor(
    private roomService: RoomService,
    private rtService: RoomTypeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.rtService.getAll().subscribe(data => {
      this.roomTypes = data;
      if (!this.isEdit && data.length > 0 && !this.room.roomTypeId) {
        this.room.roomTypeId = data[0].id;
      }
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.id = +idParam;
      this.roomService.getById(this.id).subscribe(data => this.room = data);
    }
  }

  get selectedTypeName(): string {
    const found = this.roomTypes.find(t => t.id === +this.room.roomTypeId);
    return found ? found.name : 'Phòng Tiêu Chuẩn';
  }

  get currentPreviewImg(): string {
    return getPrimaryRoomImage(this.selectedTypeName);
  }

  onTypeChange(): void {}

  onImgError(event: Event): void {
    handleImageFallback(event);
  }

  onSubmit(): void {
    const obs = this.isEdit ? this.roomService.update(this.id, this.room) : this.roomService.create(this.room);
    obs.subscribe(() => this.router.navigate(['/rooms']));
  }

  cancel(): void {
    this.router.navigate(['/rooms']);
  }
}
