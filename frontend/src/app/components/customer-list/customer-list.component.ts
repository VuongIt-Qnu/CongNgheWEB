import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/models';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header-row">
        <div>
          <span class="header-tag">QUẢN TRỊ DỮ LIỆU</span>
          <h1>Danh Sách Khách Hàng</h1>
          <p>Quản lý hồ sơ thông tin cá nhân, liên hệ và lịch sử các khách hàng lưu trú tại Resort.</p>
        </div>
        <a routerLink="/customers/new" class="btn btn-gold">+ Thêm khách hàng mới</a>
      </div>

      <!-- Search Toolbar -->
      <div class="table-toolbar">
        <div class="search-input-wrap">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (ngModelChange)="load()" 
            placeholder="Tìm theo họ tên, số điện thoại, email, số CCCD..."
          >
          <button *ngIf="searchTerm" (click)="searchTerm = ''; load()" class="btn-clear">✕</button>
        </div>
      </div>

      <!-- Table Card -->
      <div class="card-table-wrap">
        <table class="table-modern">
          <thead>
            <tr>
              <th>Họ & Tên khách hàng</th>
              <th>Số điện thoại</th>
              <th>Địa chỉ Email</th>
              <th>Số CMND / CCCD</th>
              <th>Địa chỉ cư trú</th>
              <th style="text-align: right;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of customers">
              <td>
                <div class="customer-avatar-cell">
                  <div class="avatar-badge">{{ getInitials(c.name) }}</div>
                  <div class="customer-meta">
                    <strong>{{ c.name }}</strong>
                    <span class="sub-id">#CUST-{{ c.id }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="phone-text">{{ c.phone || 'Chưa cập nhật' }}</span>
              </td>
              <td>
                <span class="email-text">{{ c.email || 'Chưa cập nhật' }}</span>
              </td>
              <td>
                <span class="idcard-pill">{{ c.idCard || 'N/A' }}</span>
              </td>
              <td class="address-cell">
                <span>{{ c.address || 'Chưa cập nhật' }}</span>
              </td>
              <td style="text-align: right;">
                <div class="row-actions">
                  <a [routerLink]="['/customers/edit', c.id]" class="btn btn-secondary btn-sm" title="Chỉnh sửa">
                    ✏️ Sửa
                  </a>
                  <button (click)="delete(c.id)" class="btn btn-danger btn-sm" title="Xóa khách hàng">
                    🗑️ Xóa
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="customers.length === 0">
              <td colspan="6" class="empty-table-cell">
                <div class="empty-state">
                  <span>👥</span>
                  <p>Không tìm thấy hồ sơ khách hàng nào.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  searchTerm = '';

  constructor(private service: CustomerService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.getAll(this.searchTerm || undefined).subscribe(d => this.customers = d);
  }

  getInitials(name?: string): string {
    if (!name) return 'KH';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  delete(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa hồ sơ khách hàng này?')) {
      this.service.delete(id).subscribe(() => this.load());
    }
  }
}
