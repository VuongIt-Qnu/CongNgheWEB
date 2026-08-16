import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="form-container">
      <div class="form-header">
        <a routerLink="/customers" class="back-link">← Quay lại danh sách khách hàng</a>
        <h1>{{ isEdit ? 'Chỉnh Sửa Thông Tin Khách Hàng #' + id : 'Thêm Hồ Sơ Khách Hàng Mới' }}</h1>
        <p>Cập nhật họ tên, thông tin liên lạc và giấy tờ tùy thân của khách lưu trú.</p>
      </div>

      <form (ngSubmit)="onSubmit()" class="form-card-main">
        <div class="form-grid-2">
          <div class="form-group">
            <label for="name">Họ và tên khách hàng <span class="required">*</span></label>
            <input 
              id="name" 
              type="text" 
              [(ngModel)]="item.name" 
              name="name" 
              class="form-control" 
              placeholder="VD: Nguyễn Văn A" 
              required
            >
          </div>

          <div class="form-group">
            <label for="phone">Số điện thoại liên hệ</label>
            <input 
              id="phone" 
              type="text" 
              [(ngModel)]="item.phone" 
              name="phone" 
              class="form-control" 
              placeholder="VD: 0912 345 678"
            >
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label for="email">Địa chỉ Email</label>
            <input 
              id="email" 
              type="email" 
              [(ngModel)]="item.email" 
              name="email" 
              class="form-control" 
              placeholder="VD: nguyenvana@gmail.com"
            >
          </div>

          <div class="form-group">
            <label for="idCard">Số CMND / Thẻ CCCD / Hộ chiếu</label>
            <input 
              id="idCard" 
              type="text" 
              [(ngModel)]="item.idCard" 
              name="idCard" 
              class="form-control" 
              placeholder="VD: 079099001234"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="address">Địa chỉ thường trú / Tỉnh Thành</label>
          <input 
            id="address" 
            type="text" 
            [(ngModel)]="item.address" 
            name="address" 
            class="form-control" 
            placeholder="VD: Quận 1, TP. Hồ Chí Minh"
          >
        </div>

        <div class="form-actions-row">
          <button type="submit" class="btn btn-gold btn-lg" [disabled]="!item.name">
            {{ isEdit ? '💾 Lưu thay đổi' : '✨ Tạo hồ sơ khách hàng' }}
          </button>
          <button type="button" class="btn btn-secondary btn-lg" (click)="router.navigate(['/customers'])">
            Hủy thao tác
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./customer-form.component.scss']
})
export class CustomerFormComponent implements OnInit {
  item: any = { name: '', phone: '', email: '', idCard: '', address: '' };
  isEdit = false;
  id = 0;

  constructor(
    private service: CustomerService,
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
    o.subscribe(() => this.router.navigate(['/customers']));
  }
}
