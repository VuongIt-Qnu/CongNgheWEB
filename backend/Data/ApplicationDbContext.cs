using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<RoomType> RoomTypes { get; set; } = null!;
        public DbSet<Room> Rooms { get; set; } = null!;
        public DbSet<Customer> Customers { get; set; } = null!;
        public DbSet<Booking> Bookings { get; set; } = null!;
        public DbSet<Service> Services { get; set; } = null!;
        public DbSet<Payment> Payments { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique();
            });

            // Room → RoomType
            modelBuilder.Entity<Room>(entity =>
            {
                entity.HasIndex(r => r.RoomNumber).IsUnique();
                entity.HasOne(r => r.RoomType)
                      .WithMany(rt => rt.Rooms)
                      .HasForeignKey(r => r.RoomTypeId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Customer → User
            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasOne(c => c.User)
                      .WithMany()
                      .HasForeignKey(c => c.UserId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // Booking → Customer, Room
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasOne(b => b.Customer)
                      .WithMany(c => c.Bookings)
                      .HasForeignKey(b => b.CustomerId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(b => b.Room)
                      .WithMany(r => r.Bookings)
                      .HasForeignKey(b => b.RoomId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Payment → Booking
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasOne(p => p.Booking)
                      .WithMany(b => b.Payments)
                      .HasForeignKey(p => p.BookingId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ── Seed Data ──

            // Seed Admin User (password: admin123)
            modelBuilder.Entity<User>().HasData(new User
            {
                Id = 1,
                Name = "Admin",
                Email = "admin@example.com",
                Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = "admin",
                IsActive = 1,
                CreatedAt = "2026-01-01 00:00:00"
            });

            // Seed Room Types
            modelBuilder.Entity<RoomType>().HasData(
                new RoomType { Id = 1, Name = "Phòng Tiêu Chuẩn", Description = "Phòng tiêu chuẩn tối giản, đủ tiện nghi cho công tác ngắn." },
                new RoomType { Id = 2, Name = "Phòng Cao Cấp", Description = "Không gian rộng hơn, khu vực làm việc và sofa nhỏ." },
                new RoomType { Id = 3, Name = "Phòng Hướng Biển", Description = "View biển panorama, ban công riêng." },
                new RoomType { Id = 4, Name = "Phòng Suite Sang Trọng", Description = "Suite phòng khách riêng, bồn tắm và minibar cao cấp." },
                new RoomType { Id = 5, Name = "Phòng Gia Đình", Description = "Hai phòng ngủ thông nhau, lý tưởng cho gia đình." },
                new RoomType { Id = 6, Name = "Phòng VIP Thượng Hạng", Description = "Penthouse tầng cao, dịch vụ concierge riêng." }
            );

            // Seed Rooms
            modelBuilder.Entity<Room>().HasData(
                new Room { Id = 1, RoomNumber = "801", RoomTypeId = 1, Price = 1890000, Capacity = 2, Status = "available", Description = "Tone trắng và gỗ sồi; cửa sổ nhìn ra vườn zen nội khu." },
                new Room { Id = 2, RoomNumber = "802", RoomTypeId = 1, Price = 1950000, Capacity = 2, Status = "available", Description = "Giường queen, chăn duvet cotton organic." },
                new Room { Id = 3, RoomNumber = "903", RoomTypeId = 2, Price = 2650000, Capacity = 3, Status = "available", Description = "Không gian chia vùng sống & ngủ, desk ergonomic." },
                new Room { Id = 4, RoomNumber = "904", RoomTypeId = 2, Price = 2750000, Capacity = 3, Status = "occupied", Description = "Đang có khách — có thể chọn ngày khác." },
                new Room { Id = 5, RoomNumber = "1201", RoomTypeId = 3, Price = 4200000, Capacity = 3, Status = "available", Description = "Lan can kính, view bình minh và resort pool." },
                new Room { Id = 6, RoomNumber = "1205", RoomTypeId = 3, Price = 4350000, Capacity = 4, Status = "available", Description = "Ban công lớn, outdoor lounge nhỏ." },
                new Room { Id = 7, RoomNumber = "1508", RoomTypeId = 4, Price = 5890000, Capacity = 4, Status = "available", Description = "Living riêng, Nespresso bar, bồn tắm freestanding." },
                new Room { Id = 8, RoomNumber = "1510", RoomTypeId = 4, Price = 6100000, Capacity = 4, Status = "available", Description = "Corner suite hai hướng cửa sổ, mood lighting." },
                new Room { Id = 9, RoomNumber = "608", RoomTypeId = 5, Price = 3490000, Capacity = 5, Status = "available", Description = "Twin + queen, vách di động, kệ đồ chơi cho trẻ." },
                new Room { Id = 10, RoomNumber = "1801", RoomTypeId = 6, Price = 8990000, Capacity = 6, Status = "available", Description = "Duplex penthouse, jacuzzi và lounge riêng." }
            );

            // Seed Services
            modelBuilder.Entity<Service>().HasData(
                new Service { Id = 1, Name = "Buffet sáng quốc tế", Price = 350000, Description = "06:30–10:30 tại nhà hàng The Pearl." },
                new Service { Id = 2, Name = "Spa relaxation 60 phút", Price = 950000, Description = "Massage body & aromatic oil." },
                new Service { Id = 3, Name = "Đưa đón sân bay (một chiều)", Price = 480000, Description = "Xe limousine 7 chỗ, đặt trước 4h." },
                new Service { Id = 4, Name = "Giặt ủi express", Price = 150000, Description = "Nhận trong ngày tùy khối lượng." },
                new Service { Id = 5, Name = "Minibar package", Price = 420000, Description = "Đồ uống & snack refill theo menu." }
            );

            // Seed sample customers
            modelBuilder.Entity<Customer>().HasData(
                new Customer { Id = 1, Name = "Nguyễn Văn A", Phone = "0901234567", Email = "nguyenvana@gmail.com", IdCard = "079123456789", Address = "TP.HCM", CreatedAt = "2026-01-15 10:00:00" },
                new Customer { Id = 2, Name = "Trần Thị B", Phone = "0912345678", Email = "tranthib@gmail.com", IdCard = "079987654321", Address = "Hà Nội", CreatedAt = "2026-02-20 14:30:00" },
                new Customer { Id = 3, Name = "Lê Văn C", Phone = "0923456789", Email = "levanc@gmail.com", IdCard = "079111222333", Address = "Đà Nẵng", CreatedAt = "2026-03-10 09:15:00" }
            );

            // Seed sample bookings
            modelBuilder.Entity<Booking>().HasData(
                new Booking { Id = 1, CustomerId = 1, RoomId = 1, CheckInDate = "2026-08-20", CheckOutDate = "2026-08-23", Status = "confirmed", TotalPrice = 5670000, CreatedAt = "2026-08-15 10:00:00" },
                new Booking { Id = 2, CustomerId = 2, RoomId = 4, CheckInDate = "2026-08-15", CheckOutDate = "2026-08-18", Status = "occupied", TotalPrice = 8250000, CreatedAt = "2026-08-10 14:30:00" },
                new Booking { Id = 3, CustomerId = 3, RoomId = 5, CheckInDate = "2026-09-01", CheckOutDate = "2026-09-05", Status = "pending", TotalPrice = 16800000, CreatedAt = "2026-08-12 09:00:00" }
            );

            // Seed sample payments — minh hoạ 3 tình huống: đã đặt cọc một phần, đã thanh toán đủ, chưa thanh toán
            modelBuilder.Entity<Payment>().HasData(
                new Payment { Id = 1, BookingId = 1, Amount = 2000000, Method = "bank_transfer", Status = "completed", TransactionCode = "PAY-20260815-0001", CreatedAt = "2026-08-15 10:05:00", PaidAt = "2026-08-15 10:06:00", Notes = "Đặt cọc giữ phòng" },
                new Payment { Id = 2, BookingId = 2, Amount = 8250000, Method = "cash", Status = "completed", TransactionCode = "PAY-20260810-0002", CreatedAt = "2026-08-10 14:35:00", PaidAt = "2026-08-10 14:40:00", Notes = "Thanh toán đủ tại quầy" }
            );
        }
    }
}
