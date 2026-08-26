using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using backend.Data;
using backend.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Database (MySQL qua Pomelo.EntityFrameworkCore.MySql) ──
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=localhost;Port=3306;Database=aurora_resort;User=root;Password=;TreatTinyAsBoolean=false;";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    // Version cố định (không dùng ServerVersion.AutoDetect()) — AutoDetect bắt buộc kết nối
    // được tới server NGAY khi cấu hình DbContext, kể cả lúc chạy `dotnet ef migrations add`,
    // gây bất tiện khi máy dev chưa bật MySQL. 8.0.30 khớp MySQL Community Server phổ biến hiện nay.
    // ⚠️ Nếu server thật của bạn là MariaDB (XAMPP bản mới thường bundle MariaDB thay vì MySQL),
    //    đổi dòng dưới thành: new MariaDbServerVersion(new Version(10, 4, 32))
    //    (xem đúng version bằng lệnh `SELECT VERSION();` hoặc trong phpMyAdmin).
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 30))));

// ── Services (Dependency Injection) ──
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IRoomTypeService, RoomTypeService>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IServiceService, ServiceService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();

// ── JWT Authentication ──
var jwtKey = builder.Configuration["Jwt:Key"] ?? "aUr0r4_r3s0rt_S3cr3T_2026xK9pMzQ7wB5n";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "AuroraResort",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "AuroraResortApp",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// ── CORS — cho phép Angular gọi API ──
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ── Controllers ──
builder.Services.AddControllers();

// ── Swagger ──
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ── Áp dụng Migrations & Seed Data ──
// Database.Migrate() (thay cho EnsureCreated()) cho phép quản lý phiên bản schema
// qua các file trong Migrations/, hỗ trợ cập nhật schema an toàn khi Model thay đổi sau này.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

// ── Middleware Pipeline ──
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // Production: không lộ stack trace, trả về JSON lỗi gọn gàng.
    app.UseExceptionHandler(errorApp =>
    {
        errorApp.Run(async context =>
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new { message = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau." });
        });
    });
}

app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ── Health Check ──
app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

Console.WriteLine("Server running on http://localhost:5000");
app.Run("http://localhost:5000");
