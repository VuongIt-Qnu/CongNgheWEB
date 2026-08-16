import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RoomTypeService } from '../../services/room-type.service';

@Component({
  selector: 'app-room-type-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="form-container">
      <div class="form-header">
        <a routerLink="/room-types" class="back-link">← Quay lại danh mục loại phòng</a>
        <h1>{{ isEdit ? 'Chỉnh Sửa Loại Phòng #' + id : 'Thêm Danh Mục Loại Phòng Mới' }}</h1>
        <p>Cấu hình tên gọi phân khúc phòng và mô tả tiện ích tiêu chuẩn áp dụng.</p>
      </div>

      <form (ngSubmit)="onSubmit()" class="form-card-main">
        <div class="form-group">
          <label for="name">Tên phân khúc / Loại phòng <span class="required">*</span></label>
          <input 
            id="name" 
            type="text" 
            [(ngModel)]="item.name" 
            name="name" 
            class="form-control" 
            placeholder="VD: Phòng Hướng Biển, Phòng Suite Sang Trọng..." 
            required
          >
        </div>

        <div class="form-group">
          <label for="description">Mô tả đặc điểm & Tiện ích tiêu chuẩn</label>
          <textarea 
            id="description" 
            [(ngModel)]="item.description" 
            name="description" 
            rows="4" 
            class="form-control" 
            placeholder="VD: Không gian rộng rãi, ban công view trực diện biển, minibar miễn phí..."
          ></textarea>
        </div>

        <div class="form-actions-row">
          <button type="submit" class="btn btn-gold btn-lg" [disabled]="!item.name">
            {{ isEdit ? '💾 Lưu thay đổi' : '✨ Tạo loại phòng mới' }}
          </button>
          <button type="button" class="btn btn-secondary btn-lg" (click)="router.navigate(['/room-types'])">
            Hủy thao tác
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./room-type-form.component.scss']
})
export class RoomTypeFormComponent implements OnInit {
  item: any = { name: '', description: '' };
  isEdit = false;
  id = 0;

  constructor(
    private service: RoomTypeService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    const p = this.route.snapshot.paramMap.get('id');
    if (p) {
      this.isEdit = true;
      this.id = +p;
      this.service.getById(this.id).subscribe(d => this.item = d);
    }
  }

  onSubmit(): void {
    const o = this.isEdit ? this.service.update(this.id, this.item) : this.service.create(this.item);
    o.subscribe(() => this.router.navigate(['/room-types']));
  }
}
