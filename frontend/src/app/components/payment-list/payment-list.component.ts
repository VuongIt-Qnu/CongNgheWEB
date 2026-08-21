import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { Payment } from '../../models/models';
import { VnDatePipe } from '../../pipes/vn-date.pipe';
import { PaymentTxStatusPipe, PaymentMethodPipe, PAYMENT_TX_STATUS_MAP } from '../../pipes/payment-status.pipe';

/** Cấu hình action theo từng trạng thái giao dịch (giống pattern STATUS_ACTIONS của booking-list) */
const STATUS_ACTIONS: Record<string, { newStatus: string; label: string; icon: string; btnClass: string; confirmMsg: string }[]> = {
  pending: [
    { newStatus: 'completed', label: 'Xác nhận đã nhận tiền', icon: '✅', btnClass: 'btn-action-confirm', confirmMsg: 'Xác nhận đã nhận được khoản thanh toán này?' },
    { newStatus: 'failed',    label: 'Từ chối',               icon: '❌', btnClass: 'btn-action-danger',  confirmMsg: 'Từ chối/đánh dấu giao dịch này thất bại?' },
  ],
  completed: [
    { newStatus: 'refunded', label: 'Hoàn tiền', icon: '↩️', btnClass: 'btn-action-noshow', confirmMsg: 'Xác nhận hoàn tiền cho giao dịch này?' },
  ],
  failed: [],
  refunded: [],
};

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, VnDatePipe, PaymentTxStatusPipe, PaymentMethodPipe],
  template: `
    <div class="page-container">
      <div class="toast-notification" *ngIf="toastMsg" [class]="toastType">
        <span>{{ toastType === 'toast-success' ? '✅' : '❌' }}</span>
        <p>{{ toastMsg }}</p>
      </div>

      <div class="page-header-row">
        <div>
          <span class="header-tag">ĐỐI SOÁT THANH TOÁN</span>
          <h1>Quản Lý Giao Dịch Thanh Toán</h1>
          <p>Xác nhận các khoản khách đã thanh toán (tiền mặt/chuyển khoản) và theo dõi hoàn tiền.</p>
        </div>
      </div>

      <div class="status-summary-bar">
        <div class="status-pill" [class.active]="selectedStatus === ''" (click)="setStatusFilter('')">
          <span>Tất cả</span>
          <strong>{{ payments.length }}</strong>
        </div>
        <div class="status-pill" [class.active]="selectedStatus === 'pending'" (click)="setStatusFilter('pending')">
          <span class="status-dot orange"></span>
          <span>Chờ xác nhận</span>
          <strong>{{ getCountByStatus('pending') }}</strong>
        </div>
        <div class="status-pill" [class.active]="selectedStatus === 'completed'" (click)="setStatusFilter('completed')">
          <span class="status-dot green"></span>
          <span>Đã xác nhận</span>
          <strong>{{ getCountByStatus('completed') }}</strong>
        </div>
        <div class="status-pill" [class.active]="selectedStatus === 'failed'" (click)="setStatusFilter('failed')">
          <span class="status-dot red"></span>
          <span>Thất bại</span>
          <strong>{{ getCountByStatus('failed') }}</strong>
        </div>
        <div class="status-pill" [class.active]="selectedStatus === 'refunded'" (click)="setStatusFilter('refunded')">
          <span class="status-dot blue"></span>
          <span>Đã hoàn tiền</span>
          <strong>{{ getCountByStatus('refunded') }}</strong>
        </div>
      </div>

      <div class="table-toolbar">
        <div class="search-input-wrap">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (ngModelChange)="filterPayments()"
            placeholder="Tìm theo tên khách hàng, số phòng, mã giao dịch..."
          >
          <button *ngIf="searchTerm" (click)="searchTerm = ''; filterPayments()" class="btn-clear">✕</button>
        </div>
      </div>

      <div class="card-table-wrap">
        <table class="table-modern">
          <thead>
            <tr>
              <th>Mã giao dịch</th>
              <th>Đơn đặt phòng</th>
              <th>Khách hàng</th>
              <th>Số tiền</th>
              <th>Phương thức</th>
              <th>Trạng thái</th>
              <th>Thời gian tạo</th>
              <th style="text-align: right; min-width: 220px;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filteredPayments">
              <td><span class="booking-code">{{ p.transactionCode || ('#PM-' + p.id) }}</span></td>
              <td><span class="room-pill">Đơn #BK-{{ p.bookingId }} • Phòng {{ p.roomNumber }}</span></td>
              <td><strong>{{ p.customerName }}</strong></td>
              <td><strong class="price-text text-gold">{{ p.amount | number:'1.0-0' }}₫</strong></td>
              <td>{{ p.method | paymentMethod:'icon' }} {{ p.method | paymentMethod }}</td>
              <td>
                <span class="badge" [class]="p.status | paymentTxStatus:'cssClass'">
                  {{ p.status | paymentTxStatus:'icon' }} {{ p.status | paymentTxStatus }}
                </span>
              </td>
              <td><span class="dates-cell">{{ p.createdAt | vnDate:'time' }}</span></td>
              <td style="text-align: right;">
                <div class="row-actions">
                  <ng-container *ngFor="let act of getActions(p.status)">
                    <button
                      class="btn btn-sm {{ act.btnClass }}"
                      (click)="performAction(p.id, act.newStatus, act.confirmMsg)"
                      [disabled]="processingId === p.id"
                      [title]="act.label"
                    >
                      {{ act.icon }} {{ act.label }}
                    </button>
                  </ng-container>
                  <span *ngIf="getActions(p.status).length === 0" class="notes-text">—</span>
                </div>
              </td>
            </tr>
            <tr *ngIf="filteredPayments.length === 0">
              <td colspan="8" class="empty-table-cell">
                <div class="empty-state">
                  <span>💳</span>
                  <p>Không tìm thấy giao dịch thanh toán nào.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .toast-notification {
      position: fixed; top: 24px; right: 24px; z-index: 9999;
      display: flex; align-items: center; gap: 10px;
      padding: 14px 20px; border-radius: 10px; font-size: 14px; font-weight: 600;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      animation: slideInRight 0.3s ease-out;
      max-width: 380px;
    }
    .toast-success { background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.35); color: #86efac; }
    .toast-error   { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); color: #fca5a5; }
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }

    .btn-action-confirm { background: rgba(34, 197, 94, 0.15); color: #86efac; border: 1px solid rgba(34, 197, 94, 0.25); }
    .btn-action-confirm:hover { background: rgba(34, 197, 94, 0.25); }
    .btn-action-danger  { background: rgba(239, 68, 68, 0.12); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.2); }
    .btn-action-danger:hover { background: rgba(239, 68, 68, 0.22); }
    .btn-action-noshow  { background: rgba(59, 130, 246, 0.15); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.25); }
    .btn-action-noshow:hover { background: rgba(59, 130, 246, 0.25); }

    .row-actions { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }

    .badge.pending   { background: var(--status-warning-bg); color: var(--status-warning); border: 1px solid rgba(245, 158, 11, 0.25); }
    .badge.pending::before { background: var(--status-warning); }
    .badge.completed { background: var(--status-success-bg); color: var(--status-success); border: 1px solid rgba(34, 197, 94, 0.25); }
    .badge.completed::before { background: var(--status-success); }
    .badge.failed    { background: var(--status-danger-bg); color: var(--status-danger); border: 1px solid rgba(239, 68, 68, 0.25); }
    .badge.failed::before { background: var(--status-danger); }
    .badge.refunded  { background: var(--status-info-bg); color: var(--status-info); border: 1px solid rgba(59, 130, 246, 0.25); }
    .badge.refunded::before { background: var(--status-info); }

    .status-dot.orange { background: #f59e0b; }
    .status-dot.green  { background: #22c55e; }
    .status-dot.red    { background: #ef4444; }
    .status-dot.blue   { background: #3b82f6; }
  `],
  styleUrls: ['./payment-list.component.scss']
})
export class PaymentListComponent implements OnInit {
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  searchTerm = '';
  selectedStatus = '';
  processingId: number | null = null;

  toastMsg = '';
  toastType = 'toast-success';
  private toastTimer: any;

  constructor(private service: PaymentService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.getAll().subscribe(d => {
      this.payments = d;
      this.filterPayments();
    });
  }

  filterPayments(): void {
    this.filteredPayments = this.payments.filter(p => {
      const term = this.searchTerm.toLowerCase();
      const matchSearch = !term ||
        p.customerName.toLowerCase().includes(term) ||
        p.roomNumber.toLowerCase().includes(term) ||
        (p.transactionCode || '').toLowerCase().includes(term);
      const matchStatus = !this.selectedStatus || p.status === this.selectedStatus;
      return matchSearch && matchStatus;
    });
  }

  setStatusFilter(status: string): void {
    this.selectedStatus = status;
    this.filterPayments();
  }

  getCountByStatus(status: string): number {
    return this.payments.filter(p => p.status === status).length;
  }

  getActions(status: string) {
    return STATUS_ACTIONS[status] || [];
  }

  performAction(paymentId: number, newStatus: string, confirmMsg: string): void {
    if (!confirm(confirmMsg)) return;

    this.processingId = paymentId;
    this.service.updateStatus(paymentId, newStatus).subscribe({
      next: (updated) => {
        const idx = this.payments.findIndex(p => p.id === paymentId);
        if (idx !== -1) this.payments[idx] = { ...this.payments[idx], status: updated.status };
        this.filterPayments();
        this.processingId = null;
        const label = PAYMENT_TX_STATUS_MAP[newStatus]?.label || newStatus;
        this.showToast(`Đã cập nhật giao dịch: ${label}`, 'toast-success');
      },
      error: (err) => {
        this.processingId = null;
        this.showToast(err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.', 'toast-error');
      }
    });
  }

  private showToast(msg: string, type: string): void {
    clearTimeout(this.toastTimer);
    this.toastMsg = msg;
    this.toastType = type;
    this.toastTimer = setTimeout(() => { this.toastMsg = ''; }, 4000);
  }
}
