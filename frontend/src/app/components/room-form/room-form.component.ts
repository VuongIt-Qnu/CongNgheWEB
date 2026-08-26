import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { RoomService } from '../../services/room.service';
import { RoomTypeService } from '../../services/room-type.service';
import { RoomType } from '../../models/models';
import { getPrimaryRoomImage, handleImageFallback } from '../../utils/room-images';
import { ROOM_STATUS_MAP } from '../../pipes/room-status.pipe';

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule
  ],
  template: `
    <div class="form-container">
      <!-- Breadcrumb & Title -->
      <div class="form-header">
        <a routerLink="/rooms" class="back-link">← Quay lại danh sách phòng</a>
        <h1>{{ isEdit ? 'Chỉnh Sửa Thông Tin Phòng ' + (form.controls.roomNumber.value || '') : 'Thêm Phòng Nghỉ Mới' }}</h1>
        <p>Cập nhật chi tiết tiện nghi, đơn giá và cấu hình hiển thị phòng trên hệ thống.</p>
      </div>

      <div class="form-layout">
        <!-- Main Form Fields -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-card-main">
          <div class="form-grid-2">
            <mat-form-field appearance="outline">
              <mat-label>Số phòng</mat-label>
              <input matInput type="text" formControlName="roomNumber" placeholder="VD: 801, 1205...">
              @if (form.controls.roomNumber.hasError('required') && form.controls.roomNumber.touched) {
                <mat-error>Vui lòng nhập số phòng.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Loại phòng</mat-label>
              <mat-select formControlName="roomTypeId">
                @for (rt of roomTypes; track rt.id) {
                  <mat-option [value]="rt.id">{{ rt.name }}</mat-option>
                }
              </mat-select>
              @if (form.controls.roomTypeId.hasError('required') && form.controls.roomTypeId.touched) {
                <mat-error>Vui lòng chọn loại phòng.</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="form-grid-2">
            <mat-form-field appearance="outline">
              <mat-label>Giá phòng mỗi đêm (VNĐ)</mat-label>
              <input matInput type="number" formControlName="price" placeholder="VD: 2500000">
              <span matTextSuffix>₫</span>
              @if (form.controls.price.hasError('required') && form.controls.price.touched) {
                <mat-error>Vui lòng nhập giá phòng.</mat-error>
              }
              @if (form.controls.price.hasError('min') && form.controls.price.touched) {
                <mat-error>Giá phòng phải lớn hơn 0.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Sức chứa tối đa (Người)</mat-label>
              <input matInput type="number" formControlName="capacity">
              @if (form.controls.capacity.hasError('required')) {
                <mat-error>Vui lòng nhập sức chứa.</mat-error>
              } @else if (form.controls.capacity.hasError('min') || form.controls.capacity.hasError('max')) {
                <mat-error>Sức chứa phải từ 1 đến 20 người.</mat-error>
              }
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Trạng thái kinh doanh</mat-label>
            <mat-select formControlName="status">
              @for (opt of statusOptions; track opt.value) {
                <mat-option [value]="opt.value">{{ opt.icon }} {{ opt.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Mô tả chi tiết phòng & Tiện ích</mat-label>
            <textarea matInput formControlName="description" rows="4" placeholder="VD: Tone trắng và gỗ sồi, ban công hướng vườn, giường King size..."></textarea>
          </mat-form-field>

          <div class="form-actions-row">
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
              {{ isEdit ? '💾 Lưu thay đổi' : '✨ Tạo phòng mới' }}
            </button>
            <button mat-stroked-button type="button" (click)="cancel()">Hủy</button>
          </div>
        </form>

        <!-- Live Visual Preview Card -->
        <div class="preview-sidebar">
          <h3>Xem trước hiển thị</h3>
          <div class="preview-room-card">
            <img [src]="currentPreviewImg" (error)="onImgError($event)" alt="Preview Room" class="preview-img">
            <div class="preview-body">
              <div class="preview-badge">{{ selectedTypeName }}</div>
              <h4>Phòng {{ form.controls.roomNumber.value || '---' }}</h4>
              <p class="preview-desc">{{ form.controls.description.value || 'Mô tả phòng sẽ hiển thị tại đây khi nhập...' }}</p>
              <div class="preview-footer">
                <span class="preview-price">{{ (form.controls.price.value || 0) | number:'1.0-0' }}₫ <small>/ đêm</small></span>
                <span class="badge" [class]="form.controls.status.value">{{ form.controls.status.value }}</span>
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
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    roomNumber: ['', Validators.required],
    roomTypeId: [1, Validators.required],
    price: [1890000, [Validators.required, Validators.min(0.01)]],
    capacity: [2, [Validators.required, Validators.min(1), Validators.max(20)]],
    status: ['available'],
    description: [''],
  });

  roomTypes: RoomType[] = [];
  statusOptions = Object.entries(ROOM_STATUS_MAP).map(([value, { label, icon }]) => ({ value, label, icon }));
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
      if (!this.isEdit && data.length > 0) {
        this.form.controls.roomTypeId.setValue(data[0].id);
      }
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.id = +idParam;
      this.roomService.getById(this.id).subscribe(data => this.form.patchValue({
        roomNumber: data.roomNumber,
        roomTypeId: data.roomTypeId,
        price: data.price,
        capacity: data.capacity,
        status: data.status,
        description: data.description ?? '',
      }));
    }
  }

  get selectedTypeName(): string {
    const found = this.roomTypes.find(t => t.id === +this.form.controls.roomTypeId.value);
    return found ? found.name : 'Phòng Tiêu Chuẩn';
  }

  get currentPreviewImg(): string {
    return getPrimaryRoomImage(this.selectedTypeName);
  }

  onImgError(event: Event): void {
    handleImageFallback(event);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const obs = this.isEdit ? this.roomService.update(this.id, value) : this.roomService.create(value);
    obs.subscribe(() => this.router.navigate(['/rooms']));
  }

  cancel(): void {
    this.router.navigate(['/rooms']);
  }
}
