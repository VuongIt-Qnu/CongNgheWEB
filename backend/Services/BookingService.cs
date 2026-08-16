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
        Task<BookingDto> Create(CreateBookingDto dto);
        Task<BookingDto?> Update(int id, UpdateBookingDto dto);
        Task<(bool Success, string? Error, BookingDto? Booking)> UpdateStatus(int id, string newStatus);
        Task<bool> Delete(int id);
    }

    public class BookingService : IBookingService
    {
        private readonly ApplicationDbContext _db;

        public BookingService(ApplicationDbContext db) => _db = db;

        public async Task<List<BookingDto>> GetAll(string? status, string? search)
        {
            var query = _db.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Room)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(b => b.Status == status);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(b =>
                    (b.Customer != null && b.Customer.Name.Contains(search)) ||
                    (b.Room != null && b.Room.RoomNumber.Contains(search)));

            return await query.OrderByDescending(b => b.Id).Select(b => new BookingDto
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
                UpdatedAt = b.UpdatedAt
            }).ToListAsync();
        }

        public async Task<List<BookingDto>> GetByUserId(int userId)
        {
            var customer = await _db.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
            if (customer == null) return new List<BookingDto>();

            return await _db.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Room)
                .Where(b => b.CustomerId == customer.Id)
                .OrderByDescending(b => b.Id)
                .Select(b => new BookingDto
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
                    UpdatedAt = b.UpdatedAt
                }).ToListAsync();
        }

        public async Task<BookingDto?> GetById(int id)
        {
            var b = await _db.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Room)
                .FirstOrDefaultAsync(b => b.Id == id);
            if (b == null) return null;

            return new BookingDto
            {
                Id = b.Id,
                CustomerId = b.CustomerId,
                CustomerName = b.Customer?.Name ?? "",
                RoomId = b.RoomId,
                RoomNumber = b.Room?.RoomNumber ?? "",
                CheckInDate = b.CheckInDate,
                CheckOutDate = b.CheckOutDate,
                Status = b.Status,
                TotalPrice = b.TotalPrice,
                Notes = b.Notes,
                CreatedAt = b.CreatedAt,
                UpdatedAt = b.UpdatedAt
            };
        }

        public async Task<BookingDto> Create(CreateBookingDto dto)
        {
            // Calculate total price
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

        public async Task<BookingDto?> Update(int id, UpdateBookingDto dto)
        {
            var entity = await _db.Bookings.FindAsync(id);
            if (entity == null) return null;

            if (dto.CustomerId.HasValue) entity.CustomerId = dto.CustomerId.Value;
            if (dto.RoomId.HasValue) entity.RoomId = dto.RoomId.Value;
            if (dto.CheckInDate != null) entity.CheckInDate = dto.CheckInDate;
            if (dto.CheckOutDate != null) entity.CheckOutDate = dto.CheckOutDate;
            if (dto.Status != null) entity.Status = dto.Status;
            if (dto.TotalPrice.HasValue) entity.TotalPrice = dto.TotalPrice.Value;
            if (dto.Notes != null) entity.Notes = dto.Notes;
            entity.UpdatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");

            await _db.SaveChangesAsync();
            return (await GetById(id))!;
        }

        public async Task<(bool Success, string? Error, BookingDto? Booking)> UpdateStatus(int id, string newStatus)
        {
            var entity = await _db.Bookings
                .Include(b => b.Room)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (entity == null)
                return (false, "Không tìm thấy đặt phòng.", null);

            var currentStatus = entity.Status;

            // ── Validate status transitions ──
            var validTransitions = new Dictionary<string, List<string>>
            {
                { "pending",   new List<string> { "confirmed", "cancelled" } },
                { "confirmed", new List<string> { "occupied", "no_show", "cancelled" } },
                { "occupied",  new List<string> { "completed" } },
            };

            bool isTerminal = currentStatus == "completed" || currentStatus == "cancelled" || currentStatus == "no_show";
            if (isTerminal)
                return (false, $"Đặt phòng ở trạng thái '{currentStatus}' không thể thay đổi.", null);

            if (!validTransitions.TryGetValue(currentStatus, out var allowed) || !allowed.Contains(newStatus))
                return (false, $"Không thể chuyển từ '{currentStatus}' sang '{newStatus}'.", null);

            entity.Status = newStatus;
            entity.UpdatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");

            // ── Sync Room Status ──
            if (entity.Room != null)
            {
                if (newStatus == "occupied")
                {
                    // Khách đã nhận phòng → Phòng đang có khách
                    entity.Room.Status = "occupied";
                }
                else if (newStatus == "completed" || newStatus == "cancelled" || newStatus == "no_show")
                {
                    // Kết thúc lưu trú / hủy / không đến → Phòng về trống
                    entity.Room.Status = "available";
                }
                // confirmed: phòng vẫn available (chỉ đặt trước, chưa check-in)
            }

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
    }
}
