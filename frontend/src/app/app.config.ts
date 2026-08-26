import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNativeDateAdapter } from '@angular/material/core';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    // Cần cho hiệu ứng mở/đóng của mat-select, mat-dialog, mat-datepicker...
    provideAnimationsAsync(),
    // Cần để mat-datepicker dùng đối tượng Date gốc của JS (khớp cách app đang xử lý ngày tháng).
    provideNativeDateAdapter()
  ]
};
