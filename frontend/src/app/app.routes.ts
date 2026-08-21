import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RoomListComponent } from './components/room-list/room-list.component';
import { RoomFormComponent } from './components/room-form/room-form.component';
import { RoomTypeListComponent } from './components/room-type-list/room-type-list.component';
import { RoomTypeFormComponent } from './components/room-type-form/room-type-form.component';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { CustomerFormComponent } from './components/customer-form/customer-form.component';
import { BookingListComponent } from './components/booking-list/booking-list.component';
import { BookingFormComponent } from './components/booking-form/booking-form.component';
import { ServiceListComponent } from './components/service-list/service-list.component';
import { ServiceFormComponent } from './components/service-form/service-form.component';
import { PaymentListComponent } from './components/payment-list/payment-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'rooms', component: RoomListComponent, canActivate: [authGuard, adminGuard] },
  { path: 'rooms/new', component: RoomFormComponent, canActivate: [authGuard, adminGuard] },
  { path: 'rooms/edit/:id', component: RoomFormComponent, canActivate: [authGuard, adminGuard] },
  { path: 'room-types', component: RoomTypeListComponent, canActivate: [authGuard, adminGuard] },
  { path: 'room-types/new', component: RoomTypeFormComponent, canActivate: [authGuard, adminGuard] },
  { path: 'room-types/edit/:id', component: RoomTypeFormComponent, canActivate: [authGuard, adminGuard] },
  { path: 'customers', component: CustomerListComponent, canActivate: [authGuard, adminGuard] },
  { path: 'customers/new', component: CustomerFormComponent, canActivate: [authGuard, adminGuard] },
  { path: 'customers/edit/:id', component: CustomerFormComponent, canActivate: [authGuard, adminGuard] },
  { path: 'bookings', component: BookingListComponent, canActivate: [authGuard] },
  { path: 'bookings/new', component: BookingFormComponent, canActivate: [authGuard] },
  { path: 'bookings/edit/:id', component: BookingFormComponent, canActivate: [authGuard, adminGuard] },
  { path: 'services', component: ServiceListComponent, canActivate: [authGuard] },
  { path: 'services/new', component: ServiceFormComponent, canActivate: [authGuard, adminGuard] },
  { path: 'services/edit/:id', component: ServiceFormComponent, canActivate: [authGuard, adminGuard] },
  { path: 'payments', component: PaymentListComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: '' }
];
