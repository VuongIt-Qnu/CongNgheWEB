# 🏨 Aurora Resort - Hệ thống Quản lý Khách sạn Cao cấp

Dự án này là phiên bản chuyển đổi hoàn chỉnh của **Đồ án 22** từ kiến trúc cũ (Node.js/Express + React/Vite) sang kiến trúc mới hiện đại và hiệu năng cao:
- **Backend**: ASP.NET Core 8.0 Web API & Entity Framework Core (MySQL qua Pomelo.EntityFrameworkCore.MySql).
- **Frontend**: Angular 19 (Standalone Components, SCSS, RxJS).

---

## 📂 Cấu trúc Thư mục

- `backend/`: Mã nguồn ASP.NET Core Web API.
- `frontend/`: Mã nguồn Angular 19.
- Các tài liệu phân tích và hướng dẫn chuyển đổi: `01_PHAN_TICH_DO_AN_22.md` đến `08_HOAN_THIEN_DEMO_BAO_VE.md`.

---

## 🛠️ Yêu cầu Hệ thống

1. **.NET SDK 8.0** trở lên.
2. **Node.js** v22.20.0 trở lên.
3. **Angular CLI** (được tự động chạy thông qua `npx`).
4. **MySQL Server** (khuyến nghị: [XAMPP](https://www.apachefriends.org/) — có sẵn MySQL/MariaDB + phpMyAdmin).

---

## 🐬 Cài đặt Database (MySQL)

1. Cài **XAMPP**, mở XAMPP Control Panel, bấm **Start** ở dòng **MySQL** (không cần Apache).
2. Tạo database rỗng tên `aurora_resort`:
   - Cách 1 — phpMyAdmin: mở [http://localhost/phpmyadmin](http://localhost/phpmyadmin) → tab **Databases** → gõ tên `aurora_resort` → **Create**.
   - Cách 2 — dòng lệnh: `mysql -u root -e "CREATE DATABASE aurora_resort;"` (thư mục `xampp/mysql/bin`).
3. Kiểm tra `backend/appsettings.json` khớp với cấu hình MySQL của bạn:
   ```json
   "DefaultConnection": "Server=localhost;Port=3306;Database=aurora_resort;User=root;Password=;"
   ```
   XAMPP mặc định user `root` không có mật khẩu. Nếu bạn đã đặt mật khẩu khác, sửa `Password=...` cho khớp.
4. Nếu server thật của bạn là **MariaDB** (nhiều bản XAMPP mới bundle MariaDB thay vì MySQL) với version khác `8.0.30`, sửa dòng cấu hình version trong `backend/Program.cs`:
   ```csharp
   // Kiểm tra version thật bằng lệnh SQL: SELECT VERSION();
   options.UseMySql(connectionString, new MariaDbServerVersion(new Version(10, 4, 32)))
   ```

---

## 🚀 Hướng dẫn Chạy Dự án

### 1. Chạy Backend (ASP.NET Core Web API)
Đảm bảo MySQL đã chạy (xem mục trên), sau đó vào thư mục `backend` và khởi chạy server:
```bash
cd backend
dotnet run
```
- Server sẽ chạy trên địa chỉ: [http://localhost:5000](http://localhost:5000)
- Swagger UI (tài liệu API): [http://localhost:5000/swagger](http://localhost:5000/swagger)
- Các bảng + dữ liệu mẫu sẽ tự động được tạo trong database `aurora_resort` khi ứng dụng khởi chạy lần đầu tiên (qua EF Core Migrations — `Database.Migrate()`).

> ⚠️ Nếu gặp lỗi kết nối khi `dotnet run`, kiểm tra: (1) MySQL trong XAMPP đã **Start** chưa, (2) database `aurora_resort` đã được tạo chưa, (3) connection string trong `appsettings.json` đúng chưa.

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
