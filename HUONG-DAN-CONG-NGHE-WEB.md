# Công nghệ Web — Đối chiếu lý thuyết với dự án Aurora Resort

> Tài liệu này giải thích từng chủ đề trong slide "Công nghệ Web" (2.1 → 2.13, 3, 06)
> **đã/chưa** được áp dụng ở đâu trong chính dự án của bạn (`c:\Vuongstudy\CongNghe_Web`).
> Dự án gồm 2 phần:
> - **`frontend/`** — Angular 19 (standalone components, không dùng NgModule)
> - **`backend/`** — **ASP.NET Core Web API** (C#), *không phải NestJS* như tên file PDF "3_API Nest JS.pdf" gợi ý — xem giải thích ở [mục 14](#14-3_api-nestjspdf--06_web_apipdf-thực-tế-là-aspnet-core-web-api).

Quy ước đọc: mỗi mục có 3 phần — **Lý thuyết**, **Dùng ở đâu trong dự án** (đường dẫn file cụ thể), **Luồng hoạt động**.

---

## 1. 2.1_Introduction Angular.pdf — Kiến trúc tổng thể

**Lý thuyết:** Angular là framework SPA (Single Page Application) dựa trên component, biên dịch TypeScript → JavaScript, có sẵn Router, HttpClient, Forms, DI (Dependency Injection).

**Dùng ở đâu:**
- [`frontend/src/main.ts`](frontend/src/main.ts) — điểm khởi động (`bootstrapApplication`)
- [`frontend/src/app/app.config.ts`](frontend/src/app/app.config.ts) — cấu hình toàn cục
- [`frontend/src/app/app.component.ts`](frontend/src/app/app.component.ts) — component gốc

**Luồng hoạt động:**
```
main.ts
  └─ bootstrapApplication(AppComponent, appConfig)
        ├─ provideRouter(routes)              → bật định tuyến
        ├─ provideHttpClient(withInterceptors) → bật gọi API
        └─ provideZoneChangeDetection          → cơ chế phát hiện thay đổi
              ↓
        AppComponent render <app-navbar> + <router-outlet>
              ↓
        Router đọc URL → chọn component tương ứng → render vào <router-outlet>
```
Dự án này dùng **standalone components** (chuẩn Angular 15+, thấy trong `package.json` là Angular ^19.2.0) — nghĩa là **không có `app.module.ts`**. Mỗi component tự khai báo `imports: [...]` nó cần (xem mục 2), thay vì đăng ký trong NgModule như slide có thể dạy theo kiểu cũ. Đây là điểm khác biệt quan trọng nếu slide của bạn dạy theo NgModule.

---

## 2. 2.2_Component.pdf — Component

**Lý thuyết:** Component = 1 class TypeScript (gắn `@Component`) + 1 template (HTML) + style, là đơn vị UI nhỏ nhất có thể tái sử dụng.

**Dùng ở đâu:** toàn bộ [`frontend/src/app/components/`](frontend/src/app/components/) — 13 component: `navbar`, `dashboard`, `login`, `register`, `room-list`, `room-form`, `room-type-list`, `room-type-form`, `customer-list`, `customer-form`, `booking-list`, `booking-form`, `service-list`, `service-form`, `payment-list`.

**Luồng hoạt động — ví dụ [`room-list.component.ts`](frontend/src/app/components/room-list/room-list.component.ts):**
```ts
@Component({
  selector: 'app-room-list',       // <app-room-list></app-room-list> dùng trong HTML/router
  standalone: true,                 // không cần khai báo trong NgModule
  imports: [CommonModule, RouterModule, FormsModule],  // các "công cụ" template này cần (*ngIf, routerLink, ngModel...)
  template: `...`,                  // template inline (HTML ngay trong TS)
  styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent implements OnInit { ... }
```
Có 2 cách viết template trong dự án:
- **Inline** (`template: \`...\``) — đa số component: `room-list`, `room-form`, `login`, `app.component`…
- **Tách file riêng** (`templateUrl`) — `navbar.component.html`, `dashboard.component.html` (dùng khi template dài, dễ đọc hơn).

Vòng đời quan trọng nhất được dùng: **`ngOnInit()`** — chạy 1 lần sau khi component khởi tạo, dùng để gọi API load dữ liệu (ví dụ `RoomListComponent.ngOnInit()` gọi `loadRooms()`).

---

## 3. 2.3_DataBinding.pdf — Data Binding

**Lý thuyết:** 4 kiểu liên kết dữ liệu giữa class (.ts) và template (.html).

**Dùng ở đâu & luồng hoạt động** (dẫn chứng từ [`room-list.component.ts`](frontend/src/app/components/room-list/room-list.component.ts)):

| Kiểu | Cú pháp | Ví dụ trong dự án | Ý nghĩa |
|---|---|---|---|
| **Interpolation** (1 chiều, TS→HTML) | `{{ expr }}` | `{{ room.roomNumber }}`, `{{ rooms.length }}` | Hiển thị giá trị biến ra text |
| **Property binding** (1 chiều, TS→HTML) | `[prop]="expr"` | `[src]="getRoomImg(...)"`, `[class.active]="selectedStatus === ''"` | Gán giá trị vào thuộc tính DOM/component |
| **Event binding** (1 chiều, HTML→TS) | `(event)="handler()"` | `(click)="deleteRoom(room.id)"`, `(change)="filterRooms()"` | Gọi hàm khi người dùng tương tác |
| **Two-way binding** (2 chiều) | `[(ngModel)]="prop"` | `<input [(ngModel)]="searchTerm" (ngModelChange)="filterRooms()">` | Gõ vào input → biến TS cập nhật ngay, và ngược lại |

Luồng cụ thể khi bạn gõ vào ô tìm kiếm phòng:
```
Người dùng gõ → [(ngModel)]="searchTerm" cập nhật biến searchTerm
              → (ngModelChange) bắn ra → gọi filterRooms()
              → filterRooms() lọc mảng rooms → gán filteredRooms
              → *ngFor="let room of filteredRooms" tự render lại bảng
```

---

## 4. 2.4_Directives.pdf — Directives

**Lý thuyết:** Directive = "chỉ thị" gắn thêm hành vi vào DOM. 3 loại: Component (có template — đã nói ở mục 2), **Structural** (thay đổi cấu trúc DOM, có dấu `*`), **Attribute** (thay đổi vẻ ngoài/hành vi của phần tử có sẵn).

**Dùng ở đâu:**
- **Structural directives** (built-in của Angular, `CommonModule`):
  - `*ngIf` — ví dụ [`navbar.component.html:1`](frontend/src/app/components/navbar/navbar.component.html) `<header *ngIf="auth.isLoggedIn()">` → ẩn/hiện cả thanh navbar tùy trạng thái đăng nhập.
  - `*ngFor` — [`room-list.component.ts:86`](frontend/src/app/components/room-list/room-list.component.ts) `<tr *ngFor="let room of filteredRooms">` → lặp render 1 dòng bảng cho mỗi phòng.
- **Attribute directives** (built-in):
  - `[class.active]`, `[class.is-invalid]` — gắn/gỡ 1 class CSS theo điều kiện (xem `room-list`, `booking-form`).
  - `routerLink`, `routerLinkActive` — của `RouterModule` (xem mục 11).
  - `[(ngModel)]` — thật ra bản thân `ngModel` cũng là 1 directive (của `FormsModule`).

**Ghi chú quan trọng:** dự án **chưa có Custom Directive** nào (mình đã grep `@Directive` trong toàn bộ `frontend/src` → không có kết quả). Nếu slide 2.4 có phần "tự viết directive" (`@Directive`), đây là phần lý thuyết bạn học nhưng **chưa thực hành trong dự án này** — ví dụ bài tập có thể thêm: 1 directive `appHighlight` tô màu ô phòng sắp hết hạn bảo trì.

---

## 5. 2.5_Forms.pdf — Forms (Template-driven Forms)

**Lý thuyết:** Angular có 2 cách làm form: **Template-driven** (dùng `ngModel`, logic validate nằm trong HTML) và **Reactive** (dùng `FormGroup`, logic nằm trong TS — xem mục 7).

**Dùng ở đâu:** **Toàn bộ form trong dự án đều là Template-driven Forms**, dùng `FormsModule`:
- [`login.component.ts`](frontend/src/app/components/login/login.component.ts), [`register.component.ts`](frontend/src/app/components/register/register.component.ts)
- [`room-form.component.ts`](frontend/src/app/components/room-form/room-form.component.ts), `room-type-form`, `customer-form`, `service-form`
- [`booking-form.component.ts`](frontend/src/app/components/booking-form/booking-form.component.ts)

**Luồng hoạt động — ví dụ `room-form.component.ts`:**
```html
<form (ngSubmit)="onSubmit()">
  <input [(ngModel)]="room.roomNumber" name="roomNumber" required>
  <select [(ngModel)]="room.roomTypeId" name="roomTypeId" (change)="onTypeChange()" required>
    <option *ngFor="let rt of roomTypes" [value]="rt.id">{{ rt.name }}</option>
  </select>
  <button type="submit">Lưu</button>
</form>
```
```ts
onSubmit(): void {
  const obs = this.isEdit
    ? this.roomService.update(this.id, this.room)   // đang sửa → gọi PUT
    : this.roomService.create(this.room);            // đang thêm mới → gọi POST
  obs.subscribe(() => this.router.navigate(['/rooms']));
}
```
Cơ chế: mỗi `input`/`select` có `name="..."` bắt buộc (để `NgForm` theo dõi field đó) + `[(ngModel)]` gắn vào 1 property của object `room`. Khi submit, không cần gom dữ liệu thủ công — object `room` đã tự cập nhật sẵn qua two-way binding, chỉ việc gửi thẳng lên service.

**Validate:** dùng thuộc tính HTML5 thuần (`required`, `min`, `max`, `type="email"`) chứ chưa dùng `Validators` của Angular — vì đây là template-driven, không phải reactive form.

---

## 6. 2.6_Template Reference Variables.pdf

**Lý thuyết:** Biến tham chiếu tới 1 phần tử DOM hoặc component con ngay trong template, khai báo bằng dấu `#`, ví dụ `<input #emailInput>` rồi dùng `emailInput.value` ở chỗ khác trong cùng template.

**Dùng ở đâu trong dự án:** ❌ **Không có.** Mình đã kiểm tra toàn bộ template (`grep "#\w+"` trên `frontend/src`) — dự án không dùng template reference variable nào (kể cả kiểu phổ biến `#form="ngForm"` để đọc trạng thái valid/invalid của form).

**Vì sao vẫn form hoạt động được mà không cần `#form`?** Vì code hiện tại validate theo cách "thủ công" trong TS (so sánh `checkInError`, disable nút bằng `[disabled]="loading || !email || !password"`) thay vì đọc `form.invalid` từ template reference variable — đây là 2 cách tiếp cận khác nhau cho cùng mục đích.

**Gợi ý áp dụng thực tế (nếu muốn luyện tập):** sửa `login.component.ts`:
```html
<form #loginForm="ngForm" (ngSubmit)="onSubmit()">
  ...
  <button [disabled]="loginForm.invalid">Đăng nhập</button>
</form>
```
`#loginForm` ở đây tham chiếu tới directive `NgForm` mà Angular tự gắn vào thẻ `<form>`.

---

## 7. 2.7_Reactive Form.pdf

**Lý thuyết:** Reactive Forms xây form bằng code TypeScript (`FormGroup`, `FormControl`, `Validators`), không phụ thuộc `ngModel`. Ưu điểm: validate phức tạp, testable, dùng tốt cho form động.

**Dùng ở đâu trong dự án:** ❌ **Không có.** Mình đã grep `ReactiveFormsModule|FormBuilder|FormGroup|Validators` trên toàn bộ `frontend/src` → không có kết quả nào. Toàn bộ form trong Aurora Resort đều dùng **Template-driven** (mục 5).

**So sánh nhanh để bạn hiểu vì sao 2 mục 5 và 7 dạy 2 kỹ thuật khác nhau cho cùng 1 việc:**

| | Template-driven (đang dùng) | Reactive (chưa dùng) |
|---|---|---|
| Khai báo control | trong HTML (`[(ngModel)]`) | trong TS (`new FormGroup(...)`) |
| Validate | HTML attributes (`required`) | `Validators.required` trong TS |
| Phù hợp | Form đơn giản, ít logic | Form phức tạp, nhiều điều kiện phụ thuộc |
| Module cần import | `FormsModule` | `ReactiveFormsModule` |

**Gợi ý luyện tập:** viết lại `room-form.component.ts` bằng Reactive Form để so sánh — đây là bài tập rất hay để thấy rõ khác biệt giữa 2 mục 5 và 7 của slide.

---

## 8. 2.8_Sharing Data.pdf — Chia sẻ dữ liệu giữa các component

**Lý thuyết:** slide thường dạy 3 cách: (a) `@Input()`/`@Output()` (cha ↔ con trực tiếp), (b) Service dùng chung (2 component không có quan hệ cha-con), (c) Router (qua URL param/query param).

**Dùng ở đâu trong dự án:**

❌ **(a) `@Input`/`@Output`: không có** — mình đã grep, dự án không có component cha-con nào truyền dữ liệu kiểu này (tất cả component trong dự án đều "độc lập", được Router gắn thẳng vào `<router-outlet>`, ngoại trừ `navbar` được nhúng tĩnh trong `app.component.ts` nhưng không nhận `@Input` nào từ cha).

✅ **(b) Chia sẻ qua Service — cách chính được dùng trong dự án**, ví dụ kinh điển nhất là trạng thái đăng nhập, ở [`auth.service.ts`](frontend/src/app/services/auth.service.ts):
```ts
private currentUserSubject = new BehaviorSubject<User | null>(null);
currentUser$ = this.currentUserSubject.asObservable();   // "kênh phát sóng" chỉ đọc
```
- `AuthService` giữ 1 `BehaviorSubject` duy nhất (vì `providedIn: 'root'` → toàn app chỉ có **1 instance** service này).
- Khi login thành công, `setSession()` gọi `this.currentUserSubject.next(res.user)` → "phát sóng" user mới.
- Bất kỳ component nào cũng đọc được: `navbar.component.html:67` dùng `{{ (auth.currentUser$ | async)?.name }}` (subscribe qua pipe `async`, xem mục 12), còn `dashboard.component.ts` đọc trực tiếp `this.auth.getCurrentUser()`.
- → Đây chính là "Sharing Data" giữa các component **không có quan hệ cha–con**: `login`, `navbar`, `dashboard`, `app.component` đều không biết nhau, nhưng cùng đọc/ghi 1 service.

✅ **(c) Chia sẻ qua Router (URL)** — dùng ở 2 nơi:
- **Route param** — `room-form.component.ts:156`:
  ```ts
  const idParam = this.route.snapshot.paramMap.get('id');   // đọc /rooms/edit/:id
  ```
- **Query param** — `dashboard.component.ts` → `booking-form`:
  ```ts
  this.router.navigate(['/bookings/new'], { queryParams: { roomId, checkIn, checkOut } });
  ```
  Khi bấm "Đặt phòng" từ dashboard, dữ liệu phòng/ngày được "gửi kèm" qua URL, và `booking-form` đọc lại bằng `ActivatedRoute` để điền sẵn form.

---

## 9. 2.9_Services.pdf — Services & Dependency Injection

**Lý thuyết:** Service = class chứa logic dùng chung (gọi API, xử lý state...), tách biệt khỏi component. Angular tự "tiêm" (inject) instance vào nơi cần qua constructor — gọi là Dependency Injection (DI).

**Dùng ở đâu:** toàn bộ [`frontend/src/app/services/`](frontend/src/app/services/) — `auth.service.ts`, `room.service.ts`, `room-type.service.ts`, `customer.service.ts`, `booking.service.ts`, `payment.service.ts`, `hotel-service.service.ts`.

**Luồng hoạt động — [`room.service.ts`](frontend/src/app/services/room.service.ts):**
```ts
@Injectable({ providedIn: 'root' })   // Angular tự tạo & quản lý 1 instance duy nhất (singleton) toàn app
export class RoomService {
  private apiUrl = `${environment.apiUrl}/rooms`;   // http://localhost:5000/api/rooms
  constructor(private http: HttpClient) {}           // DI: Angular tự "tiêm" HttpClient vào
  getAll(...): Observable<Room[]> { return this.http.get<Room[]>(this.apiUrl, { params }); }
  create(room): Observable<Room> { return this.http.post<Room>(this.apiUrl, room); }
  ...
}
```
Rồi component chỉ cần khai báo trong constructor để nhận instance, **không tự `new RoomService()`**:
```ts
constructor(private roomService: RoomService, private rtService: RoomTypeService) {}
```
→ Đây chính là DI: Angular đọc "hồ sơ" (`@Injectable`) và tự lo việc khởi tạo/truyền vào, component không cần biết `RoomService` được tạo ra sao.

Tại sao tách Service thay vì gọi HTTP thẳng trong component? Vì nhiều component dùng chung 1 logic gọi API (ví dụ cả `room-list`, `room-form`, `dashboard` đều cần `RoomService.getAll()`) — viết 1 lần, dùng nhiều nơi.

---

## 10. 2.10_Making HTTP Calls in Angular.pdf — HttpClient

**Lý thuyết:** `HttpClient` là module chuẩn của Angular để gọi REST API, trả về `Observable` (RxJS), phải `.subscribe()` mới thực sự thực thi request.

**Dùng ở đâu:**
- Đăng ký: [`app.config.ts`](frontend/src/app/app.config.ts) → `provideHttpClient(withInterceptors([authInterceptor]))`
- Gọi API: mọi service trong `services/` (xem mục 9)
- Interceptor: [`interceptors/auth.interceptor.ts`](frontend/src/app/interceptors/auth.interceptor.ts)

**Luồng hoạt động đầy đủ 1 request** (ví dụ tải danh sách phòng):
```
RoomListComponent.ngOnInit()
  → this.roomService.getAll().subscribe(data => this.rooms = data)
        → RoomService.getAll() gọi http.get(`${apiUrl}/rooms`)
              → authInterceptor chặn request TRƯỚC khi gửi đi:
                    * đọc token từ localStorage
                    * clone request, gắn header "Authorization: Bearer <token>"
              → request thật sự bay tới backend: GET http://localhost:5000/api/rooms
              → backend trả JSON → response chạy ngược qua interceptor
                    * nếu status 401 (token hết hạn) → interceptor tự xóa token, redirect '/login'
              → subscribe() nhận data → gán this.rooms = data → template *ngFor tự render lại
```
[`interceptors/auth.interceptor.ts`](frontend/src/app/interceptors/auth.interceptor.ts) là nơi đáng chú ý nhất — nó là 1 hàm chặn **tất cả** request HTTP đi ra, tránh phải lặp lại code gắn token ở từng service:
```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const cloned = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(cloned).pipe(catchError(err => {
    if (err.status === 401) { /* xóa session, điều hướng về /login */ }
    return throwError(() => err);
  }));
};
```

---

## 11. 2.11_Routing in Angular.pdf — Routing

**Lý thuyết:** Router ánh xạ URL → Component, hỗ trợ route param (`:id`), query param, và **Guard** (chặn truy cập nếu chưa đủ điều kiện).

**Dùng ở đâu:** [`app.routes.ts`](frontend/src/app/app.routes.ts), [`guards/auth.guard.ts`](frontend/src/app/guards/auth.guard.ts), [`guards/admin.guard.ts`](frontend/src/app/guards/admin.guard.ts).

**Luồng hoạt động:**
```ts
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'rooms', component: RoomListComponent, canActivate: [authGuard, adminGuard] },
  { path: 'rooms/edit/:id', component: RoomFormComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: '' }   // route không khớp → về trang chủ
];
```
- **`:id`** trong `rooms/edit/:id` là route param — đọc bằng `ActivatedRoute` (xem mục 8).
- **`canActivate: [authGuard, adminGuard]`** — trước khi Router thực sự render component, nó chạy lần lượt từng guard:
  ```ts
  export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    if (auth.isLoggedIn()) return true;      // cho vào
    router.navigate(['/login']); return false; // chặn, đá về login
  };
  ```
  `authGuard` kiểm tra đã đăng nhập chưa, `adminGuard` kiểm tra thêm role (chỉ admin/staff mới vào được `/rooms`, `/customers`...). 2 guard xếp thành mảng chạy tuần tự — bất kỳ guard nào trả `false` sẽ chặn ngay.
- **Điều hướng chủ động trong code**: `router.navigate(['/rooms'])` (sau khi lưu form thành công), hoặc qua template: `<a routerLink="/rooms/edit/[room.id]">`.
- **`routerLinkActive="active"`** trong [`navbar.component.html`](frontend/src/app/components/navbar/navbar.component.html) — tự thêm class `active` vào link đang khớp URL hiện tại, để tô sáng menu đang chọn.

---

## 12. 2.12_Pipes.pdf — Pipes

**Lý thuyết:** Pipe biến đổi giá trị hiển thị trong template mà **không** thay đổi dữ liệu gốc, cú pháp `{{ value | pipeName:arg }}`.

**Dùng ở đâu:**
- **Pipe có sẵn của Angular:**
  - `number` — [`room-list.component.ts:105`](frontend/src/app/components/room-list/room-list.component.ts) `{{ room.price | number:'1.0-0' }}₫` → định dạng số có dấu phân cách hàng nghìn, 0 chữ số thập phân.
  - `async` — `navbar.component.html:67` `{{ (auth.currentUser$ | async)?.name }}` → tự `subscribe`/`unsubscribe` Observable, không cần gọi thủ công (liên hệ mục 8).
- **Custom Pipes tự viết** — [`frontend/src/app/pipes/`](frontend/src/app/pipes/): `vn-date.pipe.ts`, `room-status.pipe.ts`, `booking-status.pipe.ts`, `payment-status.pipe.ts`.

**Luồng hoạt động — [`vn-date.pipe.ts`](frontend/src/app/pipes/vn-date.pipe.ts):**
```ts
@Pipe({ name: 'vnDate', standalone: true })
export class VnDatePipe implements PipeTransform {
  transform(value, mode: 'date'|'time'|'full' = 'date'): string {
    if (!value) return '';
    if (mode === 'time') return formatVNDateTime(value);
    return formatVNDate(value);
  }
}
```
Dùng trong `booking-form.component.ts`: `{{ item.checkInDate | vnDate }}` → chuỗi ngày ISO (`2026-08-23`) từ backend được pipe biến thành định dạng Việt Nam dễ đọc, chỉ ở **lớp hiển thị**, biến `item.checkInDate` gốc không đổi.

**`room-status.pipe.ts`** đáng chú ý vì nó vừa là Pipe, vừa export sẵn 1 `Map` dùng lại được ở nơi khác:
```ts
export const ROOM_STATUS_MAP = { available: {label:'Còn trống', icon:'🟢'}, ... };
@Pipe({ name: 'roomStatus', standalone: true })
export class RoomStatusPipe implements PipeTransform {
  transform(status, field: 'label'|'icon' = 'label') { return ROOM_STATUS_MAP[status]?.[field] ?? status; }
}
```
`room-list.component.ts` không dùng `| roomStatus` trong template mà gọi thẳng hàm `getRoomStatusLabel()` tra cứu `ROOM_STATUS_MAP` — tức là **cùng 1 nguồn dữ liệu** (`ROOM_STATUS_MAP`) được dùng lại theo 2 cách (pipe trong template, hoặc hàm TS) tùy component nào tiện hơn.

---

## 13. 2.13_Material.pdf — Angular Material

**Lý thuyết:** Bộ UI component có sẵn (button, table, dialog, form field...) theo chuẩn Material Design của Google.

**Dùng ở đâu trong dự án:** ❌ **Không có.** Kiểm tra `package.json` không có `@angular/material`, và không có `MatButtonModule`/`MatTableModule`... nào được import. Toàn bộ giao diện Aurora Resort được **tự viết bằng SCSS thuần** (mỗi component có file `.scss` riêng, ví dụ `room-list.component.scss`), theo phong cách "luxury hotel" tùy chỉnh (biến CSS như `var(--gold)` thấy trong `app.component.ts`) — không dùng bộ component dựng sẵn nào.

Đây là lựa chọn thiết kế hợp lý cho đồ án cần giao diện riêng biệt/đẹp mắt, nhưng nếu slide 2.13 yêu cầu demo Angular Material, bạn cần làm ở **project/bài tập riêng**, không có trong repo này.

---

## 14. 3_API NestJS.pdf & 06_Web_API.pdf — thực tế là ASP.NET Core Web API

**Điểm cần lưu ý:** file PDF tên "3_API Nest JS.pdf" gợi ý học NestJS (Node.js framework), nhưng **backend thật của dự án bạn không phải NestJS** — nó là **ASP.NET Core Web API viết bằng C#**. Về mặt khái niệm (Controller, DTO, Service, Dependency Injection, Middleware, Route decorator...) 2 framework này **rất giống nhau** — nên kiến thức trong slide NestJS hoàn toàn dùng để hiểu code backend hiện tại, chỉ khác cú pháp ngôn ngữ. Nội dung "06_Web_API.pdf" (khái niệm REST API nói chung) khớp chính xác với những gì backend này làm.

**Cấu trúc thư mục backend** ([`backend/`](backend/)):
```
Program.cs          → điểm khởi động, cấu hình middleware (giống main.ts + app.module.ts của NestJS)
Controllers/         → nhận HTTP request, trả response (giống @Controller trong NestJS)
Services/             → business logic (giống @Injectable Service trong NestJS)
DTOs/AllDtos.cs      → định dạng dữ liệu vào/ra API (giống class DTO trong NestJS)
Models/               → entity ánh xạ bảng database (giống Entity/Schema)
Data/ApplicationDbContext.cs → ORM (Entity Framework Core, giống TypeORM/Prisma)
```

**Luồng 1 request đầy đủ — ví dụ "Tạo phòng mới" (`POST /api/rooms`):**
```
Angular: roomService.create(room) → HttpClient.post('http://localhost:5000/api/rooms', room)
   ↓ (Program.cs: middleware pipeline)
   CORS check (chỉ chấp nhận origin http://localhost:4200) 
   → UseAuthentication (đọc & xác thực JWT token trong header Authorization)
   → UseAuthorization (kiểm tra role)
   ↓
RoomsController.Create(dto)   [backend/Controllers/RoomsController.cs]
   [HttpPost]
   [Authorize(Roles = "admin,staff")]     ← chỉ admin/staff mới gọi được, khớp với adminGuard bên Angular
   public async Task<IActionResult> Create([FromBody] CreateRoomDto dto)
   {
       if (!ValidStatuses.Contains(dto.Status))
           return BadRequest(...);                 // validate input
       var item = await _service.Create(dto);       // giao cho tầng Service xử lý
       return CreatedAtAction(..., item);            // HTTP 201 Created
   }
   ↓
RoomService (backend/Services/RoomService.cs) → dùng ApplicationDbContext (EF Core) → ghi vào SQLite (hotel.db)
   ↓
Trả JSON RoomDto ngược về Angular → roomService.create(...).subscribe(() => router.navigate(['/rooms']))
```

**Xác thực (JWT) — luồng đăng nhập, nối 2 mục 9/10 phía frontend với backend:**
```
LoginComponent.onSubmit()
  → authService.login(email, password)   [POST /api/auth/login]
      ↓
AuthController.Login(dto)  [backend/Controllers/AuthController.cs]
  → AuthService.Login(dto): kiểm tra email/password (BCrypt so khớp hash) → tạo JWT token
  → trả về { token, user }
      ↓
Angular AuthService.setSession(res):
  localStorage.setItem('token', res.token)
  localStorage.setItem('user', JSON.stringify(res.user))
  currentUserSubject.next(res.user)        ← "phát sóng" cho toàn app (mục 8)
      ↓
Từ giờ, MỌI request tiếp theo tự động gắn token nhờ authInterceptor (mục 10)
→ backend UseAuthentication() giải mã token → biết user là ai, role gì
→ [Authorize(Roles="admin")] trên từng endpoint quyết định cho phép hay chặn (403 Forbidden)
```

**DI trong ASP.NET Core** (song song mục 9 bên Angular) — [`Program.cs`](backend/Program.cs):
```csharp
builder.Services.AddScoped<IRoomService, RoomService>();
```
`RoomsController` chỉ khai báo `IRoomService _service` trong constructor, không tự `new RoomService()` — ASP.NET Core tự "tiêm" instance vào, y hệt cơ chế DI của Angular ở mục 9, chỉ khác cú pháp.

**Swagger** (`app.UseSwaggerUI()` trong `Program.cs`) — giao diện test API tự sinh từ code, truy cập tại `http://localhost:5000/swagger` khi chạy backend ở môi trường Development — rất hữu ích để tự test từng endpoint mà không cần Angular.

---

## Tổng kết — bảng đối chiếu nhanh

| # | Chủ đề | Trạng thái trong dự án | File chính |
|---|---|---|---|
| 2.1 | Introduction Angular | ✅ Dùng (standalone, không NgModule) | `app.config.ts`, `main.ts` |
| 2.2 | Component | ✅ 13 component | `components/*` |
| 2.3 | Data Binding | ✅ Cả 4 kiểu | mọi component |
| 2.4 | Directives | ✅ Built-in (`*ngIf`,`*ngFor`) — ❌ chưa có custom directive | `components/*` |
| 2.5 | Forms (template-driven) | ✅ Toàn bộ form | `*-form.component.ts` |
| 2.6 | Template Reference Variables | ❌ Chưa dùng | — |
| 2.7 | Reactive Form | ❌ Chưa dùng | — |
| 2.8 | Sharing Data | ✅ Qua Service (BehaviorSubject) + Router param — ❌ chưa có `@Input`/`@Output` | `auth.service.ts` |
| 2.9 | Services | ✅ 7 service, DI qua constructor | `services/*` |
| 2.10 | HTTP Calls | ✅ HttpClient + Interceptor | `services/*`, `auth.interceptor.ts` |
| 2.11 | Routing | ✅ Route param, query param, 2 Guard | `app.routes.ts`, `guards/*` |
| 2.12 | Pipes | ✅ 4 custom pipe + built-in (`number`, `async`) | `pipes/*` |
| 2.13 | Material | ❌ Không dùng — SCSS tự viết | — |
| 3 | API NestJS | ⚠️ Backend thực tế là ASP.NET Core, không phải NestJS | `backend/*` |
| 06 | Web API | ✅ REST API đầy đủ CRUD + JWT + Swagger | `backend/Controllers`, `Program.cs` |

**Gợi ý học tiếp:** 3 phần "❌ chưa dùng" (Template Reference Variables, Reactive Form, Angular Material) là khoảng trống tốt để luyện tập — thử refactor `room-form.component.ts` hoặc `login.component.ts` sang Reactive Form + thêm `#form="ngForm"` để thấy khác biệt trực tiếp trên chính dự án của bạn.
