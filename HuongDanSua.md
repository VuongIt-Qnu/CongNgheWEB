HƯỚNG DẪN QUY TRÌNH REFACTORING VÀ NÂNG CẤP HỆ THỐNG (ANGULAR 19 & EF CORE)

1. TỔNG QUAN CHIẾN LƯỢC REFACTORING

Trong vai trò Kiến trúc sư phần mềm, việc thực hiện refactoring không đơn thuần là cập nhật phiên bản, mà là quá trình tái thiết kế để tối ưu hóa hiệu suất và khả năng mở rộng. Hệ thống hiện tại đang vận hành trên nền tảng Angular cũ (dựa trên NgModule và FormsModule) cùng với cơ chế khởi tạo database tĩnh Database.EnsureCreated(). Đây là những rào cản kỹ thuật lớn đối với việc triển khai CI/CD và quản lý dữ liệu trong môi trường Production.

Việc chuyển đổi sang Angular 19 Standalone giúp loại bỏ sự cồng kềnh của các module trung gian, trong khi Code-First Migration cung cấp cơ chế kiểm soát phiên bản schema database một cách chặt chẽ. Dưới đây là bảng phân tích sự thay đổi chiến lược:

Đặc tính	Trạng thái hiện tại (Legacy)	Trạng thái mục tiêu (Modernized)
Angular Architecture	NgModule (Doc 2.10), dependency rườm rà.	Standalone Components, tối ưu tree-shaking.
Quản lý Form	Template-driven (ngModel), khó kiểm soát validate.	Reactive Forms, model-driven, logic validation động.
Data Access	Database.EnsureCreated(), rủi ro mất dữ liệu khi đổi schema.	EF Core Migrations, quản lý phiên bản schema bền vững.
Xử lý bất đồng bộ	Nested Subscriptions, nguy cơ Memory Leak cao.	RxJS Pipeable Operators & takeUntilDestroyed.
UI Framework	CSS thuần hoặc Bootstrap cơ bản.	Angular Material Design 19, component-based UI.

Quy trình này sẽ thiết lập nền tảng mới bắt đầu từ việc chuẩn hóa lớp giao tiếp dữ liệu tại Frontend.

2. CHUYỂN ĐỔI FORM SANG REACTIVE FORMS (ANGULAR 19 STANDALONE)

Reactive Forms trong Angular 19 cung cấp khả năng kiểm soát dữ liệu đồng bộ và xử lý logic validation phức tạp vượt trội so với Template-driven forms. Điều này đặc biệt quan trọng đối với các nghiệp vụ như kiểm tra trùng lịch đặt chỗ (schedule overlap) dựa trên dữ liệu thực tế từ StockService.

Checklist thực hiện chuyển đổi (Trọng tâm: 12 forms, tiêu biểu booking-form):

* [ ] Chuyển đổi mọi file component sang standalone: true.
* [ ] Import ReactiveFormsModule và các module Material cần thiết trực tiếp vào component.
* [ ] Thay thế hoàn toàn [(ngModel)] bằng formControlName và formGroup.
* [ ] Triển khai AsyncValidator để xử lý kiểm tra trùng lịch thông qua API.
* [ ] Áp dụng takeUntilDestroyed để tự động hủy subscribe khi component destroy.

Mẫu cấu trúc mã nguồn nghiệp vụ (TypeScript):

import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StockService } from '../services/stock.service';
import { of, switchMap, timer, map, catchError } from 'rxjs';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './booking-form.component.html'
})
export class BookingFormComponent {
  private fb = inject(FormBuilder);
  private stockService = inject(StockService);
  
  bookingForm: FormGroup = this.fb.group({
    stockCode: ['', [Validators.required]],
    bookingDate: [null, [Validators.required]],
    quantity: [0, [Validators.required, Validators.min(1)]]
  }, {
    asyncValidators: [this.checkScheduleOverlap.bind(this)]
  });

  constructor() {
    // Tự động theo dõi thay đổi với logic xử lý an toàn
    this.bookingForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(val => console.log('Form updated:', val));
  }

  // Logic validate động: Kiểm tra trùng lịch qua API
  private checkScheduleOverlap(control: AbstractControl) {
    const code = control.get('stockCode')?.value;
    const date = control.get('bookingDate')?.value;

    if (!code || !date) return of(null);

    return timer(500).pipe( // Debounce 500ms
      switchMap(() => this.stockService.checkAvailability(code, date)),
      map(isAvailable => (isAvailable ? null : { scheduleOverlap: true })),
      catchError(() => of(null))
    );
  }
}


3. TÍCH HỢP VÀ TỐI ƯU HÓA UI VỚI ANGULAR MATERIAL

Chuẩn hóa UI/UX thông qua Angular Material không chỉ mang lại giao diện chuyên nghiệp mà còn đảm bảo tính đồng nhất của các control như chọn ngày và menu điều hướng.

Quy trình cài đặt: ng add @angular/material

Mã mẫu tích hợp Component Standalone (Angular 19):

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  // ... metadata
  imports: [
    MatDatepickerModule, MatNativeDateModule, 
    MatSelectModule, MatMenuModule, MatButtonModule,
    // ... other modules
  ]
})
export class StockUIComponent {
  exchanges = ['NYSE', 'NASDAQ', 'OTHER']; // Theo source context
}


Template mẫu cho Datepicker, Select và Nested Menu:

<!-- Datepicker cho đặt phòng -->
<mat-form-field>
  <mat-label>Chọn ngày đặt phòng</mat-label>
  <input matInput [matDatepicker]="picker" formControlName="bookingDate">
  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
  <mat-datepicker #picker></mat-datepicker>
</mat-form-field>

<!-- Select cho thuộc tính Stock -->
<mat-form-field>
  <mat-label>Sàn giao dịch</mat-label>
  <mat-select formControlName="exchange">
    @for (ex of exchanges; track ex) {
      <mat-option [value]="ex">{{ex}}</mat-option>
    }
  </mat-select>
</mat-form-field>

<!-- Nested Menu cho điều hướng -->
<button mat-button [matMenuTriggerFor]="mainMenu">Quản lý Stock</button>
<mat-menu #mainMenu="matMenu">
  <button mat-menu-item [matMenuTriggerFor]="subCategory">Danh mục</button>
  <button mat-menu-item>Báo cáo</button>
</mat-menu>
<mat-menu #subCategory="matMenu">
  <button mat-menu-item>Cổ phiếu (Stocks)</button>
  <button mat-menu-item>Trái phiếu (Bonds)</button>
</mat-menu>


4. CẢI THIỆN CHẤT LƯỢNG MÃ NGUỒN VÀ XỬ LÝ BẤT ĐỒNG BỘ (RXJS)

Việc lạm dụng kiểu any và các lỗi Nested Subscriptions là nguồn gốc của "Technical Debt" và rò rỉ bộ nhớ. Chúng ta cần thiết lập kỷ luật nghiêm ngặt về Type Safety.

Quy tắc Type Safety (Interface Definition): Dựa trên Source Context (Doc 2.10, Slide 10), tuyệt đối không dùng any cho dữ liệu API.

export interface Stock {
  name: string;
  code: string;
  price: number;
  previousPrice: number;
  exchange: string;
  favorite: boolean;
}

export interface Booking {
  id: number;
  stockCode: string;
  bookingDate: Date;
  status: string; // Quản lý bởi State Machine
}


Kỹ thuật RxJS nâng cao: Sử dụng switchMap để hủy các request cũ khi người dùng thao tác nhanh, đảm bảo hiệu năng tối ưu.

Unit Test mẫu (Jasmine/Karma): Tập trung test logic Service bằng cách mock HttpClient.

it('nên fetch danh sách stock thành công', () => {
  const mockStocks: Stock[] = [{ name: 'Test', code: 'TSC', price: 100, previousPrice: 90, exchange: 'NASDAQ', favorite: false }];
  service.getStocks().subscribe(stocks => {
    expect(stocks.length).toBe(1);
    expect(stocks).toEqual(mockStocks);
  });
  const req = httpMock.expectOne('/api/stock');
  req.flush(mockStocks);
});


5. CHUẨN HÓA QUY TRÌNH DATA ACCESS VỚI EF CORE MIGRATIONS

Sử dụng Database.EnsureCreated() là một "anti-pattern" vì nó không cho phép thay đổi cấu trúc dữ liệu sau khi đã tạo. Quy trình chuyển đổi sang Migration là bắt buộc để quản lý phiên bản database.

Bước 1: Tách biệt cấu hình môi trường. Chuyển Connection String từ mã nguồn (Hardcoded) vào appsettings.json.

"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=StockMarketDB;Trusted_Connection=True;"
}


Bước 2: Cấu hình Program.cs. Gỡ bỏ Database.EnsureCreated() và đăng ký DbContext vào DI Container.

builder.Services.AddDbContext<StockDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));


Bước 3: Thực thi Migration. Sử dụng một trong hai công cụ sau:

1. .NET CLI:
  * dotnet ef migrations add InitialCreate
  * dotnet ef database update
2. Package Manager Console (PMC):
  * Add-Migration InitialCreate
  * Update-Database

6. BẢO TỒN TÍNH NĂNG NÂNG CAO VÀ KIỂM SOÁT CHẤT LƯỢNG

Refactoring phải đảm bảo tính kế thừa các logic nghiệp vụ cốt lõi đã được kiểm chứng.

Danh sách không được thay đổi (Immutable List):

* Security: Toàn bộ flow JWT Authentication và cơ chế băm mật khẩu BCrypt.
* Business Logic: State Machine điều phối trạng thái booking status (Draft -> Confirmed -> Completed).
* Backend Validation: Các thuộc tính [Required], [MinLength] trên DTO thông qua [ApiController].

Final Audit: Trước khi bàn giao, mọi thành phần mới phải được đối chiếu với danh sách bảo tồn này để đảm bảo logic nghiệp vụ không bị sai lệch.

Quy trình refactoring này không chỉ hiện đại hóa công nghệ mà còn nâng tầm hệ thống lên tiêu chuẩn doanh nghiệp, sẵn sàng cho các yêu cầu mở rộng phức tạp trong tương lai.
