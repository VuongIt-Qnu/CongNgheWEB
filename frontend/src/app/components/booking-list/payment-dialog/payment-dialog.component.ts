import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PaymentService } from '../../../services/payment.service';
import { Booking } from '../../../models/models';
import { PAYMENT_METHOD_MAP } from '../../../pipes/payment-status.pipe';

export interface PaymentDialogData {
  booking: Booking;
}

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>💳 Thanh toán đơn #BK-{{ booking.id }}</h2>

    <mat-dialog-content class="payment-dialog-content">
      <p class="modal-sub">Phòng {{ booking.roomNumber }} • Còn thiếu <strong class="text-gold">{{ booking.amountDue | number:'1.0-0' }}₫</strong></p>

      @if (payError) {
        <div class="form-alert error">
          <span>⚠️</span>
          <p>{{ payError }}</p>
        </div>
      }

      <form [formGroup]="form" class="payment-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Phương thức thanh toán</mat-label>
          <mat-select formControlName="method">
            @for (m of paymentMethods; track m.value) {
              <mat-option [value]="m.value">{{ m.icon }} {{ m.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        @if (form.controls.method.value === 'bank_transfer') {
          <div class="transfer-details">
            <div class="transfer-details-header">
              <strong>Thông tin chuyển khoản</strong>
              <span>Vui lòng chuyển đúng nội dung</span>
            </div>
            <div class="transfer-row">
              <span class="transfer-label">Tên ngân hàng</span>
              <span class="transfer-value">MB Bank</span>
              <button type="button" class="btn-copy" (click)="copyTransferValue('MB Bank', 'Tên ngân hàng')" title="Sao chép tên ngân hàng" aria-label="Sao chép tên ngân hàng">📋</button>
            </div>
            <div class="transfer-row">
              <span class="transfer-label">STK</span>
              <span class="transfer-value">6999919092004</span>
              <button type="button" class="btn-copy" (click)="copyTransferValue('6999919092004', 'số tài khoản')" title="Sao chép số tài khoản" aria-label="Sao chép số tài khoản">📋</button>
            </div>
            <div class="transfer-row">
              <span class="transfer-label">Số tiền</span>
              <span class="transfer-value text-gold">{{ booking.totalPrice | number:'1.0-0' }}₫</span>
              <button type="button" class="btn-copy" (click)="copyTransferValue(booking.totalPrice.toString(), 'số tiền')" title="Sao chép số tiền" aria-label="Sao chép số tiền">📋</button>
            </div>
            <div class="transfer-row">
              <span class="transfer-label">Nội dung</span>
              <span class="transfer-value">{{ transferContent }}</span>
              <button type="button" class="btn-copy" (click)="copyTransferValue(transferContent, 'nội dung chuyển khoản')" title="Sao chép nội dung chuyển khoản" aria-label="Sao chép nội dung chuyển khoản">📋</button>
            </div>
          </div>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Số tiền thanh toán</mat-label>
          <input matInput type="number" formControlName="amount" [max]="booking.amountDue" step="1000">
          <span matTextSuffix>₫</span>
          @if (form.controls.amount.hasError('required')) {
            <mat-error>Vui lòng nhập số tiền thanh toán.</mat-error>
          } @else if (form.controls.amount.hasError('min')) {
            <mat-error>Số tiền phải lớn hơn 0.</mat-error>
          } @else if (form.controls.amount.hasError('max')) {
            <mat-error>Số tiền không được vượt quá số dư còn lại ({{ booking.amountDue | number:'1.0-0' }}₫).</mat-error>
          } @else {
            <mat-hint>Tối đa {{ booking.amountDue | number:'1.0-0' }}₫ (số tiền còn thiếu của đơn này)</mat-hint>
          }
        </mat-form-field>

        <p class="pay-note">
          ℹ️ Sau khi gửi, yêu cầu thanh toán sẽ ở trạng thái <strong>chờ xác nhận</strong> cho tới khi nhân viên lễ tân xác nhận đã nhận được tiền.
        </p>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button [disabled]="submitting" (click)="dialogRef.close(false)">Hủy</button>
      <button mat-raised-button color="primary" [disabled]="submitting" (click)="submit()">
        {{ submitting ? 'Đang gửi...' : 'Xác nhận thanh toán' }}
      </button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent {
  dialogRef = inject(MatDialogRef<PaymentDialogComponent>);
  private data = inject<PaymentDialogData>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private paymentService = inject(PaymentService);
  private snackBar = inject(MatSnackBar);

  booking = this.data.booking;
  readonly paymentMethods = Object.entries(PAYMENT_METHOD_MAP).map(([value, m]) => ({ value, ...m }));

  form = this.fb.nonNullable.group({
    method: ['cash', Validators.required],
    amount: [this.booking.amountDue, [Validators.required, Validators.min(1), Validators.max(this.booking.amountDue)]],
  });

  payError = '';
  submitting = false;

  get transferContent(): string {
    return `${this.booking.customerName}-BK-${this.booking.id}`;
  }

  copyTransferValue(value: string, label: string): void {
    navigator.clipboard.writeText(value).then(
      () => this.snackBar.open(`Đã sao chép ${label}.`, 'Đóng', { duration: 3000, panelClass: 'snackbar-success' }),
      () => this.snackBar.open(`Không thể sao chép ${label}.`, 'Đóng', { duration: 3000, panelClass: 'snackbar-error' })
    );
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const amountCtrl = this.form.controls.amount;
      if (amountCtrl.hasError('max')) {
        this.payError = `Số tiền không được vượt quá số dư còn lại (${this.booking.amountDue.toLocaleString('vi-VN')}₫).`;
      } else if (amountCtrl.hasError('min') || amountCtrl.hasError('required')) {
        this.payError = 'Vui lòng nhập số tiền hợp lệ (lớn hơn 0).';
      } else {
        this.payError = 'Vui lòng kiểm tra lại thông tin thanh toán.';
      }
      return;
    }

    this.payError = '';
    this.submitting = true;
    // Chặn đóng dialog (Escape/click nền) trong lúc đang gửi yêu cầu — khôi phục đúng
    // hành vi guard `if (this.paySubmitting) return;` của modal tự chế trước đây, tránh
    // trường hợp người dùng thoát giữa chừng rồi gửi lại gây trùng bản ghi thanh toán.
    this.dialogRef.disableClose = true;
    const { method, amount } = this.form.getRawValue();

    this.paymentService.create({ bookingId: this.booking.id, amount, method }).subscribe({
      next: () => {
        this.submitting = false;
        this.dialogRef.disableClose = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.submitting = false;
        this.dialogRef.disableClose = false;
        this.payError = err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
      }
    });
  }
}
