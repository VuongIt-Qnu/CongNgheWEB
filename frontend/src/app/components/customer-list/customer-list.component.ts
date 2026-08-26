import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/models';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatTableModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header-row">
        <div>
          <span class="header-tag">QUẢN TRỊ DỮ LIỆU</span>
          <h1>Danh Sách Khách Hàng</h1>
          <p>Quản lý hồ sơ thông tin cá nhân, liên hệ và lịch sử các khách hàng lưu trú tại Resort.</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/customers/new">+ Thêm khách hàng mới</a>
      </div>

      <!-- Search Toolbar -->
      <div class="table-toolbar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-icon matPrefix>search</mat-icon>
          <input matInput type="text" [formControl]="searchControl" placeholder="Tìm theo họ tên, số điện thoại, email, số CCCD...">
          @if (searchControl.value) {
            <button mat-icon-button matSuffix type="button" (click)="searchControl.setValue('')" aria-label="Xóa tìm kiếm">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>
      </div>

      <!-- Table Card -->
      <div class="card-table-wrap">
        <table mat-table [dataSource]="customers" class="table-modern">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Họ & Tên khách hàng</th>
            <td mat-cell *matCellDef="let c">
              <div class="customer-avatar-cell">
                <div class="avatar-badge">{{ getInitials(c.name) }}</div>
                <div class="customer-meta">
                  <strong>{{ c.name }}</strong>
                  <span class="sub-id">#CUST-{{ c.id }}</span>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef>Số điện thoại</th>
            <td mat-cell *matCellDef="let c"><span class="phone-text">{{ c.phone || 'Chưa cập nhật' }}</span></td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Địa chỉ Email</th>
            <td mat-cell *matCellDef="let c"><span class="email-text">{{ c.email || 'Chưa cập nhật' }}</span></td>
          </ng-container>

          <ng-container matColumnDef="idCard">
            <th mat-header-cell *matHeaderCellDef>Số CMND / CCCD</th>
            <td mat-cell *matCellDef="let c"><span class="idcard-pill">{{ c.idCard || 'N/A' }}</span></td>
          </ng-container>

          <ng-container matColumnDef="address">
            <th mat-header-cell *matHeaderCellDef>Địa chỉ cư trú</th>
            <td mat-cell *matCellDef="let c" class="address-cell">{{ c.address || 'Chưa cập nhật' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="text-align: right;">Thao tác</th>
            <td mat-cell *matCellDef="let c" style="text-align: right;">
              <div class="row-actions">
                <a mat-stroked-button [routerLink]="['/customers/edit', c.id]" title="Chỉnh sửa">
                  <mat-icon>edit</mat-icon> Sửa
                </a>
                <button mat-button color="warn" (click)="delete(c.id)" title="Xóa khách hàng">
                  <mat-icon>delete</mat-icon> Xóa
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>

        @if (customers.length === 0) {
          <div class="empty-state">
            <span>👥</span>
            <p>Không tìm thấy hồ sơ khách hàng nào.</p>
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  customers: Customer[] = [];
  searchControl = new FormControl('', { nonNullable: true });
  columns = ['name', 'phone', 'email', 'idCard', 'address', 'actions'];

  constructor(private service: CustomerService) {}

  ngOnInit(): void {
    this.load();

    // debounceTime + distinctUntilChanged: giảm số request khi gõ nhanh.
    // switchMap: huỷ request cũ khi có request mới, tránh trường hợp response chậm của
    // từ khoá cũ trả về sau và ghi đè nhầm lên kết quả của từ khoá mới hơn.
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.service.getAll(term || undefined)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(d => this.customers = d);
  }

  load(): void {
    this.service.getAll(this.searchControl.value || undefined).subscribe(d => this.customers = d);
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
