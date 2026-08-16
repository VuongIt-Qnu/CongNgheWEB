# 🏨 Aurora Resort - Hệ thống Quản lý Khách sạn Cao cấp

Dự án này là phiên bản chuyển đổi hoàn chỉnh của **Đồ án 22** từ kiến trúc cũ (Node.js/Express + React/Vite) sang kiến trúc mới hiện đại và hiệu năng cao:
- **Backend**: ASP.NET Core 9.0 Web API & Entity Framework Core (SQLite).
- **Frontend**: Angular 19 (Standalone Components, SCSS, RxJS).

---

## 📂 Cấu trúc Thư mục

- `backend/`: Mã nguồn ASP.NET Core Web API.
- `frontend/`: Mã nguồn Angular 19.
- Các tài liệu phân tích và hướng dẫn chuyển đổi: `01_PHAN_TICH_DO_AN_22.md` đến `08_HOAN_THIEN_DEMO_BAO_VE.md`.

---

## 🛠️ Yêu cầu Hệ thống

1. **.NET SDK 9.0** trở lên.
2. **Node.js** v22.20.0 trở lên.
3. **Angular CLI** (được tự động chạy thông qua `npx`).

---

## 🚀 Hướng dẫn Chạy Dự án

### 1. Chạy Backend (ASP.NET Core Web API)
Vào thư mục `backend` và khởi chạy server:
```bash
cd backend
dotnet run
```
- Server sẽ chạy trên địa chỉ: [http://localhost:5000](http://localhost:5000)
- Swagger UI (tài liệu API): [http://localhost:5000/swagger](http://localhost:5000/swagger)
- Cơ sở dữ liệu SQLite (`hotel.db`) sẽ tự động được tạo và seed dữ liệu mẫu khi ứng dụng khởi chạy lần đầu tiên.

### 2. Chạy Frontend (Angular)
Mở một terminal mới, chuyển vào thư mục `frontend`, cài đặt dependencies và chạy dev server:
```bash
cd frontend
npm start
```
- Ứng dụng sẽ chạy tại địa chỉ: [http://localhost:4200](http://localhost:4200)

---

## 🔑 Tài khoản Đăng nhập Hệ thống

Để đăng nhập vào trang quản trị (Dashboard) và sử dụng đầy đủ tính năng CRUD:
- **Email**: `admin@example.com`
- **Mật khẩu**: `admin123`
- **Quyền hạn**: `admin`
