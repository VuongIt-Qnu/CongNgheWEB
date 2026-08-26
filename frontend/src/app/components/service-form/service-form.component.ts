import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HotelServiceService } from '../../services/hotel-service.service';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="form-container">
      <div class="form-header">
        <a routerLink="/services" class="back-link">← Quay lại danh mục dịch vụ</a>
        <h1>{{ isEdit ? 'Chỉnh Sửa Dịch Vụ #' + id : 'Thêm Tiện Ích / Dịch Vụ Mới' }}</h1>
        <p>Cập nhật tên dịch vụ, đơn giá và mô tả tiện ích phục vụ cho khách lưu trú.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-card-main">
        <div class="form-grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Tên dịch vụ / Tiện ích</mat-label>
            <input matInput type="text" formControlName="name" placeholder="VD: Dịch vụ Spa & Massage...">
            @if (form.controls.name.hasError('required') && form.controls.name.touched) {
              <mat-error>Vui lòng nhập tên dịch vụ.</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Đơn giá dịch vụ (VNĐ)</mat-label>
            <input matInput type="number" formControlName="price" placeholder="VD: 500000">
            <span matTextSuffix>₫</span>
            @if (form.controls.price.hasError('required') && form.controls.price.touched) {
              <mat-error>Vui lòng nhập đơn giá.</mat-error>
            }
            @if (form.controls.price.hasError('min') && form.controls.price.touched) {
              <mat-error>Đơn giá không được âm.</mat-error>
            }
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Mô tả chi tiết quyền lợi & Quy trình phục vụ</mat-label>
          <textarea matInput formControlName="description" rows="4" placeholder="VD: Trải nghiệm liệu trình thư giãn toàn thân 60 phút với tinh dầu tự nhiên..."></textarea>
        </mat-form-field>

        <div class="form-actions-row">
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
            {{ isEdit ? '💾 Lưu thay đổi' : '✨ Tạo dịch vụ mới' }}
          </button>
          <button mat-stroked-button type="button" (click)="router.navigate(['/services'])">
            Hủy thao tác
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./service-form.component.scss']
})
export class ServiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    description: [''],
  });

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
      this.service.getById(this.id).subscribe(d => this.form.patchValue({
        name: d.name,
        price: d.price,
        description: d.description ?? '',
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
    o.subscribe(() => this.router.navigate(['/services']));
  }
}
