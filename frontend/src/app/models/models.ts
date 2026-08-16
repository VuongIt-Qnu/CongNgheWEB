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
}

export interface HotelService {
  id: number;
  name: string;
  price: number;
  description?: string;
}
