import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RoomTypeService } from '../../services/room-type.service';
import { RoomType } from '../../models/models';
import { getPrimaryRoomImage, handleImageFallback } from '../../utils/room-images';

@Component({
  selector: 'app-room-type-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-container">
      <div class="page-header-row">
        <div>
          <span class="header-tag">CẤU HÌNH HỆ THỐNG</span>
          <h1>Danh Mục Loại Phòng</h1>
          <p>Quản lý các phân khúc phòng nghỉ, tiện ích tiêu chuẩn và số lượng phòng thuộc từng loại.</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/room-types/new">+ Thêm loại phòng mới</a>
      </div>

      <!-- Room Types Cards Grid -->
      <div class="room-types-grid">
        @for (rt of roomTypes; track rt.id) {
          <mat-card appearance="outlined" class="type-card">
            <div class="type-img-wrapper">
              <img [src]="getTypeImg(rt.name)" (error)="onImgError($event)" [alt]="rt.name" class="type-card-img">
              <div class="type-room-count-badge">
                <strong>{{ rt.roomCount || 0 }}</strong> phòng
              </div>
            </div>

            <div class="type-card-body">
              <div class="type-title-row">
                <h3>{{ rt.name }}</h3>
                <span class="type-id-sub">#TYPE-{{ rt.id }}</span>
              </div>
              <p class="type-desc">{{ rt.description || 'Chưa có mô tả chi tiết cho loại phòng này.' }}</p>

              <div class="type-card-footer">
                <a mat-stroked-button [routerLink]="['/room-types/edit', rt.id]">
                  <mat-icon>edit</mat-icon> Chỉnh sửa
                </a>
                <button mat-button color="warn" (click)="delete(rt.id)">
                  <mat-icon>delete</mat-icon> Xóa
                </button>
              </div>
            </div>
          </mat-card>
        }
      </div>
    </div>
  `,
  styleUrls: ['./room-type-list.component.scss']
})
export class RoomTypeListComponent implements OnInit {
  roomTypes: RoomType[] = [];

  constructor(private service: RoomTypeService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.getAll().subscribe(d => this.roomTypes = d);
  }

  getTypeImg(name?: string): string {
    return getPrimaryRoomImage(name);
  }

  onImgError(event: Event): void {
    handleImageFallback(event);
  }

  delete(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục loại phòng này?')) {
      this.service.delete(id).subscribe(() => this.load());
    }
  }
}
