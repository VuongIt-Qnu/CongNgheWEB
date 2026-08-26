BÁO CÁO TỔNG HỢP KIẾN THỨC TRỌNG TÂM: PHÁT TRIỂN ỨNG DỤNG WEB HIỆN ĐẠI

1. Tổng quan về Công nghệ Web và Lộ trình Phát triển

Sự tiến hóa của Internet từ những trang văn bản tĩnh đơn giản đến hệ sinh thái ứng dụng phi tập trung minh chứng cho bước tiến vượt bậc của kiến trúc phần mềm. Với tư cách là Kiến trúc sư giải pháp, việc nắm vững mô hình Client-Server là điều kiện tiên quyết. Client (Browser) đóng vai trò giao diện người dùng, gửi yêu cầu HTTP đến Server – nơi xử lý logic nghiệp vụ và truy xuất dữ liệu. Sự phân tách này cho phép hệ thống mở rộng độc lập và tối ưu hóa hiệu suất trên từng môi trường.

Bảng so sánh các thế hệ Web:

Đặc điểm	Web 1.0 (Read-only)	Web 2.0 (Participatory)	Web 3.0 (Semantic/Decentralized)
Vai trò người dùng	Người xem (thụ động)	Người sáng tạo & tương tác	Người sở hữu (phi tập trung)
Công nghệ tiêu biểu	HTML, Tài liệu tĩnh	AJAX, Frameworks, Cloud	AI, Blockchain, Semantic Web
Kiến trúc	Tập trung (Centralized)	Tập trung (Centralized)	Phi tập trung (Decentralized)

Phân tích kỹ thuật:

* Web tĩnh vs. Web động: Web tĩnh (Doc-Centric) dựa trên tệp HTML cố định, ổn định nhưng khó cập nhật. Web động (Interactive/Transactional) sử dụng CGI và cơ sở dữ liệu để tạo nội dung linh hoạt theo yêu cầu.
* Web ngữ nghĩa (Semantic Web): Sử dụng XML, JSON, RDF để giúp máy tính "hiểu" ý nghĩa dữ liệu, cho phép chia sẻ thông tin xuyên suốt các nền tảng khác nhau.

Lớp phân tích "So What?": Xu hướng dịch chuyển sang Web 3.0 giúp loại bỏ các bên trung gian, tăng cường bảo mật thông qua Blockchain. Đối với doanh nghiệp, việc lựa chọn đúng Framework (như Angular cho ứng dụng quy mô lớn hoặc React cho tính linh hoạt) sẽ quyết định khả năng bảo trì và tốc độ mở rộng của sản phẩm trong dài hạn.

Kết nối: Để xây dựng bất kỳ ứng dụng Web nào, chúng ta phải bắt đầu với nền móng cơ bản nhất: HTML.

2. Nền tảng HTML và Cấu trúc Tài liệu Web

HTML (HyperText Markup Language) là ngôn ngữ đánh dấu được sử dụng để định hình "khung xương" của trang web. Việc sử dụng HTML đúng ngữ nghĩa (Semantic HTML) là yếu tố sống còn để trình duyệt và các công cụ hỗ trợ tiếp cận (Accessibility) có thể hiểu đúng cấu trúc tài liệu.

Cấu trúc bắt buộc của HTML5:

1. <!DOCTYPE html>: Khai báo kiểu tài liệu tiêu chuẩn.
2. <html>: Phần tử gốc chứa toàn bộ nội dung.
3. <head>: Chứa Metadata, tiêu đề, và liên kết tài nguyên ngoài.
4. <body>: Chứa nội dung hiển thị cho người dùng.

Hệ thống nhóm thẻ và thuộc tính:

* Phân loại: Thẻ định dạng (<h1>-<h6>, <p>), danh sách (<ul>, <li>), bảng (<table>, <tr>, <td>), và form (<input>, <button>).
* Thuộc tính điều khiển nâng cao: tabindex (điều hướng phím Tab), accesskey (phím tắt), và disabled (vô hiệu hóa phần tử).

Lớp phân tích "So What?": Một cấu trúc HTML chuẩn xác không chỉ hỗ trợ SEO hiệu quả, giúp robot tìm kiếm lập chỉ mục tốt hơn, mà còn là nền tảng để triển khai các giải pháp Web Accessible, mở rộng tệp người dùng tiềm năng bao gồm cả người khuyết tật.

Kết nối: HTML định nghĩa cấu trúc nội dung, nhưng để biến "khung xương" này thành một giao diện chuyên nghiệp, chúng ta cần đến sức mạnh định dạng của CSS.

3. CSS - Định dạng và Ngôn ngữ Thiết kế Giao diện

Chiến lược tách biệt nội dung (HTML) và định dạng (CSS) giúp tăng khả năng bảo trì mã nguồn. CSS cho phép chúng ta kiểm soát toàn diện diện mạo trang web từ màu sắc, phông chữ đến bố cục phức tạp.

Phương thức triển khai và Độ ưu tiên:

1. External (Thẻ <link>): Tốt nhất cho việc tái sử dụng trên nhiều trang.
2. Internal (Thẻ <style>): Dùng cho riêng một trang cụ thể.
3. Inline (Thuộc tính style): Độ ưu tiên cao nhất, dùng cho các trường hợp đặc biệt.

* Quy tắc ưu tiên: External < Internal < Inline.

Các khái niệm cốt lõi:

* Selectors: Element (thẻ), ID (#), Class (.), và Pseudo-class (:hover, :active, :visited).
* Box Model: Gồm Content (Nội dung) -> Padding (Khoảng đệm) -> Border (Viền) -> Margin (Lề).
* Thuộc tính nâng cao: border-radius (bo góc), box-shadow (đổ bóng), opacity (trong suốt), background-size.

Lớp phân tích "So What?": Việc nắm vững các thuộc tính position (fixed, absolute, relative) và float là chìa khóa để xây dựng giao diện phản hồi (Responsive). Từ góc độ kiến trúc, điều này giúp tối ưu hóa trải nghiệm người dùng (UX) trên mọi thiết bị mà không cần phát triển các phiên bản code riêng biệt.

Kết nối: Khi đã có giao diện tĩnh hoàn chỉnh, Angular sẽ giúp chúng ta chuyển đổi nó thành một ứng dụng đơn trang (SPA) mạnh mẽ.

4. Giới thiệu Angular và Kiến trúc MVC

Angular là một framework mã nguồn mở dựa trên TypeScript, được thiết kế để xây dựng các ứng dụng đơn trang (SPA) phức tạp với trải nghiệm mượt mà như ứng dụng Desktop.

Kiến trúc và Luồng hoạt động:

* Flow dự án: Trình duyệt tải index.html. Tệp main.ts khởi tạo và bootstrap AppModule, từ đó kích hoạt Root Component (app-root).
* TypeScript: Ngôn ngữ cung cấp kiểu dữ liệu chặt chẽ (Strong Typing), giúp giảm thiểu lỗi trong quá trình phát triển. Mã TypeScript sẽ được biên dịch (compile) sang JavaScript để trình duyệt có thể thực thi.
* Mô hình MVC: Angular tách biệt ứng dụng thành Model (Dữ liệu), View (Template HTML), và Controller (Class Component xử lý logic).

Lớp phân tích "So What?": Angular CLI (ng new, ng serve) không chỉ là công cụ dòng lệnh mà là một bộ tiêu chuẩn hóa quy trình. Nó giúp các đội ngũ phát triển lớn duy trì một cấu trúc dự án thống nhất, dễ dàng kiểm thử và triển khai tự động.

Kết nối: Thành phần cốt yếu nhất trong kiến trúc Angular chính là các Component.

5. Thành phần Component và Metadata trong Angular

Component là khối xây dựng cơ bản, đại diện cho một phần của giao diện người dùng và chứa đựng logic tương tác riêng biệt.

Cấu trúc 3 phần của Component:

1. HTML Template: Định nghĩa những gì người dùng thấy. Có thể dùng templateUrl (tệp rời) hoặc template (inline).
2. Component Class: Viết bằng TypeScript, chứa dữ liệu và phương thức.
3. Metadata: Sử dụng decorator @Component để định nghĩa selector (Tag, Class hoặc Attribute), styles và template.

Lifecycle Hooks (Vòng đời):

* OnInit: Khởi tạo dữ liệu sau khi component được tạo.
* OnDestroy: Dọn dẹp tài nguyên (unsubscribing, timers) trước khi component bị hủy.

Lớp phân tích "So What?": Quản lý Lifecycle Hooks là yếu tố sống còn để tối ưu hóa bộ nhớ. Việc bỏ sót xử lý trong OnDestroy có thể dẫn đến hiện tượng rò rỉ bộ nhớ (memory leak), làm giảm hiệu năng hệ thống theo thời gian.

Kết nối: Để dữ liệu từ Class hiển thị lên View, chúng ta sử dụng cơ chế Data Binding.

6. Cơ chế Data Binding trong Angular

Data Binding là kỹ thuật đồng bộ hóa dữ liệu giữa Component Class và Template HTML, giúp giao diện phản ứng ngay lập tức với sự thay đổi của dữ liệu.

Hệ thống 4 loại Binding:

* Interpolation {{value}}: Hiển thị giá trị từ Class lên View (một chiều).
* Property Binding [property]="value": Gán giá trị cho thuộc tính HTML (ví dụ: [disabled]="isInvalid").
* Event Binding (event)="handler()": Lắng nghe tương tác từ người dùng (ví dụ: (click)="toggleFavorite()").
* Two-way Binding [(ngModel)]="value": Đồng bộ hai chiều, thường dùng trong các form nhập liệu.

Ví dụ thực tế (Quản lý chứng khoán): Sử dụng một model Stock để quản lý thông tin tập trung thay vì các biến rời rạc:

this.stock = new Stock('Test Stock', 'TSC', 85, 80);


Trong HTML: <div class="name">{{stock.name}} ({{stock.code}})</div>

Lớp phân tích "So What?": Two-way binding (ngModel) giúp giảm thiểu đáng kể lượng code boilerplate. Trong các hệ thống giao dịch chứng khoán thời gian thực, cơ chế này đảm bảo dữ liệu hiển thị và dữ liệu xử lý luôn khớp nhau tuyệt đối.

Kết nối: Ngoài việc gắn kết dữ liệu, chúng ta cần thay đổi cấu trúc và diện mạo DOM một cách linh hoạt bằng Directives.

7. Directives - Điều khiển Cấu trúc và Thuộc tính DOM

Directives cho phép chúng ta mở rộng khả năng của HTML, điều khiển việc hiển thị các phần tử dựa trên logic nghiệp vụ.

Phân loại Directives:

1. Structural Directives (*): Thay đổi cấu trúc DOM.
  * *ngIf: Thêm hoặc xóa phần tử.
  * *ngFor="let stock of stocks; index as i": Lặp danh sách.
2. Attribute Directives: Thay đổi diện mạo/hành vi phần tử.
  * ngClass: Thêm/xóa nhiều CSS class dựa trên đối tượng logic.
  * ngStyle: Gán style trực tiếp (ví dụ: color: stock.price > 80 ? 'green' : 'red').

Ứng dụng thực tế: Hiển thị màu xanh khi giá cổ phiếu tăng và màu đỏ khi giảm thông qua ngClass:

<div [ngClass]="{'positive': stock.isPositive(), 'negative': !stock.isPositive()}">


Lớp phân tích "So What?": Các Structural Directives như *ngIf thực sự xóa bỏ phần tử khỏi DOM thay vì chỉ ẩn đi (display:none), điều này giúp trình duyệt giảm tải việc render và cải thiện đáng kể tốc độ phản hồi của ứng dụng phức tạp.

Kết nối: Khi dữ liệu đã được hiển thị, chúng ta cần định dạng chúng sao cho thân thiện với người dùng bằng Pipes.

8. Pipes - Biến đổi và Trình bày Dữ liệu

Pipes là các hàm đơn giản dùng trong template để biến đổi dữ liệu đầu vào thành định dạng hiển thị mong muốn mà không thay đổi giá trị gốc.

Các Pipe phổ biến và Cú pháp:

* Built-in Pipes: DatePipe, UpperCasePipe, JsonPipe, CurrencyPipe.
* Tham số: {{ birthday | date:'dd/MM/yyyy' }}.
* Chaining (Chuỗi Pipe): {{ stock.name | uppercase | json }}. Lưu ý: Thứ tự rất quan trọng để tránh lỗi kiểu dữ liệu (ví dụ: không thể dùng UpperCase sau Json).

Lớp phân tích "So What?": AsyncPipe là công cụ quan trọng nhất trong việc xử lý luồng dữ liệu bất đồng bộ. Nó tự động quản lý việc subscribe và unsubscribe các Observable, giúp ngăn ngừa rò rỉ bộ nhớ một cách tự động và triệt để.

Kết nối: Pipes và Directives là tiền đề để chúng ta xây dựng các giao diện nhập liệu phức tạp như Forms.

9. Template-Driven Forms trong Angular

Đây là phương pháp xây dựng form dựa chủ yếu trên template HTML, phù hợp cho các form đơn giản như Login hoặc Contact.

Đặc điểm kỹ thuật:

* Yêu cầu import FormsModule trong AppModule.
* Sử dụng ngModel để liên kết dữ liệu và #formName="ngForm" để tham chiếu trạng thái form.
* Trạng thái Control: touched/untouched (đã chạm), dirty/pristine (đã sửa đổi), valid/invalid (hợp lệ).
* Validators: required, minlength, email.

Lớp phân tích "So What?": Angular tự động gán các CSS class như .ng-invalid hay .ng-dirty. Từ góc độ UX, chúng ta có thể lợi dụng điều này để đổi màu viền input sang đỏ ngay lập tức khi người dùng nhập sai, tạo ra phản hồi tức thì mà không cần viết code logic phức tạp.

Kết nối: Với các form có logic phức tạp hoặc cần kiểm thử sâu, chúng ta cần đến Reactive Forms.

10. Reactive Forms - Quản lý Form dựa trên Model

Reactive Forms quản lý cấu trúc form trong Component Class, cung cấp khả năng kiểm soát dữ liệu chặt chẽ và dễ dàng kiểm thử đơn vị (Unit Test).

Bộ ba cốt lõi:

1. FormControl: Quản lý giá trị và trạng thái của một ô nhập liệu đơn lẻ.
2. FormGroup: Nhóm các FormControl (ví dụ: một form đăng ký).
3. FormBuilder: Dịch vụ giúp khởi tạo FormGroup/FormControl với cú pháp ngắn gọn hơn.

Cập nhật dữ liệu:

* setValue(): Yêu cầu cập nhật chính xác mọi field trong form.
* patchValue(): Chỉ cập nhật một vài field nhất định.

Lớp phân tích "So What?": Sự khác biệt triệt để nằm ở triết lý: Template-driven là bất đồng bộ (tĩnh), trong khi Reactive là đồng bộ (luồng dữ liệu). Reactive Forms là lựa chọn bắt buộc cho các dự án doanh nghiệp lớn nhờ khả năng xử lý động các trường nhập liệu.

Kết nối: Để tương tác nhanh với các phần tử trong template mà không cần qua Class, chúng ta sử dụng biến tham chiếu.

11. Template Reference Variables (Biến tham chiếu Template)

Biến tham chiếu sử dụng ký hiệu # để đặt tên cho một phần tử DOM hoặc một directive, cho phép truy cập nó từ bất kỳ đâu trong template.

Ứng dụng và Phạm vi:

* Cú pháp: <input #stockCode placeholder="Code"> -> <button (click)="check(stockCode.value)">.
* Gán giá trị từ Directive: #f="ngForm".
* Phạm vi: Chỉ tồn tại trong template hiện tại. Các chỉ thị như *ngIf tạo ra phạm vi con, khiến biến bên trong không thể truy cập từ bên ngoài.

Lớp phân tích "So What?": Biến tham chiếu giúp mã nguồn template gọn gàng hơn, cho phép xử lý nhanh các tương tác đơn giản ngay tại View mà không cần tạo các biến trung gian trong Component Class, giúp giảm bớt sự phụ thuộc không cần thiết.

Kết nối: Khi ứng dụng lớn dần, việc chia sẻ dữ liệu giữa các Component trở nên cực kỳ quan trọng.

12. Chia sẻ dữ liệu giữa các Component

Trong kiến trúc Component-Tree, việc trao đổi thông tin giữa các cấp là bắt buộc để duy trì tính nhất quán của dữ liệu.

Cơ chế giao tiếp:

* Parent-to-Child: Dùng @Input() để truyền dữ liệu từ cha xuống con.
* Child-to-Parent: Dùng @Output() và EventEmitter để bắn sự kiện từ con lên cha.
* @ViewChild: Cho phép cha truy cập trực tiếp vào thuộc tính/phương thức công khai của con.
* Service: Phương án tối ưu để chia sẻ dữ liệu giữa các component không có quan hệ trực tiếp (anh em, họ hàng).

Lớp phân tích "So What?": Là một kiến trúc sư, bạn nên ưu tiên Input/Output cho các quan hệ chặt chẽ để đảm bảo tính đóng gói. Tuy nhiên, nếu dữ liệu cần chia sẻ toàn cục (như thông tin User), Service là giải pháp để tránh tình trạng "Prop Drilling" cực đoan.

Kết nối: Để hiện thực hóa việc chia sẻ dữ liệu qua Service, chúng ta cần hiểu về Dependency Injection.

13. Angular Services và Dependency Injection (DI)

Services đóng vai trò là nơi chứa logic nghiệp vụ dùng chung, trong khi DI là cơ chế cung cấp các instance của service đó cho các thành phần cần đến.

Quy trình triển khai:

1. Định nghĩa: Tạo class với decorator @Injectable().
2. Đăng ký Provider: Tại AppModule (toàn cục) hoặc tại Component (instance riêng).
3. Injection: Khai báo trong constructor(private stockService: StockService).

Lớp phân tích "So What?": Triết lý Singleton của Service giúp tiết kiệm tài nguyên và đồng bộ trạng thái. Hệ thống DI phân cấp (Hierarchical DI) cho phép chúng ta kiểm soát phạm vi tác động của service, đảm bảo tính tách biệt (Separation of Concerns) giữa logic xử lý và logic hiển thị.

Kết nối: Service thường kết hợp với RxJS để xử lý các luồng dữ liệu bất đồng bộ từ máy chủ.

14. Lập trình bất đồng bộ với Observables và RxJS

RxJS là thư viện mạnh mẽ để xử lý các sự kiện bất đồng bộ dưới dạng luồng dữ liệu (Streams).

Thành phần cốt lõi:

* Observable: Luồng phát ra dữ liệu.
* Observer/Subscription: Đối tượng lắng nghe dữ liệu.
* Toán tử (Operators): map (biến đổi), switchMap (chuyển đổi luồng), catchError (xử lý lỗi).
* Giả lập dữ liệu: Sử dụng Observable.of(mockData) để trả về dữ liệu tức thì hoặc Observable.throw(error) để giả lập lỗi hệ thống.

Lớp phân tích "So What?": So với Promise chỉ xử lý một giá trị duy nhất, Observable có thể xử lý một luồng giá trị theo thời gian và quan trọng nhất là có thể hủy bỏ (cancelable). Điều này cực kỳ hữu ích khi người dùng thực hiện tìm kiếm liên tục, giúp hủy các request cũ để tiết kiệm băng thông.

Kết nối: Ứng dụng quan trọng nhất của RxJS trong Angular chính là thực hiện các cuộc gọi API qua HttpClient.

15. Kết nối Backend với Angular HttpClient

HttpClient cung cấp một API đơn giản để ứng dụng Angular giao tiếp với các server Back-end thông qua giao thức HTTP.

Chi tiết kỹ thuật:

* Cấu hình: Sử dụng Headers cho Authorization và Params cho truy vấn URL.
* Tùy chọn observe: body (mặc định), response (lấy đủ headers/status), events (theo dõi tiến trình).
* Tùy chọn responseType: json, text, blob, arraybuffer.
* Proxy: Sử dụng tệp proxy.conf.json để chuyển hướng yêu cầu trong môi trường dev, giải quyết triệt để vấn đề CORS.

Lớp phân tích "So What?": Việc sử dụng Typed Response (http.get<Stock[]>(...)) giúp tận dụng tối đa sức mạnh của TypeScript, đảm bảo tính an toàn về kiểu dữ liệu ngay từ tầng kết nối, giảm thiểu các lỗi runtime phổ biến khi làm việc với API.

Kết nối: Sau khi đã có dữ liệu, chúng ta cần tổ chức điều hướng người dùng giữa các trang bằng Router.

16. Điều hướng và Định tuyến (Angular Routing)

Angular Router cho phép định nghĩa các đường dẫn (paths) để chuyển đổi giữa các view mà không cần tải lại trang, tạo ra trải nghiệm SPA hoàn hảo.

Thành phần cấu hình:

* Routes Array: Định nghĩa cặp { path: 'stock/:code', component: StockDetailsComponent }.
* Directives: <router-outlet> (nơi hiển thị), routerLink (thay cho href), routerLinkActive.
* Truy xuất tham số: Dùng ActivatedRoute.snapshot.paramMap.get('code') cho tham số bắt buộc và queryParams cho tham số tùy chọn (như trang: ?page=1).
* Điều hướng: Dùng router.navigate(['stocks', 'list']) trong logic code.
* Wildcard (**): Chuyển hướng các URL không tồn tại về trang 404 hoặc Home.

Lớp phân tích "So What?": Quản lý trạng thái Route cho phép ứng dụng hỗ trợ các tính năng trình duyệt cơ bản như Back/Forward và Bookmark – những yếu tố tưởng chừng đơn giản nhưng lại cực kỳ quan trọng đối với SEO và trải nghiệm người dùng cuối.

Kết nối: Để ứng dụng không chỉ mạnh mẽ mà còn đẹp mắt, chúng ta tích hợp Angular Material.

17. Thiết kế giao diện hiện đại với Angular Material

Angular Material là bộ thư viện UI components dựa trên ngôn ngữ thiết kế Material Design của Google, đảm bảo tính thẩm mỹ và nhất quán cao.

Tính năng nổi bật:

* Cài đặt: ng add @angular/material để tự động cấu hình theme và font.
* Components: MatToolbar, MatIcon, MatSlideToggle, MatMenu.
* Menu động: Khởi tạo danh sách menu từ một mảng MatMenuListItem (chứa text, icon, isDisabled).
* Truy cập Programmatic: Sử dụng @ViewChild(MatMenuTrigger) để mở menu thông qua code thay vì click chuột.

Lớp phân tích "So What?": Sử dụng các thư viện chuẩn như Material giúp rút ngắn 50-70% thời gian thiết kế giao diện. Tuy nhiên, kiến trúc sư cần cân đối việc tùy chỉnh (customization) để tránh làm ứng dụng trở nên nặng nề và mất đi bản sắc thương hiệu.

Kết nối: Từ phía giao diện (Front-end), chúng ta chuyển sang xây dựng hệ thống cung cấp dữ liệu (Back-end) thông qua Web API.

18. Kiến trúc Web API và tiêu chuẩn REST

Web API là giao diện lập trình ứng dụng trên nền Web, đóng vai trò cầu nối dữ liệu giữa các hệ thống khác nhau.

Tiêu chuẩn RESTful:

* Stateless: Mỗi request phải chứa đủ thông tin để server hiểu mà không cần lưu session.
* HTTP Verbs & CRUD: GET (Read), POST (Create), PUT/PATCH (Update), DELETE (Delete).
* Idempotency: Các phương thức như GET, PUT, DELETE phải đảm bảo khi thực hiện nhiều lần với cùng dữ liệu thì kết quả trên hệ thống không thay đổi (ngoại trừ POST).

Lớp phân tích "So What?": Thiết kế API tuân thủ tính Idempotency là cực kỳ quan trọng trong các hệ thống phân tán. Nó cho phép hệ thống tự động thực hiện lại các yêu cầu thất bại do lỗi mạng mà không lo sợ làm sai lệch dữ liệu (như tạo hóa đơn trùng lặp).

Kết nối: Để hiện thực hóa các tiêu chuẩn REST này một cách chuyên nghiệp, NestJS là framework hàng đầu hiện nay.

19. Xây dựng Server-side chuyên nghiệp với NestJS

NestJS là framework Node.js có kiến trúc chặt chẽ, lấy cảm hứng từ Angular, giúp các nhà phát triển Full-stack dễ dàng tiếp cận.

Thành phần kiến trúc:

* Controller: Tiếp nhận Request và trả về Response.
* Service: Xử lý logic nghiệp vụ và tương tác với Database thông qua Repository.
* DTO (Data Transfer Object): Định nghĩa cấu trúc dữ liệu truyền tải và sử dụng ValidationPipe (class-validator) để làm sạch dữ liệu.
* Kết nối CSDL: Sử dụng TypeOrmModule.forRoot để cấu hình kết nối SQL Server (host, port, username, password).

Lớp phân tích "So What?": NestJS cung cấp kiến trúc "out-of-the-box" mạnh mẽ. Đối với các hệ thống Microservices, khả năng module hóa của NestJS giúp việc chia nhỏ ứng dụng trở nên tự nhiên và dễ quản lý hơn nhiều so với các framework tối giản như Express.

Kết nối: Tầng cuối cùng của hệ thống là quản lý dữ liệu bền vững bằng Entity Framework Core.

20. Quản lý dữ liệu với Entity Framework Core (EF Core)

EF Core là một bộ ánh xạ đối tượng-quan hệ (ORM) cho phép lập trình viên làm việc với cơ sở dữ liệu thông qua các đối tượng .NET, thay thế cho việc viết mã ADO.NET thuần túy.

Hai phương pháp phát triển:

1. Database-First: Dành cho CSDL đã có sẵn. Sử dụng lệnh CLI: Scaffold-DbContext "Connection_String" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Models
2. Code-First: Định nghĩa Model bằng C# trước, sau đó dùng add-migration và update-database để tạo CSDL.

Cơ chế vận hành:

* Change Tracking: EF Core tự động theo dõi các thay đổi trên đối tượng trong bộ nhớ.
* SaveChangesAsync(): Mọi thay đổi chỉ thực sự được ghi xuống CSDL khi hàm này được gọi, đảm bảo tính toàn vẹn dữ liệu trong một transaction.

Lớp phân tích "So What?": ORM giúp loại bỏ các rủi ro bảo mật như SQL Injection và tăng tốc độ phát triển lên nhiều lần. Tuy nhiên, ở vị trí kiến trúc sư, bạn cần giám sát hiệu năng của các truy vấn LINQ phức tạp để đảm bảo hệ thống không bị quá tải khi quy mô dữ liệu lớn dần.

Tổng kết: Hành trình từ HTML/CSS đến Angular và kết thúc tại NestJS/EF Core tạo thành một hệ sinh thái Full-stack hoàn chỉnh, giúp xây dựng những ứng dụng web hiện đại, an toàn và có khả năng mở rộng vượt trội.
