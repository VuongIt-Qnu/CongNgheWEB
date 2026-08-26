Đề xuất cấu trúc Bản đồ Kiến thức 20 Bài giảng
Phần 1: Nền tảng Web & Front-end cơ bản (4 file)
1_Tổng quan.pdf: Sự phát triển Web (1.0, 2.0, 3.0); Mô hình Web tĩnh/động; Phân biệt Front-end vs Back-end; Khái niệm UI vs UX
.
HTML.pdf: Cấu trúc file HTML; Các thẻ văn bản, định dạng, danh sách, bảng, hình ảnh, liên kết <a>, khung <iframe>; Thẻ khối <div> vs thẻ dòng <span>; Form & các phần tử nhập liệu (input, textarea, select, button)
.
CSS.pdf: Cú pháp Selector (Tag, Class, ID, Pseudo-class); 3 cách chèn CSS (External, Internal, Inline) và độ ưu tiên; Box Model (Margin, Border, Padding); Positioning (Float, Display, Absolute/Fixed/Relative); CSS nâng cao (Border-radius, Shadow, Opacity, Attribute Selector)
.
Javascript.pdf: Khai báo biến (var), kiểu dữ liệu; Đối tượng cốt lõi (String, Math, Date); Đối tượng trình duyệt (Window, Location, History, Document); Xử lý sự kiện (onClick, onChange, onFocus, onMouseOver...); Kỹ thuật AJAX & XMLHttpRequest
.
Phần 2: Lập trình Angular Căn bản (9 file)
2.1_Introduction Angular.pdf: Kiến trúc MVC & Component-Service; Cài đặt Node, NPM, Angular CLI; Cấu trúc thư mục dự án
.
2.2_Component.pdf: Cấu trúc Component (Template + Class + Metadata); Lệnh CLI ng g component; Cơ chế hoạt động của Selector; Cách nhúng Template & Styles (Inline vs Linked); Vòng đời Component (Lifecycle Hooks)
.
2.3_DataBinding.pdf: Một chiều từ Component -> View (Interpolation {{}}, Property Binding []); Một chiều từ View -> Component (Event Binding ()); Hai chiều (Two-way Binding [()]); Sử dụng Model Class để tối ưu dữ liệu
.
2.4_Directives.pdf: Attribute Directives (ngClass, ngStyle, Class/Style binding đơn lẻ); Structural Directives (*ngIf, *ngFor với biến index, ngSwitch)
.
2.5_Forms.pdf: Template-Driven Forms; Khởi tạo bằng ngForm và ngModel; Trạng thái điều khiển (Visited, Changed, Valid) qua CSS class; Thiết lập Form Validation mặc định
.
2.6_Template Reference Variables.pdf: Khai báo biến tham chiếu #var trên DOM element, Directive hoặc Component; Phạm vi sử dụng (Scope) trong cấu trúc template động (*ngIf, *ngFor)
.
2.7_Reactive Form.pdf: FormControl, FormGroup, FormBuilder; Áp dụng Validators động; Đồng bộ dữ liệu qua setValue() và patchValue(); Tạo Getters để rút gọn code template
.
2.8_Sharing Data.pdf: Truyền dữ liệu cha -> con qua @Input(); Truyền dữ liệu con -> cha qua @Output() & EventEmitter; Sử dụng @ViewChild() truy xuất trực tiếp Child Component; Chia sẻ dữ liệu thông qua Angular Service
.
2.9_Services.pdf: Khởi tạo Service với @Injectable(); Đăng ký Service qua providers; Lập trình bất đồng bộ với RxJS Observables (of(), throw(), subscribe()); Kỹ thuật sử dụng Async Pipe (| async) trong template
.
Phần 3: Angular Nâng cao & Tích hợp Hệ thống (4 file)
2.10_Making HTTP Calls in Angular.pdf: HttpClientModule; Sử dụng HttpClient thực hiện các phương thức GET, POST, PATCH; Tùy chỉnh HttpHeaders và Query Params; Điều chỉnh thuộc tính observe và responseType
.
2.11_Routing in Angular.pdf: Cấu hình định tuyến với RouterModule.forRoot; Vùng hiển thị <router-outlet>; Điều hướng qua routerLink và routerLinkActive; Xử lý lỗi với Wildcard (**) và Redirect; Truy xuất tham số URL (Required Route Params & Optional queryParams) qua ActivatedRoute
.
2.12_Pipes.pdf: Khái niệm Pipe; Sử dụng Pipe định dạng dữ liệu (Date, Uppercase...); Truyền tham số cho Pipe (| date: 'dd/MM/yyyy'); Chuỗi Pipe (Chaining Pipes) và lưu ý về kiểu dữ liệu
.
2.13_Material.pdf: Cài đặt Angular Material; Thiết lập slide toggle, toolbar; Xây dựng thanh menu (mat-menu) dạng tĩnh, dạng lồng nhau (Sub-menu), mở menu bằng lập trình (@ViewChild), và tạo menu động từ mảng dữ liệu
.
Phần 4: Kiến trúc Backend API & Truy cập Dữ liệu (3 file)
06_Web_API.pdf: Khái niệm API/Web API; Kiến trúc RESTful (Verbs, Levels, HATEOAS); Định dạng trao đổi dữ liệu (JSON vs XML); So sánh chi tiết giữa SOAP và REST; Giới thiệu ASP.NET Web API và WCF
.
3_API Nest JS.pdf: Hệ sinh thái Node.js Backend; Kiến trúc NestJS (Module @Module, Controller @Controller, Service @Injectable); Xử lý dữ liệu đầu vào với DTO & Validation Pipes; Kết nối SQL Server qua TypeORM (Entity, Repository, Service, Controller)
.
Chapter 6-Data Access.pdf: Công nghệ truy cập dữ liệu (ADO.NET vs ORM); Kiến trúc Entity Framework Core; Database-First (Scaffold-DbContext) vs Code-First (Add-Migration, Update-Database); Thực hiện các thao tác CUD (Create, Update, Delete) và truy vấn dữ liệu bất đồng bộ
.