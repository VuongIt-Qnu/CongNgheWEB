import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HotelServiceService } from '../../services/hotel-service.service';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="form-container">
      <div class="form-header">
        <a routerLink="/services" class="back-link">← Quay lại danh mục dịch vụ</a>
        <h1>{{ isEdit ? 'Chỉnh Sửa Dịch Vụ #' + id : 'Thêm Tiện Ích / Dịch Vụ Mới' }}</h1>
        <p>Cập nhật tên dịch vụ, đơn giá và mô tả tiện ích phục vụ cho khách lưu trú.</p>
      </div>

      <form (ngSubmit)="onSubmit()" class="form-card-main">
        <div class="form-grid-2">
          <div class="form-group">
            <label for="name">Tên dịch vụ / Tiện ích <span class="required">*</span></label>
            <input 
              id="name" 
              type="text" 
              [(ngModel)]="item.name" 
              name="name" 
              class="form-control" 
              placeholder="VD: Dịch vụ Spa & Massage..." 
              required
            >
          </div>

          <div class="form-group">
            <label for="price">Đơn giá dịch vụ (VNĐ) <span class="required">*</span></label>
            <input 
              id="price" 
              type="number" 
              [(ngModel)]="item.price" 
              name="price" 
              class="form-control" 
              placeholder="VD: 500000" 
              required
            >
            <span class="price-hint" *ngIf="item.price">Hiển thị: <strong>{{ item.price | number:'1.0-0' }}₫</strong> / lượt</span>
          </div>
        </div>

        <div class="form-group">
          <label for="description">Mô tả chi tiết quyền lợi & Quy trình phục vụ</label>
          <textarea 
            id="description" 
            [(ngModel)]="item.description" 
            name="description" 
            rows="4" 
            class="form-control" 
            placeholder="VD: Trải nghiệm liệu trình thư giãn toàn thân 60 phút với tinh dầu tự nhiên..."
          ></textarea>
        </div>

        <div class="form-actions-row">
          <button type="submit" class="btn btn-gold btn-lg" [disabled]="!item.name">
            {{ isEdit ? '💾 Lưu thay đổi' : '✨ Tạo dịch vụ mới' }}
          </button>
          <button type="button" class="btn btn-secondary btn-lg" (click)="router.navigate(['/services'])">
            Hủy thao tác
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./service-form.component.scss']
})
export class ServiceFormComponent implements OnInit {
  item: any = { name: '', price: 0, description: '' };
  isEdit = false;
  id = 0;

  constructor(
    private service: HotelServiceService,
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
    o.subscribe(() => this.router.navigate(['/services']));
  }
}
