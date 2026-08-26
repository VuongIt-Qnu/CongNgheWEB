import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BookingService } from '../../services/booking.service';
import { CustomerService } from '../../services/customer.service';
import { RoomService } from '../../services/room.service';
import { Customer, Room } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { getPrimaryRoomImage, handleImageFallback } from '../../utils/room-images';
import { dateRangeValidator, getLocalDateString, parseLocalDate } from '../../utils/date-range.validator';
import { VnDatePipe } from '../../pipes/vn-date.pipe';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, VnDatePipe,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDatepickerModule, MatSnackBarModule
  ],
  template: `
    <div class="booking-form-container">
      <!-- Breadcrumb & Header -->
      <div class="booking-form-header">
        <a (click)="cancel()" class="back-link">← Quay lại</a>
        <h1>{{ isEdit ? 'Cập Nhật Đơn Đặt Phòng #' + id : (isCustomer ? 'Xác Nhận Đặt Phòng Nghỉ Dưỡng' : 'Tạo Đơn Đặt Phòng Mới') }}</h1>
        <p>Vui lòng kiểm tra thông tin phòng, ngày lưu trú và các yêu cầu đi kèm trước khi hoàn tất.</p>
      </div>

      <div class="booking-layout-grid">
        <!-- Main Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="booking-card-main">
          <!-- Customer Selection (Admin Only) -->
          @if (!isCustomer) {
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Khách hàng đặt phòng</mat-label>
              <mat-select formControlName="customerId">
                @for (c of customers; track c.id) {
                  <mat-option [value]="c.id">{{ c.name }} • SĐT: {{ c.phone || 'Chưa có' }} • CCCD: {{ c.idCard || 'N/A' }}</mat-option>
                }
              </mat-select>
              @if (form.controls.customerId.hasError('required') && form.controls.customerId.touched) {
                <mat-error>Vui lòng chọn khách hàng.</mat-error>
              }
            </mat-form-field>
          }

          <!-- Room Selection -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Chọn phòng nghỉ</mat-label>
            <mat-select formControlName="roomId">
              @for (r of rooms; track r.id) {
                <mat-option [value]="r.id">Phòng {{ r.roomNumber }} — {{ r.roomTypeName }} ({{ r.price | number:'1.0-0' }}₫ / đêm • Sức chứa {{ r.capacity }} người)</mat-option>
              }
            </mat-select>
            @if (form.controls.roomId.hasError('required') && form.controls.roomId.touched) {
              <mat-error>Vui lòng chọn phòng.</mat-error>
            }
          </mat-form-field>

          <!-- Stay Dates with strict validation -->
          <div class="dates-row">
            <mat-form-field appearance="outline">
              <mat-label>📅 Ngày nhận phòng</mat-label>
              <input matInput [matDatepicker]="checkInPicker" [min]="isEdit ? null : todayDate" formControlName="checkInDate">
              <mat-datepicker-toggle matIconSuffix [for]="checkInPicker"></mat-datepicker-toggle>
              <mat-datepicker #checkInPicker></mat-datepicker>
              @if (form.controls.checkInDate.value) {
                <mat-hint>Đã chọn: {{ form.controls.checkInDate.value | vnDate }} (Tối thiểu từ hôm nay)</mat-hint>
              } @else {
                <mat-error>Vui lòng chọn ngày nhận phòng.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>📅 Ngày trả phòng</mat-label>
              <input matInput [matDatepicker]="checkOutPicker" [min]="minCheckOutDate" formControlName="checkOutDate">
              <mat-datepicker-toggle matIconSuffix [for]="checkOutPicker"></mat-datepicker-toggle>
              <mat-datepicker #checkOutPicker></mat-datepicker>
              @if (form.controls.checkOutDate.value) {
                <mat-hint>Đã chọn: {{ form.controls.checkOutDate.value | vnDate }} (Sau ngày nhận phòng ít nhất 1 ngày)</mat-hint>
              } @else {
                <mat-error>Vui lòng chọn ngày trả phòng.</mat-error>
              }
            </mat-form-field>
          </div>

          <!-- General Date Alert if invalid -->
          @if (dateGeneralError) {
            <div class="date-alert-banner">
              <span>⚠️</span>
              <p>{{ dateGeneralError }}</p>
            </div>
          }

          <!-- Status (Admin only when edit) -->
          @if (isEdit && !isCustomer) {
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Trạng thái đơn</mat-label>
              <mat-select formControlName="status">
                <mat-option value="pending">🟡 Chờ xử lý / Đặt trước</mat-option>
                <mat-option value="confirmed">🔵 Đã xác nhận giữ chỗ</mat-option>
                <mat-option value="occupied">🟠 Khách đang lưu trú</mat-option>
                <mat-option value="completed">🟢 Đã hoàn thành trả phòng</mat-option>
                <mat-option value="cancelled">🔴 Đã hủy đơn</mat-option>
              </mat-select>
            </mat-form-field>
          }

          <!-- Notes -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Ghi chú & Yêu cầu đặc biệt (tùy chọn)</mat-label>
            <textarea matInput formControlName="notes" rows="3" placeholder="VD: Nhận phòng sớm, kê thêm giường phụ, phòng tầng cao yên tĩnh..."></textarea>
          </mat-form-field>

          <div class="form-actions-row">
            <button mat-raised-button color="primary" type="submit" class="btn-lg" [disabled]="form.invalid || submitting">
              {{ submitting ? 'Đang xử lý...' : (isEdit ? '💾 Cập nhật đơn đặt' : '✨ Xác nhận đặt phòng') }}
            </button>
            <button mat-stroked-button type="button" class="btn-lg" (click)="cancel()">Hủy thao tác</button>
          </div>
        </form>

        <!-- Booking Summary & Invoice Calculation Card -->
        <div class="summary-sidebar">
          <div class="summary-card">
            <h3>Chi tiết đặt phòng</h3>

            <!-- Room Mini Banner -->
            @if (selectedRoom) {
              <div class="summary-room-preview">
                <img [src]="getRoomImg(selectedRoom.roomTypeName, selectedRoom.id)" (error)="onImgError($event)" alt="Selected Room" class="summary-room-img">
                <div class="summary-room-meta">
                  <span class="summary-room-badge">{{ selectedRoom.roomTypeName }}</span>
                  <h4>Phòng {{ selectedRoom.roomNumber }}</h4>
                  <span class="summary-room-price">{{ selectedRoom.price | number:'1.0-0' }}₫ <small>/ đêm</small></span>
                </div>
              </div>
            }

            <!-- Calculation Lines -->
            <div class="summary-breakdown">
              <div class="breakdown-row">
                <span>Số đêm lưu trú:</span>
                <strong [class.text-gold]="nightsCount > 0">{{ nightsCount }} đêm</strong>
              </div>
              <div class="breakdown-row">
                <span>Đơn giá phòng:</span>
                <span>{{ (selectedRoom?.price || 0) | number:'1.0-0' }}₫</span>
              </div>
              <div class="breakdown-row">
                <span>Phí dịch vụ & VAT:</span>
                <span class="text-gold">Đã bao gồm</span>
              </div>
              <div class="breakdown-divider"></div>
              <div class="breakdown-total">
                <span>Tổng chi phí ước tính:</span>
                <strong class="total-cost text-gold font-serif">{{ estimatedTotalPrice | number:'1.0-0' }}₫</strong>
              </div>
            </div>

            <!-- Customer Perks Note -->
            <div class="resort-perks-box">
              <div class="perk-item">✓ Miễn phí Buffet sáng</div>
              <div class="perk-item">✓ Miễn phí sử dụng Hồ bơi & Gym</div>
              <div class="perk-item">✓ Hỗ trợ hủy phòng linh hoạt</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./booking-form.component.scss']
})
export class BookingFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);

  // isEdit/id được xác định NGAY tại đây (route.snapshot đọc được đồng bộ) để form chỉ cần
  // khởi tạo group-validator ĐÚNG NGAY TỪ ĐẦU — tránh gọi lại setValidators() sau này
  // (setValidators thay thế toàn bộ danh sách validator của group, dễ vô tình xoá mất
  // validator khác nếu sau này có thêm validator thứ 2 ở cấp group).
  isEdit = !!this.route.snapshot.paramMap.get('id');
  id = +(this.route.snapshot.paramMap.get('id') || 0);

  form = this.fb.nonNullable.group({
    customerId: this.fb.control<number | null>(null, Validators.required),
    roomId: this.fb.control<number | null>(null, Validators.required),
    checkInDate: this.fb.control<Date | null>(null, Validators.required),
    checkOutDate: this.fb.control<Date | null>(null, Validators.required),
    status: this.fb.nonNullable.control('pending'),
    notes: this.fb.nonNullable.control(''),
  }, {
    validators: dateRangeValidator({
      checkInControlName: 'checkInDate',
      checkOutControlName: 'checkOutDate',
      // Khi sửa đơn đã tồn tại, cho phép ngày nhận phòng trong quá khứ (đơn đã tạo từ trước).
      minDateToday: !this.isEdit,
    }),
  });

  customers: Customer[] = [];
  rooms: Room[] = [];
  selectedRoom: Room | null = null;
  nightsCount = 0;
  estimatedTotalPrice = 0;
  isCustomer = false;
  submitting = false;

  todayDate = new Date();
  minCheckOutDate: Date | null = null;
  dateGeneralError = '';

  constructor(
    private service: BookingService,
    private custService: CustomerService,
    private roomService: RoomService,
    private auth: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.isCustomer = user?.role === 'customer';

    if (this.isCustomer) {
      // Khách hàng tự đặt cho chính mình — không cần chọn customerId trên UI.
      this.form.controls.customerId.clearValidators();
      this.form.controls.customerId.updateValueAndValidity();

      this.custService.getProfile().subscribe({
        next: (c) => this.form.controls.customerId.setValue(c.id),
        error: (err) => console.error('Cannot load customer profile', err),
      });
    } else {
      this.custService.getAll().subscribe(d => this.customers = d);
    }

    // Ngày mặc định: hôm nay -> 2 ngày sau.
    const future = new Date();
    future.setDate(future.getDate() + 2);
    this.form.patchValue({ checkInDate: this.todayDate, checkOutDate: future });
    this.minCheckOutDate = getNextDayLocal(this.todayDate);

    // Tự động đẩy checkOutDate khi checkInDate đổi khiến khoảng ngày không còn hợp lệ.
    this.form.controls.checkInDate.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(checkIn => {
        if (!checkIn) return;
        this.minCheckOutDate = getNextDayLocal(checkIn);
        const checkOut = this.form.controls.checkOutDate.value;
        if (checkOut && checkOut <= checkIn) {
          this.form.controls.checkOutDate.setValue(this.minCheckOutDate, { emitEvent: false });
        }
      });

    // Gộp roomId/checkInDate/checkOutDate/status thay đổi để tính lại tiền phòng + thông báo lỗi ngày.
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalc());

    // Thay cho nested-subscribe trước đây (roomService.getAll().subscribe(d => route.queryParams.subscribe(...))):
    // dùng switchMap để gộp 2 luồng bất đồng bộ thành 1, tránh subscribe lồng nhau.
    this.roomService.getAll().pipe(
      switchMap(rooms => this.route.queryParams.pipe(map(params => ({ rooms, params })))),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({ rooms, params }) => {
      this.rooms = rooms;

      if (params['checkIn']) {
        const d = parseLocalDate(params['checkIn']);
        if (d) this.form.controls.checkInDate.setValue(d);
      }
      if (params['checkOut']) {
        const d = parseLocalDate(params['checkOut']);
        if (d) this.form.controls.checkOutDate.setValue(d);
      }
      if (params['roomId']) {
        this.form.controls.roomId.setValue(+params['roomId']);
      } else if (rooms.length > 0 && !this.isEdit) {
        this.form.controls.roomId.setValue(rooms[0].id);
      }
      this.recalc();
    });

    if (this.isEdit) {
      this.service.getById(this.id).subscribe(d => {
        this.form.patchValue({
          customerId: d.customerId,
          roomId: d.roomId,
          checkInDate: parseLocalDate(d.checkInDate),
          checkOutDate: parseLocalDate(d.checkOutDate),
          status: d.status,
          notes: d.notes ?? '',
        });
        this.recalc();
      });
    }
  }

  private recalc(): void {
    const { roomId, checkInDate, checkOutDate } = this.form.getRawValue();
    this.selectedRoom = this.rooms.find(r => r.id === roomId) || null;

    if (checkInDate && checkOutDate && checkOutDate > checkInDate) {
      const diffDays = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      this.nightsCount = diffDays > 0 ? diffDays : 1;
    } else {
      this.nightsCount = 0;
    }
    this.estimatedTotalPrice = this.nightsCount * (this.selectedRoom?.price || 0);

    const errors = this.form.errors;
    if (errors?.['checkInRequired']) {
      this.dateGeneralError = 'Vui lòng chọn ngày nhận phòng.';
    } else if (errors?.['checkOutRequired']) {
      this.dateGeneralError = 'Vui lòng chọn ngày trả phòng.';
    } else if (errors?.['checkOutBeforeCheckIn']) {
      this.dateGeneralError = 'Thời gian lưu trú tối thiểu là 1 đêm. Vui lòng điều chỉnh lại ngày trả phòng.';
    } else if (errors?.['checkInPast']) {
      this.dateGeneralError = 'Ngày nhận phòng không thể trong quá khứ.';
    } else {
      this.dateGeneralError = '';
    }
  }

  getRoomImg(typeName?: string, id: number = 0): string {
    return getPrimaryRoomImage(typeName, id);
  }

  onImgError(event: Event): void {
    handleImageFallback(event);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const raw = this.form.getRawValue();
    const payload = {
      customerId: raw.customerId,
      roomId: raw.roomId,
      checkInDate: getLocalDateString(raw.checkInDate!),
      checkOutDate: getLocalDateString(raw.checkOutDate!),
      status: raw.status,
      notes: raw.notes,
    };

    const obs = this.isEdit ? this.service.update(this.id, payload) : this.service.create(payload);
    obs.subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate([this.isCustomer ? '/' : '/bookings']);
      },
      error: (err) => {
        this.submitting = false;
        const message = err.error?.message || 'Có lỗi xảy ra khi lưu đơn đặt phòng. Vui lòng kiểm tra lại.';
        this.snackBar.open(message, 'Đóng', { duration: 6000, panelClass: 'snackbar-error' });
      }
    });
  }

  cancel(): void {
    this.router.navigate([this.isCustomer ? '/' : '/bookings']);
  }
}

function getNextDayLocal(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return d;
}
