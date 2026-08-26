import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
  imports: [
    CommonModule, ReactiveFormsModule, VnDatePipe, PaymentTxStatusPipe, PaymentMethodPipe,
    MatTableModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatButtonToggleModule, MatIconModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header-row">
        <div>
          <span class="header-tag">ĐỐI SOÁT THANH TOÁN</span>
          <h1>Quản Lý Giao Dịch Thanh Toán</h1>
          <p>Xác nhận các khoản khách đã thanh toán (tiền mặt/chuyển khoản) và theo dõi hoàn tiền.</p>
        </div>
      </div>

      <mat-button-toggle-group class="status-summary-bar" [value]="selectedStatus" (change)="setStatusFilter($event.value)">
        <mat-button-toggle value="" class="status-pill">
          <span>Tất cả</span>
          <strong>{{ payments.length }}</strong>
        </mat-button-toggle>
        <mat-button-toggle value="pending" class="status-pill">
          <span class="status-dot orange"></span>
          <span>Chờ xác nhận</span>
          <strong>{{ getCountByStatus('pending') }}</strong>
        </mat-button-toggle>
        <mat-button-toggle value="completed" class="status-pill">
          <span class="status-dot green"></span>
          <span>Đã xác nhận</span>
          <strong>{{ getCountByStatus('completed') }}</strong>
        </mat-button-toggle>
        <mat-button-toggle value="failed" class="status-pill">
          <span class="status-dot red"></span>
          <span>Thất bại</span>
          <strong>{{ getCountByStatus('failed') }}</strong>
        </mat-button-toggle>
        <mat-button-toggle value="refunded" class="status-pill">
          <span class="status-dot blue"></span>
          <span>Đã hoàn tiền</span>
          <strong>{{ getCountByStatus('refunded') }}</strong>
        </mat-button-toggle>
      </mat-button-toggle-group>

      <div class="table-toolbar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-icon matPrefix>search</mat-icon>
          <input matInput type="text" [formControl]="searchControl" placeholder="Tìm theo tên khách hàng, số phòng, mã giao dịch...">
          @if (searchControl.value) {
            <button mat-icon-button matSuffix type="button" (click)="searchControl.setValue('')" aria-label="Xóa tìm kiếm">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>
      </div>

      <div class="card-table-wrap">
        <table mat-table [dataSource]="filteredPayments" class="table-modern">
          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef>Mã giao dịch</th>
            <td mat-cell *matCellDef="let p"><span class="booking-code">{{ p.transactionCode || ('#PM-' + p.id) }}</span></td>
          </ng-container>

          <ng-container matColumnDef="booking">
            <th mat-header-cell *matHeaderCellDef>Đơn đặt phòng</th>
            <td mat-cell *matCellDef="let p"><span class="room-pill">Đơn #BK-{{ p.bookingId }} • Phòng {{ p.roomNumber }}</span></td>
          </ng-container>

          <ng-container matColumnDef="customer">
            <th mat-header-cell *matHeaderCellDef>Khách hàng</th>
            <td mat-cell *matCellDef="let p"><strong>{{ p.customerName }}</strong></td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Số tiền</th>
            <td mat-cell *matCellDef="let p"><strong class="price-text text-gold">{{ p.amount | number:'1.0-0' }}₫</strong></td>
          </ng-container>

          <ng-container matColumnDef="method">
            <th mat-header-cell *matHeaderCellDef>Phương thức</th>
            <td mat-cell *matCellDef="let p">{{ p.method | paymentMethod:'icon' }} {{ p.method | paymentMethod }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Trạng thái</th>
            <td mat-cell *matCellDef="let p">
              <span class="badge" [class]="p.status | paymentTxStatus:'cssClass'">
                {{ p.status | paymentTxStatus:'icon' }} {{ p.status | paymentTxStatus }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>Thời gian tạo</th>
            <td mat-cell *matCellDef="let p"><span class="dates-cell">{{ p.createdAt | vnDate:'time' }}</span></td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="text-align: right; min-width: 220px;">Thao tác</th>
            <td mat-cell *matCellDef="let p" style="text-align: right;">
              <div class="row-actions">
                @for (act of getActions(p.status); track act.newStatus) {
                  <button mat-button class="{{ act.btnClass }}" (click)="performAction(p.id, act.newStatus, act.confirmMsg)" [disabled]="processingId === p.id" [title]="act.label">
                    {{ act.icon }} {{ act.label }}
                  </button>
                }
                @if (getActions(p.status).length === 0) {
                  <span class="notes-text">—</span>
                }
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>

        @if (filteredPayments.length === 0) {
          <div class="empty-state">
            <span>💳</span>
            <p>Không tìm thấy giao dịch thanh toán nào.</p>
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./payment-list.component.scss']
})
export class PaymentListComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  searchControl = new FormControl('', { nonNullable: true });
  selectedStatus = '';
  processingId: number | null = null;
  columns = ['code', 'booking', 'customer', 'amount', 'method', 'status', 'createdAt', 'actions'];

  constructor(private service: PaymentService) {}

  ngOnInit(): void {
    this.load();
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.filterPayments());
  }

  load(): void {
    this.service.getAll().subscribe(d => {
      this.payments = d;
      this.filterPayments();
    });
  }

  filterPayments(): void {
    const term = this.searchControl.value.toLowerCase();
    this.filteredPayments = this.payments.filter(p => {
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
        this.snackBar.open(`Đã cập nhật giao dịch: ${label}`, 'Đóng', { duration: 4000, panelClass: 'snackbar-success' });
      },
      error: (err) => {
        this.processingId = null;
        const message = err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
        this.snackBar.open(message, 'Đóng', { duration: 5000, panelClass: 'snackbar-error' });
      }
    });
  }
}
