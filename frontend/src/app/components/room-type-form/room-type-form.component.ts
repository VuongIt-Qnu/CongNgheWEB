import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RoomTypeService } from '../../services/room-type.service';

@Component({
  selector: 'app-room-type-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="form-container">
      <div class="form-header">
        <a routerLink="/room-types" class="back-link">← Quay lại danh mục loại phòng</a>
        <h1>{{ isEdit ? 'Chỉnh Sửa Loại Phòng #' + id : 'Thêm Danh Mục Loại Phòng Mới' }}</h1>
        <p>Cấu hình tên gọi phân khúc phòng và mô tả tiện ích tiêu chuẩn áp dụng.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-card-main">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tên phân khúc / Loại phòng</mat-label>
          <input matInput type="text" formControlName="name" placeholder="VD: Phòng Hướng Biển, Phòng Suite Sang Trọng...">
          @if (form.controls.name.hasError('required') && form.controls.name.touched) {
            <mat-error>Vui lòng nhập tên loại phòng.</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Mô tả đặc điểm & Tiện ích tiêu chuẩn</mat-label>
          <textarea matInput formControlName="description" rows="4" placeholder="VD: Không gian rộng rãi, ban công view trực diện biển, minibar miễn phí..."></textarea>
        </mat-form-field>

        <div class="form-actions-row">
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
            {{ isEdit ? '💾 Lưu thay đổi' : '✨ Tạo loại phòng mới' }}
          </button>
          <button mat-stroked-button type="button" (click)="router.navigate(['/room-types'])">
            Hủy thao tác
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./room-type-form.component.scss']
})
export class RoomTypeFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
  });

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
      this.service.getById(this.id).subscribe(d => this.form.patchValue({
        name: d.name,
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
    o.subscribe(() => this.router.navigate(['/room-types']));
  }
}
