import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { VnDatePipe } from '../../pipes/vn-date.pipe';
import { BookingStatusPipe, BOOKING_STATUS_MAP } from '../../pipes/booking-status.pipe';
import { BookingPaymentStatusPipe } from '../../pipes/payment-status.pipe';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';

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
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, VnDatePipe, BookingStatusPipe, BookingPaymentStatusPipe,
    MatTableModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatButtonToggleModule, MatIconModule, MatDialogModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header-row">
        <div>
          <span class="header-tag">{{ isCustomer ? 'LỊCH SỬ NGHỈ DƯỠNG' : 'QUẢN LÝ ĐẶT PHÒNG' }}</span>
          <h1>{{ isCustomer ? 'Đơn Đặt Phòng Của Tôi' : 'Danh Sách Đơn Đặt Phòng' }}</h1>
          <p>{{ isCustomer ? 'Theo dõi lịch trình và trạng thái các chuyến nghỉ dưỡng của bạn tại Aurora Resort.' : 'Tra cứu, duyệt đơn và quản lý toàn bộ các giao dịch đặt phòng của resort.' }}</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/bookings/new">+ {{ isCustomer ? 'Đặt thêm phòng' : 'Tạo đơn đặt phòng mới' }}</a>
      </div>

      <!-- Status Filter Tabs -->
      <mat-button-toggle-group class="status-summary-bar" [value]="selectedStatus" (change)="setStatusFilter($event.value)">
        <mat-button-toggle value="" class="status-pill">
          <span>Tất cả đơn</span>
          <strong>{{ bookings.length }}</strong>
        </mat-button-toggle>
        <mat-button-toggle value="pending" class="status-pill">
          <span class="status-dot orange"></span>
          <span>Chờ xử lý</span>
          <strong>{{ getCountByStatus('pending') }}</strong>
        </mat-button-toggle>
        <mat-button-toggle value="confirmed" class="status-pill">
          <span class="status-dot blue"></span>
          <span>Đã xác nhận</span>
          <strong>{{ getCountByStatus('confirmed') }}</strong>
        </mat-button-toggle>
        <mat-button-toggle value="occupied" class="status-pill">
          <span class="status-dot green"></span>
          <span>Đang lưu trú</span>
          <strong>{{ getCountByStatus('occupied') }}</strong>
        </mat-button-toggle>
        <mat-button-toggle value="completed" class="status-pill">
          <span class="status-dot gray"></span>
          <span>Đã hoàn tất</span>
          <strong>{{ getCountByStatus('completed') }}</strong>
        </mat-button-toggle>
        <mat-button-toggle value="cancelled" class="status-pill">
          <span class="status-dot red"></span>
          <span>Đã hủy</span>
          <strong>{{ getCountByStatus('cancelled') }}</strong>
        </mat-button-toggle>
        <mat-button-toggle value="no_show" class="status-pill">
          <span class="status-dot orange"></span>
          <span>Không đến</span>
          <strong>{{ getCountByStatus('no_show') }}</strong>
        </mat-button-toggle>
      </mat-button-toggle-group>

      <!-- Search Toolbar (Admin only) -->
      @if (!isCustomer) {
        <div class="table-toolbar">
          <mat-form-field appearance="outline" class="search-field">
            <mat-icon matPrefix>search</mat-icon>
            <input matInput type="text" [formControl]="searchControl" placeholder="Tìm theo tên khách hàng, số phòng...">
            @if (searchControl.value) {
              <button mat-icon-button matSuffix type="button" (click)="searchControl.setValue('')" aria-label="Xóa tìm kiếm">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>
        </div>
      }

      <!-- Main Bookings Table -->
      <div class="card-table-wrap">
        <table mat-table [dataSource]="filteredBookings" class="table-modern">
          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef>Mã đơn</th>
            <td mat-cell *matCellDef="let b"><span class="booking-code">#BK-{{ b.id }}</span></td>
          </ng-container>

          <ng-container matColumnDef="customer">
            <th mat-header-cell *matHeaderCellDef>Khách hàng</th>
            <td mat-cell *matCellDef="let b">
              <div class="customer-cell">
                <strong>{{ b.customerName }}</strong>
                <span class="customer-sub-id">ID Khách: #{{ b.customerId }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="room">
            <th mat-header-cell *matHeaderCellDef>Phòng nghỉ</th>
            <td mat-cell *matCellDef="let b"><span class="room-pill">Phòng {{ b.roomNumber }}</span></td>
          </ng-container>

          <ng-container matColumnDef="dates">
            <th mat-header-cell *matHeaderCellDef>Lịch trình lưu trú</th>
            <td mat-cell *matCellDef="let b">
              <div class="dates-cell">
                <span>📥 {{ b.checkInDate | vnDate }}</span>
                <span>📤 {{ b.checkOutDate | vnDate }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef>Tổng chi phí</th>
            <td mat-cell *matCellDef="let b"><strong class="price-text text-gold">{{ b.totalPrice | number:'1.0-0' }}₫</strong></td>
          </ng-container>

          <ng-container matColumnDef="payment">
            <th mat-header-cell *matHeaderCellDef>Thanh toán</th>
            <td mat-cell *matCellDef="let b">
              <div class="payment-cell">
                <span class="badge payment-badge" [class]="b.paymentStatus | bookingPaymentStatus:'cssClass'">
                  {{ b.paymentStatus | bookingPaymentStatus:'icon' }} {{ b.paymentStatus | bookingPaymentStatus }}
                </span>
                @if (isCustomer && b.amountDue > 0 && !isTerminalStatus(b.status)) {
                  <button mat-button class="btn-pay" (click)="openPayModal(b)" [title]="'Thanh toán còn thiếu ' + (b.amountDue | number:'1.0-0') + '₫'">
                    💳 Thanh toán
                  </button>
                }
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="notes">
            <th mat-header-cell *matHeaderCellDef>Ghi chú</th>
            <td mat-cell *matCellDef="let b" class="notes-cell"><span class="notes-text">{{ b.notes || '---' }}</span></td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Trạng thái</th>
            <td mat-cell *matCellDef="let b">
              <span class="badge" [class]="b.status">
                {{ b.status | bookingStatus:'icon' }} {{ b.status | bookingStatus }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="text-align: right; min-width: 200px;">Thao tác</th>
            <td mat-cell *matCellDef="let b" style="text-align: right;">
              <div class="row-actions">
                @for (act of getActions(b.status); track act.action) {
                  <button mat-button class="{{ act.btnClass }}" (click)="performAction(b.id, act.newStatus, act.confirmMsg)" [disabled]="processingId === b.id" [title]="act.label">
                    {{ act.icon }} {{ act.label }}
                  </button>
                }
                @if (isEditable(b.status)) {
                  <a mat-stroked-button [routerLink]="['/bookings/edit', b.id]" title="Chỉnh sửa chi tiết">
                    <mat-icon>edit</mat-icon> Sửa
                  </a>
                }
                <button mat-button color="warn" (click)="delete(b.id)" title="Xóa đơn" [disabled]="processingId === b.id">
                  <mat-icon>delete</mat-icon> Xóa
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>

        @if (filteredBookings.length === 0) {
          <div class="empty-state">
            <span>📋</span>
            <p>Không tìm thấy đơn đặt phòng nào.</p>
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./booking-list.component.scss']
})
export class BookingListComponent implements OnInit {
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  searchControl = new FormControl('', { nonNullable: true });
  selectedStatus = '';
  isCustomer = false;

  /** ID đang được xử lý (để disable button) */
  processingId: number | null = null;

  /** Cột hiển thị: ẩn "customer" và "actions" khi là khách hàng tự xem đơn của mình */
  get columns(): string[] {
    const base = ['code', 'room', 'dates', 'total', 'payment', 'notes', 'status'];
    return this.isCustomer ? base : ['code', 'customer', ...base.slice(1), 'actions'];
  }

  constructor(private service: BookingService, private auth: AuthService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.isCustomer = user?.role === 'customer';
    this.load();
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.filterBookings());
  }

  load(): void {
    this.service.getAll().subscribe(d => {
      this.bookings = d;
      this.filterBookings();
    });
  }

  filterBookings(): void {
    const term = this.searchControl.value.toLowerCase();
    this.filteredBookings = this.bookings.filter(b => {
      const matchSearch = !term ||
        b.customerName.toLowerCase().includes(term) ||
        b.roomNumber.toLowerCase().includes(term) ||
        (b.notes && b.notes.toLowerCase().includes(term));

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
    return !this.isCustomer && !this.isTerminalStatus(status);
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
        this.snackBar.open(`Đã cập nhật trạng thái: ${label}`, 'Đóng', { duration: 4000, panelClass: 'snackbar-success' });
      },
      error: (err) => {
        this.processingId = null;
        const msg = err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
        this.snackBar.open(msg, 'Đóng', { duration: 5000, panelClass: 'snackbar-error' });
      }
    });
  }

  delete(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa/hủy đơn đặt phòng này? Hành động này không thể hoàn tác.')) {
      this.service.delete(id).subscribe({
        next: () => {
          this.load();
          this.snackBar.open('Đã xóa đơn đặt phòng thành công.', 'Đóng', { duration: 4000, panelClass: 'snackbar-success' });
        },
        error: () => this.snackBar.open('Không thể xóa đơn này.', 'Đóng', { duration: 5000, panelClass: 'snackbar-error' })
      });
    }
  }

  /** Đơn ở trạng thái cuối (không thể thao tác thêm) */
  isTerminalStatus(status: string): boolean {
    return ['completed', 'cancelled', 'no_show'].includes(status);
  }

  /** Mở dialog thanh toán (thay cho modal tự chế trước đây) */
  openPayModal(b: Booking): void {
    const ref = this.dialog.open(PaymentDialogComponent, {
      data: { booking: b },
      panelClass: 'aurora-dialog-panel',
    });

    ref.afterClosed().subscribe(success => {
      if (success) {
        this.snackBar.open('Đã gửi yêu cầu thanh toán, đang chờ nhân viên xác nhận.', 'Đóng', { duration: 5000, panelClass: 'snackbar-success' });
        this.load();
      }
    });
  }
}
