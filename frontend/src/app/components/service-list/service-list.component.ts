import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HotelServiceService } from '../../services/hotel-service.service';
import { HotelService } from '../../models/models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-container">
      <div class="page-header-row">
        <div>
          <span class="header-tag">TIỆN ÍCH RESORT</span>
          <h1>{{ isCustomer ? 'Dịch Vụ & Trải Nghiệm Đẳng Cấp' : 'Quản Lý Danh Mục Dịch Vụ' }}</h1>
          <p>{{ isCustomer ? 'Tận hưởng trọn vẹn kỳ nghỉ với các dịch vụ spa, ẩm thực, đưa đón thượng hạng.' : 'Quản lý bảng giá, thông tin chi tiết các tiện ích và dịch vụ cung cấp cho khách.' }}</p>
        </div>
        @if (!isCustomer) {
          <a mat-raised-button color="primary" routerLink="/services/new">+ Thêm dịch vụ mới</a>
        }
      </div>

      <!-- Services Cards Grid -->
      <div class="services-modern-grid">
        @for (s of services; track s.id) {
          <mat-card appearance="outlined" class="service-box-card">
            <div class="service-header-row">
              <div class="service-icon-pill">
                <span class="icon-emoji">✨</span>
              </div>
              <div class="service-cost-tag">
                <span class="cost-num text-gold font-serif">{{ s.price | number:'1.0-0' }}₫</span>
                <small class="cost-unit">/ lượt</small>
              </div>
            </div>

            <div class="service-body">
              <h3>{{ s.name }}</h3>
              <p>{{ s.description || 'Dịch vụ chất lượng cao được phục vụ bởi đội ngũ chuyên nghiệp của Aurora Resort.' }}</p>
            </div>

            @if (!isCustomer) {
              <div class="service-actions">
                <a mat-stroked-button [routerLink]="['/services/edit', s.id]">
                  <mat-icon>edit</mat-icon> Sửa
                </a>
                <button mat-button color="warn" (click)="delete(s.id)">
                  <mat-icon>delete</mat-icon> Xóa
                </button>
              </div>
            }
          </mat-card>
        }
      </div>
    </div>
  `,
  styleUrls: ['./service-list.component.scss']
})
export class ServiceListComponent implements OnInit {
  services: HotelService[] = [];
  isCustomer = false;

  constructor(private service: HotelServiceService, private auth: AuthService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.isCustomer = user?.role === 'customer';
    this.load();
  }

  load(): void {
    this.service.getAll().subscribe(d => this.services = d);
  }

  delete(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      this.service.delete(id).subscribe(() => this.load());
    }
  }
}
