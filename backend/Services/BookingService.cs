using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface IBookingService
    {
        Task<List<BookingDto>> GetAll(string? status, string? search);
        Task<List<BookingDto>> GetByUserId(int userId);
        Task<BookingDto?> GetById(int id);
        Task<bool> HasOverlappingBooking(int roomId, DateTime checkIn, DateTime checkOut, int? excludeBookingId = null);
        Task<BookingDto> Create(CreateBookingDto dto);
        Task<(bool Success, string? Error, BookingDto? Booking)> Update(int id, UpdateBookingDto dto);
        Task<(bool Success, string? Error, BookingDto? Booking)> UpdateStatus(int id, string newStatus);
        Task<bool> Delete(int id);
    }

    public class BookingService : IBookingService
    {
        private readonly ApplicationDbContext _db;

        // ── Business rules cho vòng đời trạng thái đặt phòng ──
        // (dùng chung cho cả UpdateStatus và Update, tránh 2 nơi có 2 luật khác nhau)
        private static readonly Dictionary<string, string[]> ValidTransitions = new()
        {
            { "pending",   new[] { "confirmed", "cancelled" } },
            { "confirmed", new[] { "occupied", "no_show", "cancelled" } },
            { "occupied",  new[] { "completed" } },
        };

        private static readonly HashSet<string> TerminalStatuses = new() { "completed", "cancelled", "no_show" };

        public BookingService(ApplicationDbContext db) => _db = db;

        public async Task<List<BookingDto>> GetAll(string? status, string? search)
        {
            var query = _db.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Room)
                .Include(b => b.Payments)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(b => b.Status == status);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(b =>
                    (b.Customer != null && b.Customer.Name.Contains(search)) ||
                    (b.Room != null && b.Room.RoomNumber.Contains(search)));

            // Lấy entity trước rồi map sang DTO ở phía client (LINQ-to-Objects):
            // ToDto là method thường, không thể dịch trực tiếp sang SQL bên trong .Select() của EF Core.
            var bookings = await query.OrderByDescending(b => b.Id).ToListAsync();
            return bookings.Select(ToDto).ToList();
        }

        public async Task<List<BookingDto>> GetByUserId(int userId)
        {
            var customer = await _db.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
            if (customer == null) return new List<BookingDto>();

            var bookings = await _db.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Room)
                .Include(b => b.Payments)
                .Where(b => b.CustomerId == customer.Id)
                .OrderByDescending(b => b.Id)
                .ToListAsync();

            return bookings.Select(ToDto).ToList();
        }

        public async Task<BookingDto?> GetById(int id)
        {
            var b = await _db.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Room)
                .Include(b => b.Payments)
                .FirstOrDefaultAsync(b => b.Id == id);
            return b == null ? null : ToDto(b);
        }

        /// <summary>Kiểm tra phòng đã có đơn đặt khác trùng khoảng ngày [checkIn, checkOut) hay chưa.</summary>
        public async Task<bool> HasOverlappingBooking(int roomId, DateTime checkIn, DateTime checkOut, int? excludeBookingId = null)
        {
            var checkInStr = checkIn.ToString("yyyy-MM-dd");
            var checkOutStr = checkOut.ToString("yyyy-MM-dd");

            // Booking đã hủy / khách không đến thì không còn giữ chỗ phòng nữa, loại khỏi việc kiểm tra trùng lịch.
            // So sánh 2 khoảng nửa-mở [checkIn, checkOut): trùng nhau khi existing.CheckIn < newCheckOut
            // và existing.CheckOut > newCheckIn (ngày trả phòng trùng ngày nhận phòng mới thì KHÔNG tính là trùng).
            var query = _db.Bookings.Where(b =>
                b.RoomId == roomId &&
                b.Status != "cancelled" && b.Status != "no_show" &&
                b.CheckInDate.CompareTo(checkOutStr) < 0 &&
                b.CheckOutDate.CompareTo(checkInStr) > 0);

            if (excludeBookingId.HasValue)
                query = query.Where(b => b.Id != excludeBookingId.Value);

            return await query.AnyAsync();
        }

        public async Task<BookingDto> Create(CreateBookingDto dto)
        {
            var room = await _db.Rooms.FindAsync(dto.RoomId);
            double totalPrice = 0;
            if (room != null && DateTime.TryParse(dto.CheckInDate, out var checkIn) && DateTime.TryParse(dto.CheckOutDate, out var checkOut))
            {
                var nights = (checkOut - checkIn).Days;
                if (nights < 1) nights = 1;
                totalPrice = nights * room.Price;
            }

            var entity = new Booking
            {
                CustomerId = dto.CustomerId,
                RoomId = dto.RoomId,
                CheckInDate = dto.CheckInDate,
                CheckOutDate = dto.CheckOutDate,
                Status = "pending",
                TotalPrice = totalPrice,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
            };
            _db.Bookings.Add(entity);
            await _db.SaveChangesAsync();
            return (await GetById(entity.Id))!;
        }

        public async Task<(bool Success, string? Error, BookingDto? Booking)> Update(int id, UpdateBookingDto dto)
        {
            var entity = await _db.Bookings.Include(b => b.Room).FirstOrDefaultAsync(b => b.Id == id);
            if (entity == null) return (false, "Không tìm thấy đặt phòng.", null);

            // Đổi trạng thái qua form Update cũng phải tuân theo state machine giống PATCH /status,
            // tránh việc form sửa đơn "nhảy cóc" trạng thái (VD: pending -> completed trực tiếp).
            if (dto.Status != null && dto.Status != entity.Status)
            {
                var transitionError = ValidateStatusTransition(entity.Status, dto.Status);
                if (transitionError != null) return (false, transitionError, null);

                entity.Status = dto.Status;
                SyncRoomStatus(entity, dto.Status);
            }

            if (dto.CustomerId.HasValue) entity.CustomerId = dto.CustomerId.Value;
            if (dto.RoomId.HasValue) entity.RoomId = dto.RoomId.Value;
            if (dto.CheckInDate != null) entity.CheckInDate = dto.CheckInDate;
            if (dto.CheckOutDate != null) entity.CheckOutDate = dto.CheckOutDate;
            if (dto.TotalPrice.HasValue) entity.TotalPrice = dto.TotalPrice.Value;
            if (dto.Notes != null) entity.Notes = dto.Notes;
            entity.UpdatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");

            await _db.SaveChangesAsync();
            return (true, null, await GetById(id));
        }

        public async Task<(bool Success, string? Error, BookingDto? Booking)> UpdateStatus(int id, string newStatus)
        {
            var entity = await _db.Bookings
                .Include(b => b.Room)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (entity == null)
                return (false, "Không tìm thấy đặt phòng.", null);

            var transitionError = ValidateStatusTransition(entity.Status, newStatus);
            if (transitionError != null) return (false, transitionError, null);

            entity.Status = newStatus;
            entity.UpdatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
            SyncRoomStatus(entity, newStatus);

            await _db.SaveChangesAsync();
            return (true, null, await GetById(id));
        }

        public async Task<bool> Delete(int id)
        {
            var entity = await _db.Bookings.FindAsync(id);
            if (entity == null) return false;
            _db.Bookings.Remove(entity);
            await _db.SaveChangesAsync();
            return true;
        }

        // ── Helpers dùng chung ──

        private static string? ValidateStatusTransition(string currentStatus, string newStatus)
        {
            if (TerminalStatuses.Contains(currentStatus))
                return $"Đặt phòng ở trạng thái '{currentStatus}' không thể thay đổi.";

            if (!ValidTransitions.TryGetValue(currentStatus, out var allowed) || !allowed.Contains(newStatus))
                return $"Không thể chuyển từ '{currentStatus}' sang '{newStatus}'.";

            return null;
        }

        private static void SyncRoomStatus(Booking entity, string newStatus)
        {
            if (entity.Room == null) return;

            if (newStatus == "occupied")
                entity.Room.Status = "occupied"; // Khách đã nhận phòng
            else if (TerminalStatuses.Contains(newStatus))
                entity.Room.Status = "available"; // Kết thúc lưu trú / hủy / không đến
            // confirmed: phòng vẫn available (chỉ đặt trước, chưa check-in)
        }

        private static BookingDto ToDto(Booking b)
        {
            var amountPaid = PaymentSummary.GetAmountPaid(b.Payments);

            return new BookingDto
            {
                Id = b.Id,
                CustomerId = b.CustomerId,
                CustomerName = b.Customer != null ? b.Customer.Name : "",
                RoomId = b.RoomId,
                RoomNumber = b.Room != null ? b.Room.RoomNumber : "",
                CheckInDate = b.CheckInDate,
                CheckOutDate = b.CheckOutDate,
                Status = b.Status,
                TotalPrice = b.TotalPrice,
                Notes = b.Notes,
                CreatedAt = b.CreatedAt,
                UpdatedAt = b.UpdatedAt,
                AmountPaid = amountPaid,
                AmountDue = Math.Max(0, b.TotalPrice - amountPaid),
                PaymentStatus = PaymentSummary.GetPaymentStatus(b.TotalPrice, amountPaid)
            };
        }
    }
}
