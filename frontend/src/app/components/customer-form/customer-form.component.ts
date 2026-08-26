import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="form-container">
      <div class="form-header">
        <a routerLink="/customers" class="back-link">← Quay lại danh sách khách hàng</a>
        <h1>{{ isEdit ? 'Chỉnh Sửa Thông Tin Khách Hàng #' + id : 'Thêm Hồ Sơ Khách Hàng Mới' }}</h1>
        <p>Cập nhật họ tên, thông tin liên lạc và giấy tờ tùy thân của khách lưu trú.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-card-main">
        <div class="form-grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Họ và tên khách hàng</mat-label>
            <input matInput type="text" formControlName="name" placeholder="VD: Nguyễn Văn A">
            @if (form.controls.name.hasError('required') && form.controls.name.touched) {
              <mat-error>Vui lòng nhập họ tên.</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Số điện thoại liên hệ</mat-label>
            <input matInput type="text" formControlName="phone" placeholder="VD: 0912 345 678">
          </mat-form-field>
        </div>

        <div class="form-grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Địa chỉ Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="VD: nguyenvana@gmail.com">
            @if (form.controls.email.hasError('email') && form.controls.email.touched) {
              <mat-error>Email không đúng định dạng.</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Số CMND / Thẻ CCCD / Hộ chiếu</mat-label>
            <input matInput type="text" formControlName="idCard" placeholder="VD: 079099001234">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Địa chỉ thường trú / Tỉnh Thành</mat-label>
          <input matInput type="text" formControlName="address" placeholder="VD: Quận 1, TP. Hồ Chí Minh">
        </mat-form-field>

        <div class="form-actions-row">
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
            {{ isEdit ? '💾 Lưu thay đổi' : '✨ Tạo hồ sơ khách hàng' }}
          </button>
          <button mat-stroked-button type="button" (click)="router.navigate(['/customers'])">
            Hủy thao tác
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./customer-form.component.scss']
})
export class CustomerFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    phone: [''],
    email: ['', Validators.email],
    idCard: [''],
    address: [''],
  });

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
      this.service.getById(this.id).subscribe(d => this.form.patchValue({
        name: d.name,
        phone: d.phone ?? '',
        email: d.email ?? '',
        idCard: d.idCard ?? '',
        address: d.address ?? '',
      }));
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const o = this.isEdit ? this.service.update(this.id, value) : this.service.create(value);
    o.subscribe(() => this.router.navigate(['/customers']));
  }
}
