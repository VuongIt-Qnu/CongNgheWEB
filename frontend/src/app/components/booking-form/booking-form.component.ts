import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { CustomerService } from '../../services/customer.service';
import { RoomService } from '../../services/room.service';
import { Customer, Room } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { getPrimaryRoomImage, handleImageFallback } from '../../utils/room-images';

import { VnDatePipe } from '../../pipes/vn-date.pipe';

function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getNextDayString(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + 1);
  return getLocalDateString(d);
}

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, VnDatePipe],
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
        <form (ngSubmit)="onSubmit()" class="booking-card-main">
          <!-- Form Submission Error Alert -->
          <div class="form-alert error" *ngIf="serverError">
            <span>⚠️</span>
            <p>{{ serverError }}</p>
          </div>

          <!-- Customer Selection (Admin Only) -->
          <div class="form-group" *ngIf="!isCustomer">
            <label for="customerId">Khách hàng đặt phòng <span class="required">*</span></label>
            <select id="customerId" [(ngModel)]="item.customerId" name="customerId" class="form-select" required>
              <option [ngValue]="null" disabled>-- Chọn khách hàng --</option>
              <option *ngFor="let c of customers" [value]="c.id">
                {{ c.name }} • SĐT: {{ c.phone || 'Chưa có' }} • CCCD: {{ c.idCard || 'N/A' }}
              </option>
            </select>
          </div>

          <!-- Room Selection -->
          <div class="form-group">
            <label for="roomId">Chọn phòng nghỉ <span class="required">*</span></label>
            <select id="roomId" [(ngModel)]="item.roomId" name="roomId" class="form-select" (change)="onRoomChange()" required>
              <option [ngValue]="null" disabled>-- Chọn phòng trống --</option>
              <option *ngFor="let r of rooms" [value]="r.id">
                Phòng {{ r.roomNumber }} — {{ r.roomTypeName }} ({{ r.price | number:'1.0-0' }}₫ / đêm • Sức chứa {{ r.capacity }} người)
              </option>
            </select>
          </div>

          <!-- Stay Dates with strict validation -->
          <div class="dates-row">
            <div class="form-group">
              <label for="checkInDate">
                📅 Ngày nhận phòng <span class="required">*</span>
              </label>
              <input 
                id="checkInDate" 
                type="date" 
                [(ngModel)]="item.checkInDate" 
                [min]="todayStr"
                (change)="onCheckInChange()" 
                name="checkInDate" 
                class="form-control" 
                [class.is-invalid]="checkInError"
                required
              >
              <span class="date-hint" *ngIf="!checkInError">Đã chọn: <strong>{{ item.checkInDate | vnDate }}</strong> (Tối thiểu từ hôm nay)</span>
              <span class="date-error" *ngIf="checkInError">⚠️ {{ checkInError }}</span>
            </div>

            <div class="form-group">
              <label for="checkOutDate">
                📅 Ngày trả phòng <span class="required">*</span>
              </label>
              <input 
                id="checkOutDate" 
                type="date" 
                [(ngModel)]="item.checkOutDate" 
                [min]="minCheckOutStr"
                (change)="onCheckOutChange()" 
                name="checkOutDate" 
                class="form-control" 
                [class.is-invalid]="checkOutError"
                required
              >
              <span class="date-hint" *ngIf="!checkOutError">Đã chọn: <strong>{{ item.checkOutDate | vnDate }}</strong> (Sau ngày nhận phòng ít nhất 1 ngày)</span>
              <span class="date-error" *ngIf="checkOutError">⚠️ {{ checkOutError }}</span>
            </div>
          </div>

          <!-- General Date Alert if invalid -->
          <div class="date-alert-banner" *ngIf="dateGeneralError">
            <span>⚠️</span>
            <p>{{ dateGeneralError }}</p>
          </div>

          <!-- Status (Admin only when edit) -->
          <div class="form-group" *ngIf="isEdit && !isCustomer">
            <label for="status">Trạng thái đơn</label>
            <select id="status" [(ngModel)]="item.status" name="status" class="form-select">
              <option value="pending">🟡 Chờ xử lý / Đặt trước</option>
              <option value="confirmed">🔵 Đã xác nhận giữ chỗ</option>
              <option value="occupied">🟠 Khách đang lưu trú</option>
              <option value="completed">🟢 Đã hoàn thành trả phòng</option>
              <option value="cancelled">🔴 Đã hủy đơn</option>
            </select>
          </div>

          <!-- Notes -->
          <div class="form-group">
            <label for="notes">Ghi chú & Yêu cầu đặc biệt (tùy chọn)</label>
            <textarea 
              id="notes" 
              [(ngModel)]="item.notes" 
              name="notes" 
              rows="3" 
              class="form-control" 
              placeholder="VD: Nhận phòng sớm, kê thêm giường phụ, phòng tầng cao yên tĩnh..."
            ></textarea>
          </div>

          <div class="form-actions-row">
            <button 
              type="submit" 
              class="btn btn-gold btn-lg" 
              [disabled]="!isFormValid || submitting"
            >
              {{ submitting ? 'Đang xử lý...' : (isEdit ? '💾 Cập nhật đơn đặt' : '✨ Xác nhận đặt phòng') }}
            </button>
            <button type="button" class="btn btn-secondary btn-lg" (click)="cancel()">Hủy thao tác</button>
          </div>
        </form>

        <!-- Booking Summary & Invoice Calculation Card -->
        <div class="summary-sidebar">
          <div class="summary-card">
            <h3>Chi tiết đặt phòng</h3>

            <!-- Room Mini Banner -->
            <div class="summary-room-preview" *ngIf="selectedRoom">
              <img [src]="getRoomImg(selectedRoom.roomTypeName, selectedRoom.id)" (error)="onImgError($event)" alt="Selected Room" class="summary-room-img">
              <div class="summary-room-meta">
                <span class="summary-room-badge">{{ selectedRoom.roomTypeName }}</span>
                <h4>Phòng {{ selectedRoom.roomNumber }}</h4>
                <span class="summary-room-price">{{ selectedRoom.price | number:'1.0-0' }}₫ <small>/ đêm</small></span>
              </div>
            </div>

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
  item: any = { customerId: null, roomId: null, checkInDate: '', checkOutDate: '', notes: '' };
  customers: Customer[] = [];
  rooms: Room[] = [];
  selectedRoom: Room | null = null;
  nightsCount: number = 1;
  estimatedTotalPrice: number = 0;
  isEdit = false;
  id = 0;
  isCustomer = false;
  submitting = false;
  serverError = '';

  // ── Date Validation State ──
  todayStr: string = '';
  minCheckOutStr: string = '';
  checkInError: string = '';
  checkOutError: string = '';
  dateGeneralError: string = '';

  constructor(
    private service: BookingService,
    private custService: CustomerService,
    private roomService: RoomService,
    private auth: AuthService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.isCustomer = user?.role === 'customer';

    // 1. Initialize today string in local time (YYYY-MM-DD)
    this.todayStr = getLocalDateString();

    // Default dates (today and day after tomorrow)
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 2);
    this.item.checkInDate = this.todayStr;
    this.item.checkOutDate = getLocalDateString(future);
    this.minCheckOutStr = getNextDayString(this.item.checkInDate);

    if (this.isCustomer) {
      this.custService.getProfile().subscribe({
        next: (c) => { this.item.customerId = c.id; },
        error: (err) => { console.error('Cannot load customer profile', err); }
      });
    } else {
      this.custService.getAll().subscribe(d => this.customers = d);
    }

    this.roomService.getAll().subscribe(d => {
      this.rooms = d;
      // Preselect room and dates if passed in queryParams
      this.route.queryParams.subscribe(params => {
        if (params['checkIn']) {
          this.item.checkInDate = params['checkIn'];
          this.minCheckOutStr = getNextDayString(this.item.checkInDate);
        }
        if (params['checkOut']) {
          this.item.checkOutDate = params['checkOut'];
        }
        if (params['roomId']) {
          this.item.roomId = +params['roomId'];
          this.onRoomChange();
        } else if (d.length > 0 && !this.isEdit) {
          this.item.roomId = d[0].id;
          this.onRoomChange();
        }
        this.validateDates();
        this.calculateStay();
      });
    });

    const p = this.route.snapshot.paramMap.get('id');
    if (p) {
      this.isEdit = true;
      this.id = +p;
      this.service.getById(this.id).subscribe(d => {
        this.item = d;
        this.minCheckOutStr = getNextDayString(this.item.checkInDate);
        this.onRoomChange();
        this.validateDates();
        this.calculateStay();
      });
    } else {
      this.validateDates();
      this.calculateStay();
    }
  }

  onRoomChange(): void {
    this.selectedRoom = this.rooms.find(r => r.id === +this.item.roomId) || null;
    this.calculateStay();
  }

  // ── Date Change Event Handlers ──
  onCheckInChange(): void {
    this.serverError = '';
    
    // Check-in date cannot be in the past
    if (this.item.checkInDate && this.item.checkInDate < this.todayStr) {
      this.checkInError = `Ngày nhận phòng không thể trong quá khứ. Tối thiểu là hôm nay (${this.todayStr}).`;
    } else {
      this.checkInError = '';
    }

    // Update minimum possible checkout date
    this.minCheckOutStr = getNextDayString(this.item.checkInDate);

    // If Check-out is less than or equal to Check-in, auto-adjust Check-out to Check-in + 1 day
    if (this.item.checkInDate && this.item.checkOutDate && this.item.checkOutDate <= this.item.checkInDate) {
      this.item.checkOutDate = this.minCheckOutStr;
    }

    this.validateDates();
    this.calculateStay();
  }

  onCheckOutChange(): void {
    this.serverError = '';
    this.validateDates();
    this.calculateStay();
  }

  validateDates(): boolean {
    this.checkInError = '';
    this.checkOutError = '';
    this.dateGeneralError = '';

    if (!this.item.checkInDate) {
      this.checkInError = 'Vui lòng chọn ngày nhận phòng.';
      return false;
    }

    if (!this.item.checkOutDate) {
      this.checkOutError = 'Vui lòng chọn ngày trả phòng.';
      return false;
    }

    // Rule 1: Check-in >= Today (only for new bookings, allow existing bookings to be viewed)
    if (!this.isEdit && this.item.checkInDate < this.todayStr) {
      this.checkInError = `Ngày nhận phòng không thể trong quá khứ (${this.item.checkInDate} < ${this.todayStr}).`;
      return false;
    }

    // Rule 2: Check-out > Check-in (cannot be equal or before)
    if (this.item.checkOutDate <= this.item.checkInDate) {
      this.checkOutError = `Ngày trả phòng (${this.item.checkOutDate}) phải lớn hơn ngày nhận phòng (${this.item.checkInDate}) ít nhất 1 ngày.`;
      this.dateGeneralError = 'Thời gian lưu trú tối thiểu là 1 đêm. Vui lòng điều chỉnh lại ngày trả phòng.';
      return false;
    }

    return true;
  }

  get isFormValid(): boolean {
    const hasRoom = !!this.item.roomId;
    const hasCustomer = this.isCustomer || !!this.item.customerId;
    const datesValid = this.validateDates();
    return hasRoom && hasCustomer && datesValid;
  }

  calculateStay(): void {
    if (this.item.checkInDate && this.item.checkOutDate && this.item.checkOutDate > this.item.checkInDate) {
      const inParts = this.item.checkInDate.split('-').map(Number);
      const outParts = this.item.checkOutDate.split('-').map(Number);
      const inDate = new Date(inParts[0], inParts[1] - 1, inParts[2]);
      const outDate = new Date(outParts[0], outParts[1] - 1, outParts[2]);
      const diffTime = outDate.getTime() - inDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      this.nightsCount = diffDays > 0 ? diffDays : 1;
    } else {
      this.nightsCount = 0;
    }

    const price = this.selectedRoom?.price || 0;
    this.estimatedTotalPrice = this.nightsCount * price;
  }

  getRoomImg(typeName?: string, id: number = 0): string {
    return getPrimaryRoomImage(typeName, id);
  }

  onImgError(event: Event): void {
    handleImageFallback(event);
  }

  onSubmit(): void {
    if (!this.validateDates()) {
      return;
    }

    this.submitting = true;
    this.serverError = '';

    const obs = this.isEdit ? this.service.update(this.id, this.item) : this.service.create(this.item);
    obs.subscribe({
      next: () => {
        this.submitting = false;
        if (this.isCustomer) {
          this.router.navigate(['/']);
        } else {
          this.router.navigate(['/bookings']);
        }
      },
      error: (err) => {
        this.submitting = false;
        this.serverError = err.error?.message || 'Có lỗi xảy ra khi lưu đơn đặt phòng. Vui lòng kiểm tra lại.';
      }
    });
  }

  cancel(): void {
    if (this.isCustomer) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/bookings']);
    }
  }
}
