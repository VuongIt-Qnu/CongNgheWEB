import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="reg-name">Họ và tên <span class="req">*</span></label>
            <input 
              type="text" 
              id="reg-name" 
              [(ngModel)]="name" 
              name="name" 
              class="form-control" 
              required 
              placeholder="VD: Nguyễn Văn A"
            >
          </div>

          <div class="form-group">
            <label for="reg-email">Địa chỉ Email <span class="req">*</span></label>
            <input 
              type="email" 
              id="reg-email" 
              [(ngModel)]="email" 
              name="email" 
              class="form-control" 
              required 
              placeholder="VD: nguyenvana@gmail.com"
            >
          </div>

          <div class="form-group">
            <label for="reg-phone">Số điện thoại liên hệ</label>
            <input 
              type="text" 
              id="reg-phone" 
              [(ngModel)]="phone" 
              name="phone" 
              class="form-control" 
              placeholder="VD: 0901 234 567"
            >
          </div>

          <div class="form-group">
            <label for="reg-password">Mật khẩu bảo mật <span class="req">*</span></label>
            <input 
              type="password" 
              id="reg-password" 
              [(ngModel)]="password" 
              name="password" 
              class="form-control" 
              required 
              minlength="6" 
              placeholder="Tối thiểu 6 ký tự"
            >
          </div>

          <button type="submit" class="btn btn-gold btn-lg btn-block" [disabled]="loading || !name || !email || !password">
            {{ loading ? 'Đang tạo tài khoản...' : 'Hoàn tất Đăng ký & Đăng nhập' }}
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
  name = '';
  email = '';
  phone = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    this.auth.register(this.name, this.email, this.password, this.phone).subscribe({
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
