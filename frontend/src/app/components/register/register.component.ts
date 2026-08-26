import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="auth-page-container">
      <div class="auth-card-glass">
        <!-- Logo & Branding -->
        <div class="auth-brand">
          <div class="brand-icon-big">✨</div>
          <h1>AURORA RESORT</h1>
          <p class="brand-tagline">Đăng Ký Thành Viên Nghỉ Dưỡng Thượng Hạng</p>
        </div>

        <div class="auth-header">
          <h2>Tạo tài khoản mới</h2>
          <p>Điền thông tin để tận hưởng nhiều ưu đãi đặt phòng độc quyền.</p>
        </div>

        <!-- Alert Error Message -->
        <div class="auth-alert error" *ngIf="error">
          <span>⚠️</span>
          <p>{{ error }}</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Họ và tên</mat-label>
            <input matInput type="text" formControlName="name" placeholder="VD: Nguyễn Văn A" autocomplete="name">
            @if (form.controls.name.hasError('required') && form.controls.name.touched) {
              <mat-error>Vui lòng nhập họ tên.</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Địa chỉ Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="VD: nguyenvana@gmail.com" autocomplete="email">
            @if (form.controls.email.hasError('required') && form.controls.email.touched) {
              <mat-error>Vui lòng nhập email.</mat-error>
            }
            @if (form.controls.email.hasError('email') && form.controls.email.touched) {
              <mat-error>Email không đúng định dạng.</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Số điện thoại liên hệ</mat-label>
            <input matInput type="text" formControlName="phone" placeholder="VD: 0901 234 567" autocomplete="tel">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Mật khẩu bảo mật</mat-label>
            <input matInput [type]="showPassword ? 'text' : 'password'" formControlName="password" placeholder="Tối thiểu 6 ký tự" autocomplete="new-password">
            <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword" [attr.aria-label]="'Hiện/ẩn mật khẩu'">
              <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (form.controls.password.hasError('required') && form.controls.password.touched) {
              <mat-error>Vui lòng nhập mật khẩu.</mat-error>
            }
            @if (form.controls.password.hasError('minlength') && form.controls.password.touched) {
              <mat-error>Mật khẩu phải có tối thiểu 6 ký tự.</mat-error>
            }
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" class="btn-block submit-btn" [disabled]="loading || form.invalid">
            @if (loading) {
              <mat-spinner diameter="20" class="btn-spinner"></mat-spinner>
              <span>Đang tạo tài khoản...</span>
            } @else {
              <span>Hoàn tất Đăng ký & Đăng nhập</span>
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>Đã có tài khoản thành viên? <a routerLink="/login">Đăng nhập tại đây</a></p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  error = '';
  loading = false;
  showPassword = false;

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    const { name, email, password, phone } = this.form.getRawValue();
    this.auth.register(name, email, password, phone).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Đăng ký thất bại. Email có thể đã được đăng ký.';
        this.loading = false;
      }
    });
  }
}
