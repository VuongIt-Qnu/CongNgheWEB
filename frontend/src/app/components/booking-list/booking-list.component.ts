import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { VnDatePipe } from '../../pipes/vn-date.pipe';
import { BookingStatusPipe, BOOKING_STATUS_MAP } from '../../pipes/booking-status.pipe';

/** Cấu hình hiển thị actions theo từng trạng thái */
const STATUS_ACTIONS: Record<string, { action: string; label: string; icon: string; btnClass: string; newStatus: string; confirmMsg: string }[]> = {
  pending: [
    { action: 'confirm',   label: 'Xác nhận',    icon: '✅', btnClass: 'btn-action-confirm',  newStatus: 'confirmed', confirmMsg: 'Bạn có chắc muốn xác nhận đặt phòng này?' },
    { action: 'reject',    label: 'Từ chối',      icon: '❌', btnClass: 'btn-action-danger',   newStatus: 'cancelled', confirmMsg: 'Bạn có chắc muốn từ chối đặt phòng này?' },
  ],
  confirmed: [
    { action: 'checkin',   label: 'Nhận phòng',   icon: '🏨', btnClass: 'btn-action-checkin', newStatus: 'occupied',  confirmMsg: 'Xác nhận khách đã đến và nhận phòng?' },
    { action: 'noshow',    label: 'Không đến',    icon: '⚠️', btnClass: 'btn-action-noshow',  newStatus: 'no_show',  confirmMsg: 'Đánh dấu khách này là không đến (no-show)?' },
    { action: 'cancel',    label: 'Hủy',          icon: '❌', btnClass: 'btn-action-danger',   newStatus: 'cancelled', confirmMsg: 'Bạn có chắc muốn hủy đặt phòng đã xác nhận này?' },
  ],
  occupied: [
    { action: 'checkout',  label: 'Trả phòng',    icon: '🔓', btnClass: 'btn-action-checkout', newStatus: 'completed', confirmMsg: 'Xác nhận khách đã trả phòng và hoàn tất?' },
  ],
  completed: [],
  cancelled: [],
  no_show:   [],
};

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, VnDatePipe, BookingStatusPipe],
  template: `
    <div class="page-container">
      <!-- Toast Notification -->
      <div class="toast-notification" *ngIf="toastMsg" [class]="toastType">
        <span>{{ toastType === 'toast-success' ? '✅' : '❌' }}</span>
        <p>{{ toastMsg }}</p>
      </div>

      <!-- Header -->
      <div class="page-header-row">
        <div>
          <span class="header-tag">{{ isCustomer ? 'LỊCH SỬ NGHỈ DƯỠNG' : 'QUẢN LÝ ĐẶT PHÒNG' }}</span>
          <h1>{{ isCustomer ? 'Đơn Đặt Phòng Của Tôi' : 'Danh Sách Đơn Đặt Phòng' }}</h1>
          <p>{{ isCustomer ? 'Theo dõi lịch trình và trạng thái các chuyến nghỉ dưỡng của bạn tại Aurora Resort.' : 'Tra cứu, duyệt đơn và quản lý toàn bộ các giao dịch đặt phòng của resort.' }}</p>
        </div>
        <a routerLink="/bookings/new" class="btn btn-gold">+ {{ isCustomer ? 'Đặt thêm phòng' : 'Tạo đơn đặt phòng mới' }}</a>
      </div>

      <!-- Status Filter Tabs -->
      <div class="status-summary-bar">
        <div class="status-pill" [class.active]="selectedStatus === ''" (click)="setStatusFilter('')">
          <span>Tất cả đơn</span>
          <strong>{{ bookings.length }}</strong>
        </div>
        <div class="status-pill" [class.active]="selectedStatus === 'pending'" (click)="setStatusFilter('pending')">
          <span class="status-dot orange"></span>
          <span>Chờ xử lý</span>
          <strong>{{ getCountByStatus('pending') }}</strong>
        </div>
        <div class="status-pill" [class.active]="selectedStatus === 'confirmed'" (click)="setStatusFilter('confirmed')">
          <span class="status-dot blue"></span>
          <span>Đã xác nhận</span>
          <strong>{{ getCountByStatus('confirmed') }}</strong>
        </div>
        <div class="status-pill" [class.active]="selectedStatus === 'occupied'" (click)="setStatusFilter('occupied')">
          <span class="status-dot green"></span>
          <span>Đang lưu trú</span>
          <strong>{{ getCountByStatus('occupied') }}</strong>
        </div>
        <div class="status-pill" [class.active]="selectedStatus === 'completed'" (click)="setStatusFilter('completed')">
          <span class="status-dot gray"></span>
          <span>Đã hoàn tất</span>
          <strong>{{ getCountByStatus('completed') }}</strong>
        </div>
        <div class="status-pill" [class.active]="selectedStatus === 'cancelled'" (click)="setStatusFilter('cancelled')">
          <span class="status-dot red"></span>
          <span>Đã hủy</span>
          <strong>{{ getCountByStatus('cancelled') }}</strong>
        </div>
        <div class="status-pill" [class.active]="selectedStatus === 'no_show'" (click)="setStatusFilter('no_show')">
          <span class="status-dot orange"></span>
          <span>Không đến</span>
          <strong>{{ getCountByStatus('no_show') }}</strong>
        </div>
      </div>

      <!-- Search Toolbar (Admin only) -->
      <div class="table-toolbar" *ngIf="!isCustomer">
        <div class="search-input-wrap">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (ngModelChange)="filterBookings()" 
            placeholder="Tìm theo tên khách hàng, số phòng..."
          >
          <button *ngIf="searchTerm" (click)="searchTerm = ''; filterBookings()" class="btn-clear">✕</button>
        </div>
      </div>

      <!-- Main Bookings Table -->
      <div class="card-table-wrap">
        <table class="table-modern">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th *ngIf="!isCustomer">Khách hàng</th>
              <th>Phòng nghỉ</th>
              <th>Lịch trình lưu trú</th>
              <th>Tổng chi phí</th>
              <th>Ghi chú</th>
              <th>Trạng thái</th>
              <th *ngIf="!isCustomer" style="text-align: right; min-width: 200px;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of filteredBookings">
              <td>
                <span class="booking-code">#BK-{{ b.id }}</span>
              </td>
              <td *ngIf="!isCustomer">
                <div class="customer-cell">
                  <strong>{{ b.customerName }}</strong>
                  <span class="customer-sub-id">ID Khách: #{{ b.customerId }}</span>
                </div>
              </td>
              <td>
                <span class="room-pill">Phòng {{ b.roomNumber }}</span>
              </td>
              <td>
                <div class="dates-cell">
                  <span>📥 {{ b.checkInDate | vnDate }}</span>
                  <span>📤 {{ b.checkOutDate | vnDate }}</span>
                </div>
              </td>
              <td>
                <strong class="price-text text-gold">{{ b.totalPrice | number:'1.0-0' }}₫</strong>
              </td>
              <td class="notes-cell">
                <span class="notes-text">{{ b.notes || '---' }}</span>
              </td>
              <td>
                <span class="badge" [class]="b.status">
                  {{ b.status | bookingStatus:'icon' }} {{ b.status | bookingStatus }}
                </span>
              </td>
              <!-- Admin Action Buttons -->
              <td *ngIf="!isCustomer" style="text-align: right;">
                <div class="row-actions">
                  <!-- Dynamic action buttons based on status -->
                  <ng-container *ngFor="let act of getActions(b.status)">
                    <button
                      class="btn btn-sm {{ act.btnClass }}"
                      (click)="performAction(b.id, act.newStatus, act.confirmMsg)"
                      [disabled]="processingId === b.id"
                      [title]="act.label"
                    >
                      {{ act.icon }} {{ act.label }}
                    </button>
                  </ng-container>

                  <!-- Edit button only for non-terminal statuses -->
                  <a
                    *ngIf="isEditable(b.status)"
                    [routerLink]="['/bookings/edit', b.id]"
                    class="btn btn-secondary btn-sm"
                    title="Chỉnh sửa chi tiết"
                  >
                    ✏️ Sửa
                  </a>

                  <!-- Delete (admin only) -->
                  <button
                    (click)="delete(b.id)"
                    class="btn btn-danger btn-sm"
                    title="Xóa đơn"
                    [disabled]="processingId === b.id"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="filteredBookings.length === 0">
              <td [attr.colspan]="isCustomer ? 6 : 8" class="empty-table-cell">
                <div class="empty-state">
                  <span>📋</span>
                  <p>Không tìm thấy đơn đặt phòng nào.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    /* ── Toast notification ── */
    .toast-notification {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      animation: slideInRight 0.3s ease-out;
      max-width: 380px;
    }
    .toast-success {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.35);
      color: #86efac;
    }
    .toast-error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #fca5a5;
    }
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }

    /* ── Action buttons ── */
    .btn-action-confirm  { background: rgba(34, 197, 94, 0.15); color: #86efac; border: 1px solid rgba(34, 197, 94, 0.25); }
    .btn-action-confirm:hover { background: rgba(34, 197, 94, 0.25); }

    .btn-action-checkin  { background: rgba(59, 130, 246, 0.15); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.25); }
    .btn-action-checkin:hover { background: rgba(59, 130, 246, 0.25); }

    .btn-action-checkout { background: rgba(168, 85, 247, 0.15); color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.25); }
    .btn-action-checkout:hover { background: rgba(168, 85, 247, 0.25); }

    .btn-action-noshow   { background: rgba(245, 158, 11, 0.15); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.25); }
    .btn-action-noshow:hover { background: rgba(245, 158, 11, 0.25); }

    .btn-action-danger   { background: rgba(239, 68, 68, 0.12); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.2); }
    .btn-action-danger:hover { background: rgba(239, 68, 68, 0.22); }

    .row-actions { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }

    /* ── Status badge no_show ── */
    :host ::ng-deep .badge.no_show {
      background: rgba(245, 158, 11, 0.12);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.25);
    }
    :host ::ng-deep .badge.no_show::before { background: #fbbf24; }

    /* ── Status dots ── */
    .status-dot.gray { background: #94a3b8; }
    .status-dot.blue { background: #3b82f6; }
    .status-dot.orange { background: #f59e0b; }
    .status-dot.green { background: #22c55e; }
    .status-dot.red { background: #ef4444; }
  `],
  styleUrls: ['./booking-list.component.scss']
})
export class BookingListComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  searchTerm = '';
  selectedStatus = '';
  isCustomer = false;

  /** ID đang được xử lý (để disable button) */
  processingId: number | null = null;

  /** Toast notification */
  toastMsg = '';
  toastType = 'toast-success';
  private toastTimer: any;

  constructor(private service: BookingService, private auth: AuthService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.isCustomer = user?.role === 'customer';
    this.load();
  }

  load(): void {
    this.service.getAll().subscribe(d => {
      this.bookings = d;
      this.filterBookings();
    });
  }

  filterBookings(): void {
    this.filteredBookings = this.bookings.filter(b => {
      const matchSearch = !this.searchTerm ||
        b.customerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        b.roomNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (b.notes && b.notes.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchStatus = !this.selectedStatus || b.status === this.selectedStatus;
      return matchSearch && matchStatus;
    });
  }

  setStatusFilter(status: string): void {
    this.selectedStatus = status;
    this.filterBookings();
  }

  getCountByStatus(status: string): number {
    return this.bookings.filter(b => b.status === status).length;
  }

  /** Lấy danh sách action buttons theo trạng thái */
  getActions(status: string) {
    return STATUS_ACTIONS[status] || [];
  }

  /** Chỉ hiển thị nút Sửa cho booking chưa terminal */
  isEditable(status: string): boolean {
    return !['completed', 'cancelled', 'no_show'].includes(status);
  }

  /** Thực hiện action với confirmation dialog */
  performAction(bookingId: number, newStatus: string, confirmMsg: string): void {
    if (!confirm(confirmMsg)) return;

    this.processingId = bookingId;
    this.service.updateStatus(bookingId, newStatus).subscribe({
      next: (updated) => {
        // Cập nhật local state ngay (không cần reload toàn bộ)
        const idx = this.bookings.findIndex(b => b.id === bookingId);
        if (idx !== -1) {
          this.bookings[idx] = { ...this.bookings[idx], status: updated.status };
        }
        this.filterBookings();
        this.processingId = null;

        const label = BOOKING_STATUS_MAP[newStatus]?.label || newStatus;
        this.showToast(`Đã cập nhật trạng thái: ${label}`, 'toast-success');
      },
      error: (err) => {
        this.processingId = null;
        const msg = err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
        this.showToast(msg, 'toast-error');
      }
    });
  }

  delete(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa/hủy đơn đặt phòng này? Hành động này không thể hoàn tác.')) {
      this.service.delete(id).subscribe({
        next: () => {
          this.load();
          this.showToast('Đã xóa đơn đặt phòng thành công.', 'toast-success');
        },
        error: () => this.showToast('Không thể xóa đơn này.', 'toast-error')
      });
    }
  }

  private showToast(msg: string, type: string): void {
    clearTimeout(this.toastTimer);
    this.toastMsg = msg;
    this.toastType = type;
    this.toastTimer = setTimeout(() => { this.toastMsg = ''; }, 4000);
  }
}
