import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="login-email">Địa chỉ Email <span class="req">*</span></label>
            <input 
              type="email" 
              id="login-email" 
              [(ngModel)]="email" 
              name="email" 
              class="form-control" 
              required 
              placeholder="VD: admin@example.com"
            >
          </div>

          <div class="form-group">
            <label for="login-password">Mật khẩu <span class="req">*</span></label>
            <input 
              type="password" 
              id="login-password" 
              [(ngModel)]="password" 
              name="password" 
              class="form-control" 
              required 
              placeholder="••••••••"
            >
          </div>

          <button type="submit" id="login-submit" class="btn btn-gold btn-lg btn-block" [disabled]="loading || !email || !password">
            {{ loading ? 'Đang xác thực tài khoản...' : 'Đăng nhập vào hệ thống' }}
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
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
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
