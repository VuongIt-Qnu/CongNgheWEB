import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { BookingService } from '../../services/booking.service';
import { CustomerService } from '../../services/customer.service';
import { HotelServiceService } from '../../services/hotel-service.service';
import { AuthService } from '../../services/auth.service';
import { RoomTypeService } from '../../services/room-type.service';
import { Room, Booking, HotelService, RoomType } from '../../models/models';
import { VnDatePipe } from '../../pipes/vn-date.pipe';
import { formatVNDate } from '../../utils/date-format';
import { BOOKING_STATUS_MAP } from '../../pipes/booking-status.pipe';
import { ROOM_STATUS_MAP } from '../../pipes/room-status.pipe';
import {
  getPrimaryRoomImage,
  getRoomImages,
  getRoomAmenities,
  getRoomRating,
  handleImageFallback,
  RESORT_HERO_IMAGE
} from '../../utils/room-images';

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
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, VnDatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Common state
  isCustomer = false;
  currentUser: any = null;
  heroImage = RESORT_HERO_IMAGE;

  // Admin Dashboard stats
  roomCount = 0;
  bookingCount = 0;
  customerCount = 0;
  serviceCount = 0;
  recentBookings: Booking[] = [];
  adminRooms: Room[] = [];

  // Customer Portal state
  availableRooms: Room[] = [];
  filteredRooms: Room[] = [];
  roomTypes: RoomType[] = [];
  myBookings: Booking[] = [];
  servicesList: HotelService[] = [];

  // ── Advanced Booking Search Bar State ──
  searchLocation: string = '05 Trần Văn Ơn, Quy Nhơn Nam, Gia Lai';
  searchCheckIn: string = '';
  searchCheckOut: string = '';
  searchGuests: number = 2;
  selectedTypeId: number = 0;
  todayStr: string = '';
  minCheckOutStr: string = '';
  isSearching: boolean = false;
  hasSearched: boolean = false;
  searchResultCount: number = 0;
  searchValidationError: string = '';

  // Room Detail Modal state
  selectedRoom: Room | null = null;
  selectedRoomGallery: string[] = [];
  activeGalleryImage: string = '';
  selectedRoomAmenities: string[] = [];
  selectedRoomRating: { score: number; count: number } = { score: 5.0, count: 100 };

  constructor(
    private roomService: RoomService,
    private bookingService: BookingService,
    private customerService: CustomerService,
    private hotelServiceService: HotelServiceService,
    private roomTypeService: RoomTypeService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    this.isCustomer = this.currentUser?.role === 'customer';

    // Initialize dates in local Vietnam time
    this.todayStr = getLocalDateString();
    const future = new Date();
    future.setDate(future.getDate() + 2);
    this.searchCheckIn = this.todayStr;
    this.searchCheckOut = getLocalDateString(future);
    this.minCheckOutStr = getNextDayString(this.searchCheckIn);

    if (this.isCustomer) {
      this.loadCustomerDashboard();
    } else {
      this.loadAdminDashboard();
    }
  }

  loadAdminDashboard(): void {
    this.roomService.getAll().subscribe(data => {
      this.roomCount = data.length;
      this.adminRooms = data.slice(0, 6);
    });
    this.bookingService.getAll().subscribe(data => {
      this.bookingCount = data.length;
      this.recentBookings = data.slice(0, 5);
    });
    this.customerService.getAll().subscribe(data => this.customerCount = data.length);
    this.hotelServiceService.getAll().subscribe(data => this.serviceCount = data.length);
  }

  loadCustomerDashboard(): void {
    // Load Room Types for filter
    this.roomTypeService.getAll().subscribe(types => {
      this.roomTypes = types;
    });

    // Load available rooms
    this.roomService.getAll().subscribe(rooms => {
      this.availableRooms = rooms;
      this.filteredRooms = rooms;
      this.searchResultCount = rooms.length;
    });

    // Load user's personal bookings (filtered on API)
    this.bookingService.getAll().subscribe(bookings => {
      this.myBookings = bookings;
    });

    // Load services
    this.hotelServiceService.getAll().subscribe(services => {
      this.servicesList = services;
    });
  }

  // ── Date Change & Validation for Search Bar ──
  onCheckInChange(): void {
    if (this.searchCheckIn < this.todayStr) {
      this.searchCheckIn = this.todayStr;
    }
    this.minCheckOutStr = getNextDayString(this.searchCheckIn);
    if (this.searchCheckOut <= this.searchCheckIn) {
      this.searchCheckOut = this.minCheckOutStr;
    }
  }

  onCheckOutChange(): void {
    if (this.searchCheckOut <= this.searchCheckIn) {
      this.searchCheckOut = getNextDayString(this.searchCheckIn);
    }
  }

  incrementGuests(): void {
    if (this.searchGuests < 10) {
      this.searchGuests++;
    }
  }

  decrementGuests(): void {
    if (this.searchGuests > 1) {
      this.searchGuests--;
    }
  }

  performSearch(): void {
    this.searchValidationError = '';

    // Validate dates
    if (this.searchCheckIn < this.todayStr) {
      this.searchValidationError = 'Ngày nhận phòng không thể trong quá khứ.';
      return;
    }
    if (this.searchCheckOut <= this.searchCheckIn) {
      this.searchValidationError = 'Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 ngày.';
      return;
    }

    this.isSearching = true;
    this.hasSearched = true;

    setTimeout(() => {
      const loc = (this.searchLocation || '').toLowerCase().trim();
      const isUniversalLocation = /quy nhơn|gia lai|trần văn ơn|aurora|resort|khách sạn|tất cả/i.test(loc) || loc === '';

      this.filteredRooms = this.availableRooms.filter(r => {
        // 1. Capacity match: room must hold at least the requested guests (or match)
        const matchGuests = r.capacity >= this.searchGuests;

        // 2. Room type match if selected
        const matchType = !this.selectedTypeId || r.roomTypeId === +this.selectedTypeId;

        // 3. Location / text query match
        const matchLocation = isUniversalLocation ||
          r.roomNumber.toLowerCase().includes(loc) ||
          r.roomTypeName.toLowerCase().includes(loc) ||
          (r.description && r.description.toLowerCase().includes(loc));

        return matchGuests && matchType && matchLocation;
      });

      this.searchResultCount = this.filteredRooms.length;
      this.isSearching = false;

      // Smooth scroll to rooms section
      const el = document.getElementById('rooms-results-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  }

  resetSearch(): void {
    this.searchLocation = '05 Trần Văn Ơn, Quy Nhơn Nam, Gia Lai';
    this.searchGuests = 2;
    this.selectedTypeId = 0;
    this.searchCheckIn = this.todayStr;
    const future = new Date();
    future.setDate(future.getDate() + 2);
    this.searchCheckOut = getLocalDateString(future);
    this.filteredRooms = this.availableRooms;
    this.searchResultCount = this.availableRooms.length;
    this.hasSearched = false;
  }

  bookRoomDirect(roomId: number): void {
    this.router.navigate(['/bookings/new'], {
      queryParams: {
        roomId: roomId,
        checkIn: this.searchCheckIn,
        checkOut: this.searchCheckOut
      }
    });
  }

  // ── Image & Modal Helpers ──
  getRoomImg(typeName?: string, index: number = 0): string {
    return getPrimaryRoomImage(typeName, index);
  }

  getAmenities(typeName?: string): string[] {
    return getRoomAmenities(typeName);
  }

  getRating(roomId: number) {
    return getRoomRating(roomId);
  }

  onImgError(event: Event): void {
    handleImageFallback(event);
  }

  openRoomDetail(room: Room): void {
    this.selectedRoom = room;
    this.selectedRoomGallery = getRoomImages(room.roomTypeName);
    this.activeGalleryImage = this.selectedRoomGallery[0];
    this.selectedRoomAmenities = getRoomAmenities(room.roomTypeName);
    this.selectedRoomRating = getRoomRating(room.id);
  }

  closeRoomDetail(): void {
    this.selectedRoom = null;
  }

  setGalleryImage(img: string): void {
    this.activeGalleryImage = img;
  }

  /** Helper: Trả về label tiếng Việt cho booking status */
  getBookingStatusLabel(status: string): string {
    return BOOKING_STATUS_MAP[status]?.label || status;
  }

  /** Helper: Trả về icon + label tiếng Việt cho booking status */
  getBookingStatusFull(status: string): string {
    const entry = BOOKING_STATUS_MAP[status];
    if (!entry) return status;
    return `${entry.icon} ${entry.label}`;
  }

  /** Helper: Trả về label tiếng Việt cho room status */
  getRoomStatusLabel(status: string): string {
    return ROOM_STATUS_MAP[status]?.label || status;
  }
}
