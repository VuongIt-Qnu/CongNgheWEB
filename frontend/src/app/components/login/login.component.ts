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
  selector: 'app-login',
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
          <p class="brand-tagline">Hệ thống Quản lý Khách sạn & Nghỉ dưỡng Cao cấp</p>
        </div>

        <div class="auth-header">
          <h2>Đăng nhập tài khoản</h2>
          <p>Chào mừng quý khách quay trở lại trải nghiệm tiện ích.</p>
        </div>

        <!-- Alert Error Message -->
        <div class="auth-alert error" *ngIf="error">
          <span>⚠️</span>
          <p>{{ error }}</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Địa chỉ Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="VD: admin@example.com" autocomplete="email">
            <mat-icon matSuffix>mail</mat-icon>
            @if (form.controls.email.hasError('required') && form.controls.email.touched) {
              <mat-error>Vui lòng nhập email.</mat-error>
            }
            @if (form.controls.email.hasError('email') && form.controls.email.touched) {
              <mat-error>Email không đúng định dạng.</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Mật khẩu</mat-label>
            <input matInput [type]="showPassword ? 'text' : 'password'" formControlName="password" placeholder="••••••••" autocomplete="current-password">
            <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword" [attr.aria-label]="'Hiện/ẩn mật khẩu'">
              <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (form.controls.password.hasError('required') && form.controls.password.touched) {
              <mat-error>Vui lòng nhập mật khẩu.</mat-error>
            }
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" id="login-submit" class="btn-block submit-btn" [disabled]="loading || form.invalid">
            @if (loading) {
              <mat-spinner diameter="20" class="btn-spinner"></mat-spinner>
              <span>Đang xác thực tài khoản...</span>
            } @else {
              <span>Đăng nhập vào hệ thống</span>
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>Chưa có tài khoản khách hàng? <a routerLink="/register">Đăng ký ngay</a></p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
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
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại Email hoặc Mật khẩu.';
        this.loading = false;
      }
    });
  }
}
