import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, NavbarComponent],
  template: `
    <div class="app-layout">
      <app-navbar></app-navbar>

      <main class="main-content-container">
        <router-outlet></router-outlet>
      </main>

      <footer class="site-footer" *ngIf="auth.isLoggedIn()">
        <div class="footer-inner">
          <div class="footer-col-brand">
            <div class="footer-brand-title">
              <span class="gold-icon">✨</span>
              <h3>AURORA RESORT</h3>
            </div>
            <p class="footer-desc">
              Hệ thống khách sạn & khu nghỉ dưỡng cao cấp chuẩn 5 sao quốc tế. Nơi trải nghiệm kỳ nghỉ dưỡng thăng hoa và trọn vẹn nhất.
            </p>
          </div>

          <div class="footer-col-links">
            <h4>Liên Kết Nhanh</h4>
            <ul>
              <li><a routerLink="/">Trang chủ & Tổng quan</a></li>
              <li><a routerLink="/rooms" *ngIf="auth.getCurrentUser()?.role !== 'customer'">Quản lý phòng</a></li>
              <li><a routerLink="/bookings">Đặt phòng</a></li>
              <li><a routerLink="/services">Dịch vụ & Tiện ích</a></li>
            </ul>
          </div>

          <div class="footer-col-contact">
            <h4>Thông Tin Liên Hệ</h4>
            <p>📍 05 Trần Văn Ơn, Quy Nhơn Nam, Gia Lai</p>
            <p>📞 Hotline 24/7: <strong>1900 8888 / 028 3822 9999</strong></p>
            <p>✉️ Email: <strong>concierge&#64;auroraresort.com</strong></p>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© 2026 Aurora Resort & Luxury Hospitality Management. Đồ án Công nghệ Web.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-content-container {
      flex: 1;
      max-width: 1360px;
      width: 100%;
      margin: 0 auto;
      padding: 32px 24px 64px;
    }

    .site-footer {
      background: #040c18;
      border-top: 1px solid rgba(198, 169, 106, 0.2);
      padding: 48px 24px 24px;
      margin-top: auto;
    }

    .footer-inner {
      max-width: 1360px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.5fr 1fr 1.2fr;
      gap: 40px;
      padding-bottom: 36px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 28px;
      }
    }

    .footer-col-brand {
      .footer-brand-title {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;

        .gold-icon {
          font-size: 20px;
        }

        h3 {
          font-family: var(--font-serif);
          color: var(--gold);
          font-size: 18px;
          letter-spacing: 0.08em;
        }
      }

      .footer-desc {
        color: var(--text-muted);
        font-size: 13.5px;
        line-height: 1.6;
        max-width: 420px;
      }
    }

    .footer-col-links, .footer-col-contact {
      h4 {
        font-size: 14px;
        color: #fff;
        margin-bottom: 14px;
        letter-spacing: 0.04em;
      }

      ul {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 8px;

        a {
          color: var(--text-muted);
          font-size: 13.5px;
          &:hover {
            color: var(--gold);
          }
        }
      }

      p {
        color: var(--text-muted);
        font-size: 13.5px;
        line-height: 1.8;
      }
    }

    .footer-bottom {
      max-width: 1360px;
      margin: 0 auto;
      padding-top: 20px;
      text-align: center;
      color: var(--text-dim);
      font-size: 12.5px;
    }
  `]
})
export class AppComponent {
  title = 'Aurora Resort - Quản lý Khách sạn & Nghỉ dưỡng';

  constructor(public auth: AuthService) {}
}
