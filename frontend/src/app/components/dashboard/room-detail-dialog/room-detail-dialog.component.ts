import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Room } from '../../../models/models';
import { getRoomAmenities, getRoomImages, getRoomRating, handleImageFallback } from '../../../utils/room-images';

export interface RoomDetailDialogData {
  room: Room;
}

export interface RoomDetailDialogResult {
  bookRoomId: number;
}

@Component({
  selector: 'app-room-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="room-detail-modal">
      <!-- Header -->
      <div class="modal-header">
        <div>
          <h2 mat-dialog-title>Chi Tiết Phòng {{ room.roomNumber }}</h2>
          <span class="text-gold font-weight-bold">{{ room.roomTypeName }}</span>
        </div>
        <button mat-icon-button class="btn-close" (click)="dialogRef.close()" aria-label="Đóng">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="modal-body">
        <!-- Image Gallery -->
        <div class="gallery-wrapper">
          <div class="main-gallery-img">
            <img [src]="activeGalleryImage" (error)="onImgError($event)" [alt]="room.roomNumber">
          </div>
          <div class="gallery-thumbs">
            @for (img of gallery; track img) {
              <img [src]="img" (error)="onImgError($event)" [class.active]="activeGalleryImage === img" (click)="activeGalleryImage = img" alt="Room thumb">
            }
          </div>
        </div>

        <!-- Detail Info -->
        <div class="detail-info-block">
          <div class="detail-key-facts">
            <div class="fact-item">
              <span class="fact-label">Sức chứa tối đa</span>
              <span class="fact-val">👥 {{ room.capacity }} Người lớn</span>
            </div>
            <div class="fact-item">
              <span class="fact-label">Đánh giá khách hàng</span>
              <span class="fact-val text-gold">⭐ {{ rating.score }} ({{ rating.count }} đánh giá)</span>
            </div>
            <div class="fact-item">
              <span class="fact-label">Địa chỉ Resort</span>
              <span class="fact-val">📍 Quy Nhơn, Gia Lai</span>
            </div>
          </div>

          <div class="detail-description">
            <h4>Mô tả phòng</h4>
            <p>{{ room.description || 'Không gian nghỉ dưỡng tuyệt hảo với phong cách thiết kế sang trọng, nội thất cao cấp và view thoáng đãng tại 05 Trần Văn Ơn.' }}</p>
          </div>

          <div class="detail-amenities">
            <h4>Tiện ích bao gồm</h4>
            <div class="amenities-grid">
              @for (am of amenities; track am) {
                <div class="amenity-item"><span class="amenity-check">✓</span> {{ am }}</div>
              }
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <div class="modal-footer-action">
        <div class="modal-price">
          <span>Giá phòng niêm yết:</span>
          <strong class="text-gold font-serif">{{ room.price | number:'1.0-0' }}₫ <small>/ đêm</small></strong>
        </div>
        <button mat-raised-button color="primary" class="btn-lg" (click)="dialogRef.close({ bookRoomId: room.id })">
          Tiến hành Đặt phòng này
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./room-detail-dialog.component.scss']
})
export class RoomDetailDialogComponent {
  dialogRef = inject(MatDialogRef<RoomDetailDialogComponent, RoomDetailDialogResult | undefined>);
  private data = inject<RoomDetailDialogData>(MAT_DIALOG_DATA);

  room = this.data.room;
  gallery = getRoomImages(this.room.roomTypeName);
  activeGalleryImage = this.gallery[0];
  amenities = getRoomAmenities(this.room.roomTypeName);
  rating = getRoomRating(this.room.id);

  onImgError(event: Event): void {
    handleImageFallback(event);
  }
}
