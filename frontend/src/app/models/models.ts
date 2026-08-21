export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  isActive: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RoomType {
  id: number;
  name: string;
  description?: string;
  roomCount?: number;
}

export interface Room {
  id: number;
  roomNumber: string;
  roomTypeId: number;
  roomTypeName: string;
  price: number;
  capacity: number;
  status: string;
  description?: string;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  idCard?: string;
  address?: string;
  userId?: number;
  createdAt?: string;
}

export interface Booking {
  id: number;
  customerId: number;
  customerName: string;
  roomId: number;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalPrice: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  // ── Tổng hợp thanh toán ──
  amountPaid: number;
  amountDue: number;
  /** unpaid | partial | paid */
  paymentStatus: string;
}

export interface HotelService {
  id: number;
  name: string;
  price: number;
  description?: string;
}

export interface Payment {
  id: number;
  bookingId: number;
  customerName: string;
  roomNumber: string;
  amount: number;
  /** cash | bank_transfer | credit_card */
  method: string;
  /** pending | completed | failed | refunded */
  status: string;
  transactionCode?: string;
  notes?: string;
  createdAt?: string;
  paidAt?: string;
}

export interface CreatePayment {
  bookingId: number;
  amount: number;
  method: string;
  notes?: string;
}
