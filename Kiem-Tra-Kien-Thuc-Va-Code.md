# BÁO CÁO KIỂM TRA: ĐỐI CHIẾU DỰ ÁN AURORA RESORT VỚI TÀI LIỆU "Kiên_Thức.md"

> Phạm vi kiểm tra: `frontend/` (Angular 19) và `backend/` (ASP.NET Core 8 Web API + EF Core), đối chiếu với 20 mục kiến thức trong [Kiên_Thức.md](Kiên_Thức.md).
> Ngày kiểm tra: 2026-08-25.

---

## 1. Tóm tắt nhanh

| Hạng mục | Đánh giá |
|---|---|
| Chất lượng code tổng thể | **Khá tốt** — kiến trúc rõ ràng, có state machine, validate 2 lớp (FE + BE), bảo mật JWT + BCrypt, DTO tách biệt Model |
| Độ phủ kiến thức so với tài liệu | **Thiếu ~35%** — dự án dùng kiến trúc Angular hiện đại (Standalone) mà tài liệu không dạy, đồng thời **không áp dụng** 3 mục quan trọng tài liệu có dạy: Reactive Forms, Angular Material, NestJS |
| Backend thực tế | **ASP.NET Core + EF Core**, không phải NestJS như mục 19 của tài liệu mô tả |
| Lỗi/rủi ro cần sửa | 1 nghiêm trọng (migration/schema), một số cải thiện nên làm (typing, RxJS pattern, test) |

---

## 2. Đối chiếu từng mục kiến thức với dự án thực tế

| # | Mục kiến thức | Có trong dự án? | Ghi chú |
|---|---|---|---|
| 1 | Tổng quan Web 1.0/2.0/3.0, Client-Server | Gián tiếp | Kiến trúc Client (Angular) – Server (ASP.NET Core API) đúng chuẩn REST |
| 2 | HTML5 ngữ nghĩa | ✅ Có | `<table>`, `<thead>`, `<form>`, `alt` trên `<img>` — xem [room-list.component.ts](frontend/src/app/components/room-list/room-list.component.ts) |
| 3 | CSS (Box Model, Selector, position) | ✅ Có | SCSS theo từng component + biến CSS (`var(--gold)`...) trong [app.component.ts](frontend/src/app/app.component.ts) |
| 4 | Angular & kiến trúc MVC (NgModule, `main.ts` bootstrap `AppModule`) | ⚠️ **Không khớp** | Dự án dùng **Standalone Components** (`bootstrapApplication`, không có `AppModule`) — xem [main.ts](frontend/src/main.ts). Đây là kiến trúc Angular hiện đại (từ v14+, mặc định từ v17+) mà tài liệu chưa đề cập |
| 5 | Component, Metadata, Lifecycle Hooks | ✅ Có (nhưng thiếu `OnDestroy`) | Toàn bộ 15 component đều có `OnInit`; **không có component nào implement `OnDestroy`** |
| 6 | Data Binding (4 loại) | ✅ Đầy đủ | Interpolation, Property, Event, `[(ngModel)]` đều dùng — xem [booking-form.component.ts](frontend/src/app/components/booking-form/booking-form.component.ts) |
| 7 | Directives (`*ngIf`, `*ngFor`, `ngClass`) | ✅ Có | Dùng nhiều trong toàn bộ list component |
| 8 | Pipes (built-in + custom) | ✅ Có, làm tốt hơn tài liệu | 4 custom pipe: [vn-date.pipe.ts](frontend/src/app/pipes/vn-date.pipe.ts), [booking-status.pipe.ts](frontend/src/app/pipes/booking-status.pipe.ts), `payment-status`, `room-status` |
| 9 | Template-Driven Forms | ✅ Có, dùng cho **toàn bộ** form | `FormsModule` + `ngModel` ở 12 component |
| 10 | Reactive Forms (`FormGroup`, `FormBuilder`) | ❌ **Không có** | `grep FormBuilder/FormGroup/ReactiveFormsModule` → 0 kết quả trong cả dự án. Tài liệu mục 10 nói rõ đây là "lựa chọn bắt buộc cho dự án doanh nghiệp lớn", nhưng form phức tạp nhất dự án ([booking-form.component.ts](frontend/src/app/components/booking-form/booking-form.component.ts) — validate ngày, tính giá, chọn phòng) vẫn dùng Template-driven |
| 11 | Template Reference Variables (`#var`) | ❌ Không thấy dùng | Không bắt buộc, nhưng tài liệu có dạy mà dự án chưa minh họa |
| 12 | Chia sẻ dữ liệu (`@Input`/`@Output`/`@ViewChild`/Service) | ⚠️ Chỉ dùng Service | Không có component nào dùng `@Input`/`@Output`/`@ViewChild` — mọi chia sẻ dữ liệu đều qua Service (đúng nhưng chưa minh họa hết các cơ chế đã học) |
| 13 | Service & Dependency Injection | ✅ Có, đúng chuẩn | `providedIn: 'root'`, constructor injection ở mọi service |
| 14 | RxJS/Observable, operators (`map`, `switchMap`, `catchError`) | ⚠️ Một phần | Có dùng `tap`, `catchError` ([auth.interceptor.ts](frontend/src/app/interceptors/auth.interceptor.ts)); **không dùng `switchMap`** dù có tình huống rất hợp lý để dùng (xem mục 3 bên dưới) |
| 15 | HttpClient, Typed Response | ⚠️ Một phần | Đa số service gọi `http.get<Room[]>` đúng chuẩn, nhưng nhiều **form component khai báo `item: any`** thay vì dùng interface đã có sẵn trong [models.ts](frontend/src/app/models/models.ts) |
| 16 | Angular Router | ✅ Đầy đủ, còn tốt hơn tài liệu | Có `CanActivateFn` (guard dạng function, mới hơn cả tài liệu dạy) — [auth.guard.ts](frontend/src/app/guards/auth.guard.ts), [admin.guard.ts](frontend/src/app/guards/admin.guard.ts) |
| 17 | Angular Material | ❌ **Không có** | `package.json` không có `@angular/material`; toàn bộ UI tự viết SCSS. Không sai, nhưng kiến thức tài liệu dạy không được thực hành |
| 18 | REST API, HTTP Verbs, Idempotency | ✅ Làm rất tốt | GET/POST/PUT/PATCH/DELETE dùng đúng ngữ nghĩa, `201 CreatedAtAction`, `204 NoContent`, `404`, `400` — xem [BookingsController.cs](backend/Controllers/BookingsController.cs) |
| 19 | **NestJS** (Controller/Service/DTO/`TypeOrmModule`) | ❌ **Không dùng NestJS** | Backend thực tế là **ASP.NET Core 8 + EF Core**, không phải Node.js/NestJS. Khái niệm Controller/Service/DTO vẫn áp dụng đúng tinh thần (chỉ khác ngôn ngữ: C# thay vì TypeScript) |
| 20 | Entity Framework Core (Code-First, Migration) | ⚠️ **Sai lệch quan trọng** | Dự án **không có thư mục `Migrations`**, dùng `db.Database.EnsureCreated()` trong [Program.cs:67](backend/Program.cs#L67) thay vì `add-migration`/`update-database` như tài liệu mục 20 dạy — xem chi tiết mục 4.1 bên dưới |

---

## 3. Các vấn đề trong code cần sửa

### 3.1. [Nghiêm trọng] `EnsureCreated()` thay vì Migrations — không đúng quy trình Code-First đã học

**Vị trí:** [backend/Program.cs:64-68](backend/Program.cs#L64-L68)

```csharp
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.EnsureCreated();
}
```

**Vấn đề:** `EnsureCreated()` tạo schema đúng 1 lần dựa theo trạng thái Model hiện tại và **không tương thích** với Migrations. Nếu sau này sửa `Models/*.cs` (thêm cột, đổi kiểu dữ liệu...) thì:
- Ứng dụng sẽ **không tự cập nhật schema** cho DB đã tồn tại (`hotel.db` đã có sẵn) → lỗi runtime khi EF Core cố truy vấn cột chưa tồn tại.
- Không có lịch sử thay đổi schema (mất khả năng rollback, mất khả năng review qua Git diff) — đúng thứ mà tài liệu mục 20 nhấn mạnh là lý do dùng `add-migration`.

**Cách sửa:**
```bash
cd backend
dotnet ef migrations add InitialCreate
dotnet ef database update
```
rồi thay đoạn seed/tạo DB trong `Program.cs` bằng:
```csharp
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate(); // thay cho EnsureCreated()
}
```
> Lưu ý: cần xoá `hotel.db` cũ (hoặc backup) trước khi chạy migration lần đầu để tránh xung đột schema.

---

### 3.2. Form phức tạp nhất dự án chưa dùng Reactive Forms như tài liệu khuyến nghị

**Vị trí:** [frontend/src/app/components/booking-form/booking-form.component.ts:206-217](frontend/src/app/components/booking-form/booking-form.component.ts#L206-L217)

```ts
export class BookingFormComponent implements OnInit {
  item: any = { customerId: null, roomId: null, checkInDate: '', checkOutDate: '', notes: '' };
  ...
  validateDates(): boolean { /* validate thủ công bằng if/else */ }
```

**Vấn đề:** Đây chính là ví dụ điển hình tài liệu mục 10 nói cần Reactive Forms: form có logic validate phức tạp (ngày nhận/trả phòng phụ thuộc lẫn nhau, tính giá động). Hiện tại validate được viết tay bằng nhiều hàm `validateDates()`, `onCheckInChange()`, `onCheckOutChange()` thay vì dùng `FormGroup` + `Validators` + custom validator, khiến logic khó test đơn vị và dễ rối khi form phình to thêm.

**Cách sửa (khuyến nghị, không bắt buộc phải làm ngay):** Refactor sang `FormBuilder`:
```ts
this.form = this.fb.group({
  customerId: [null, Validators.required],
  roomId: [null, Validators.required],
  checkInDate: ['', Validators.required],
  checkOutDate: ['', Validators.required],
  notes: ['']
}, { validators: dateRangeValidator }); // custom validator kiểm tra checkOut > checkIn
```

---

### 3.3. Dùng `any` thay vì interface đã có sẵn (mất an toàn kiểu dữ liệu của TypeScript)

**Vị trí:** 8 component form/list, ví dụ [booking-form.component.ts:207](frontend/src/app/components/booking-form/booking-form.component.ts#L207), [room-form.component.ts](frontend/src/app/components/room-form/room-form.component.ts), [customer-form.component.ts](frontend/src/app/components/customer-form/customer-form.component.ts)...

**Vấn đề:** Tài liệu mục 15 nhấn mạnh "So What?": dùng Typed Response (`http.get<Stock[]>`) để "giảm thiểu lỗi runtime". Dự án đã định nghĩa đầy đủ interface (`Booking`, `Room`, `Customer`... trong [models.ts](frontend/src/app/models/models.ts)) nhưng các form lại khai báo `item: any`, làm mất tác dụng của kiểu dữ liệu — TypeScript sẽ không cảnh báo khi gõ sai tên field hay gán sai kiểu.

**Cách sửa:** Đổi `item: any` → dùng kiểu cụ thể hoặc `Partial<Booking>`:
```ts
item: Partial<Booking> = { customerId: undefined, roomId: undefined, checkInDate: '', checkOutDate: '', notes: '' };
```

---

### 3.4. Subscribe lồng nhau (nested subscribe) thay vì dùng `switchMap`

**Vị trí:** [booking-form.component.ts:259-280](frontend/src/app/components/booking-form/booking-form.component.ts#L259-L280)

```ts
this.roomService.getAll().subscribe(d => {
  this.rooms = d;
  this.route.queryParams.subscribe(params => { ... }); // subscribe lồng bên trong subscribe
});
```

**Vấn đề:** Đây đúng là pattern mà tài liệu mục 14 nói `switchMap` sinh ra để giải quyết. Subscribe lồng nhau khó đọc, khó xử lý lỗi tập trung, và tạo 2 subscription độc lập nhưng không được huỷ khi component destroy (rò rỉ nhẹ nếu người dùng điều hướng rời trang trước khi cả hai luồng hoàn tất).

**Cách sửa:**
```ts
import { switchMap } from 'rxjs';

this.roomService.getAll().pipe(
  switchMap(rooms => {
    this.rooms = rooms;
    return this.route.queryParams;
  })
).subscribe(params => { ... });
```

---

### 3.5. Không có component nào implement `OnDestroy`

**Vị trí:** toàn bộ `frontend/src/app/components/*`

**Vấn đề:** Tài liệu mục 5 cảnh báo rõ: bỏ sót `OnDestroy` có thể gây memory leak. Các `subscribe()` trực tiếp tới `HttpClient` (tự hoàn thành sau 1 lần emit) thì không sao, nhưng các subscribe tới `route.queryParams`, `route.paramMap`, hoặc `currentUser$` (là `BehaviorSubject` sống suốt vòng đời app) nên được huỷ khi component bị destroy để đúng chuẩn thực hành, đặc biệt nếu dự án mở rộng thêm.

**Cách sửa:** Dùng `takeUntilDestroyed()` (Angular 16+, không cần viết `OnDestroy` thủ công):
```ts
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

this.route.queryParams.pipe(takeUntilDestroyed()).subscribe(params => { ... });
```

---

### 3.6. Không có test đơn vị nào dù đã cấu hình Karma/Jasmine

**Vị trí:** `frontend/package.json` có `"test": "ng test"` + đầy đủ `karma`, `jasmine-core`... nhưng **0 file `*.spec.ts`** trong toàn bộ `frontend/src`.

**Vấn đề:** Tài liệu mục 10 nêu lý do chọn Reactive Forms là "dễ dàng kiểm thử đơn vị (Unit Test)" — nhưng dự án chưa viết bất kỳ test nào để minh chứng năng lực này, dù hạ tầng test đã sẵn có.

**Cách sửa (khuyến nghị cho mục tiêu học tập):** Viết tối thiểu vài test cho các hàm logic thuần (không cần TestBed phức tạp), ví dụ test `validateDates()` của `BookingFormComponent` hoặc các pipe (`BookingStatusPipe`) — đây là các đơn vị dễ test nhất, độc lập DOM.

---

## 4. Những phần dự án làm **tốt hơn** hoặc **vượt** so với tài liệu (ghi nhận, không cần sửa)

- **Standalone Components + `CanActivateFn`/`HttpInterceptorFn` dạng function**: đây là API Angular hiện đại hơn nội dung tài liệu (tài liệu dạy theo kiến trúc `NgModule` cũ). Không sai — chỉ là tài liệu học chưa cập nhật theo kịp.
- **Bảo mật**: JWT + BCrypt hash mật khẩu ([ApplicationDbContext.cs:79](backend/Data/ApplicationDbContext.cs#L79)), interceptor tự xử lý 401 và logout ([auth.interceptor.ts](frontend/src/app/interceptors/auth.interceptor.ts)) — vượt xa phạm vi tài liệu dạy (tài liệu không đề cập bảo mật/JWT).
- **State machine cho trạng thái Booking** ([BookingService.cs:26-33](backend/Services/BookingService.cs#L26-L33)): ngăn chuyển trạng thái phi logic (VD: "pending" → "completed" trực tiếp) — thiết kế nghiệp vụ vững, vượt yêu cầu CRUD cơ bản.
- **Kiểm tra trùng lịch đặt phòng** (`HasOverlappingBooking`) dùng đúng logic khoảng nửa-mở toán học — chi tiết mà nhiều dự án sinh viên hay bỏ sót.
- **DTO + `[ApiController]` validate tự động**: tương đương tinh thần `ValidationPipe` của NestJS mà tài liệu mục 19 dạy, chỉ khác cú pháp (DataAnnotations của C# thay vì `class-validator`).

---

## 5. Danh sách việc cần làm (ưu tiên)

| Ưu tiên | Việc cần làm | File liên quan |
|---|---|---|
| 🔴 Cao | Chuyển `EnsureCreated()` → EF Core Migrations | [Program.cs](backend/Program.cs) |
| 🟡 Trung bình | Refactor `BookingFormComponent` sang Reactive Forms | [booking-form.component.ts](frontend/src/app/components/booking-form/booking-form.component.ts) |
| 🟡 Trung bình | Thay `item: any` bằng interface có sẵn ở 8 component | `components/*-form/*.component.ts` |
| 🟢 Thấp | Thay nested-subscribe bằng `switchMap` | [booking-form.component.ts](frontend/src/app/components/booking-form/booking-form.component.ts) |
| 🟢 Thấp | Thêm `takeUntilDestroyed()` cho subscription dài hạn | toàn bộ component |
| 🟢 Thấp | Viết vài unit test minh hoạ (pipe + hàm validate) | `frontend/src/app` |
| 🔵 Bổ sung kiến thức (tuỳ chọn) | Thử tích hợp Angular Material cho 1 màn hình để thực hành mục 17 | — |
| 🔵 Bổ sung kiến thức (tuỳ chọn) | Cập nhật tài liệu học để phản ánh Standalone Components thay vì NgModule | [Kiên_Thức.md](Kiên_Thức.md) |

---

## 6. Kết luận

Dự án **Aurora Resort** thể hiện năng lực thực hành tốt hơn nhiều so với những gì tài liệu "Kiên_Thức.md" mô tả ở tầng kiến trúc (Standalone Components, JWT, state machine nghiệp vụ), nhưng lại **bỏ qua thực hành 3 chủ đề tài liệu có dạy** (Reactive Forms, Angular Material, NestJS — dự án dùng ASP.NET Core thay thế) và có **một lỗi quy trình quan trọng** ở tầng dữ liệu (thiếu EF Core Migrations). Về tổng thể, code sạch, có tổ chức, áp dụng đúng REST và bảo mật cơ bản — các điểm cần sửa ở trên chủ yếu là hoàn thiện để khớp đầy đủ với nội dung đã học, không phải lỗi làm sập ứng dụng (trừ mục 3.1 cần lưu ý khi thay đổi schema trong tương lai).
