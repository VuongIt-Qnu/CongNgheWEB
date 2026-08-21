using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    /// <summary>Helper tính tổng đã thanh toán / trạng thái thanh toán của 1 booking — dùng chung giữa BookingService và PaymentService.</summary>
    public static class PaymentSummary
    {
        public const string StatusCompleted = "completed";

        public static double GetAmountPaid(IEnumerable<Payment> payments) =>
            payments.Where(p => p.Status == StatusCompleted).Sum(p => p.Amount);

        public static string GetPaymentStatus(double totalPrice, double amountPaid)
        {
            if (amountPaid <= 0) return "unpaid";
            return amountPaid >= totalPrice ? "paid" : "partial";
        }
    }

    public interface IPaymentService
    {
        Task<List<PaymentDto>> GetAll(string? status, int? bookingId);
        Task<List<PaymentDto>> GetByBookingId(int bookingId);
        Task<PaymentDto?> GetById(int id);
        Task<int?> GetBookingIdOf(int paymentId);
        Task<(bool Success, string? Error, PaymentDto? Payment)> Create(CreatePaymentDto dto);
        Task<(bool Success, string? Error, PaymentDto? Payment)> UpdateStatus(int id, string newStatus, string? notes);
    }

    public class PaymentService : IPaymentService
    {
        private static readonly HashSet<string> AllowedMethods = new() { "cash", "bank_transfer", "credit_card" };

        private readonly ApplicationDbContext _db;

        public PaymentService(ApplicationDbContext db) => _db = db;

        public async Task<List<PaymentDto>> GetAll(string? status, int? bookingId)
        {
            var query = _db.Payments
                .Include(p => p.Booking).ThenInclude(b => b!.Customer)
                .Include(p => p.Booking).ThenInclude(b => b!.Room)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(p => p.Status == status);

            if (bookingId.HasValue)
                query = query.Where(p => p.BookingId == bookingId.Value);

            var payments = await query.OrderByDescending(p => p.Id).ToListAsync();
            return payments.Select(ToDto).ToList();
        }

        public async Task<List<PaymentDto>> GetByBookingId(int bookingId)
        {
            var payments = await _db.Payments
                .Include(p => p.Booking).ThenInclude(b => b!.Customer)
                .Include(p => p.Booking).ThenInclude(b => b!.Room)
                .Where(p => p.BookingId == bookingId)
                .OrderByDescending(p => p.Id)
                .ToListAsync();
            return payments.Select(ToDto).ToList();
        }

        public async Task<PaymentDto?> GetById(int id)
        {
            var p = await _db.Payments
                .Include(p => p.Booking).ThenInclude(b => b!.Customer)
                .Include(p => p.Booking).ThenInclude(b => b!.Room)
                .FirstOrDefaultAsync(p => p.Id == id);
            return p == null ? null : ToDto(p);
        }

        /// <summary>Chỉ tra cứu BookingId của 1 payment — dùng để controller kiểm tra quyền sở hữu mà không cần load hết dữ liệu.</summary>
        public async Task<int?> GetBookingIdOf(int paymentId)
        {
            return await _db.Payments.Where(p => p.Id == paymentId).Select(p => (int?)p.BookingId).FirstOrDefaultAsync();
        }

        public async Task<(bool Success, string? Error, PaymentDto? Payment)> Create(CreatePaymentDto dto)
        {
            if (!AllowedMethods.Contains(dto.Method))
                return (false, $"Phương thức thanh toán '{dto.Method}' không hợp lệ.", null);

            var booking = await _db.Bookings
                .Include(b => b.Payments)
                .FirstOrDefaultAsync(b => b.Id == dto.BookingId);

            if (booking == null)
                return (false, "Không tìm thấy đặt phòng.", null);

            if (booking.Status is "cancelled" or "no_show")
                return (false, "Đặt phòng đã hủy hoặc khách không đến, không thể thanh toán.", null);

            var amountPaid = PaymentSummary.GetAmountPaid(booking.Payments);
            var remaining = booking.TotalPrice - amountPaid;

            if (remaining <= 0)
                return (false, "Đặt phòng này đã được thanh toán đủ.", null);

            if (dto.Amount > remaining)
                return (false, $"Số tiền vượt quá số dư còn lại ({remaining:N0}₫).", null);

            var entity = new Payment
            {
                BookingId = dto.BookingId,
                Amount = dto.Amount,
                Method = dto.Method,
                Status = "pending",
                TransactionCode = $"PAY-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}",
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
            };

            _db.Payments.Add(entity);
            await _db.SaveChangesAsync();

            return (true, null, await GetById(entity.Id));
        }

        public async Task<(bool Success, string? Error, PaymentDto? Payment)> UpdateStatus(int id, string newStatus, string? notes)
        {
            var validNewStatuses = new[] { "completed", "failed", "refunded" };
            if (!validNewStatuses.Contains(newStatus))
                return (false, $"Trạng thái '{newStatus}' không hợp lệ.", null);

            var entity = await _db.Payments.FirstOrDefaultAsync(p => p.Id == id);
            if (entity == null)
                return (false, "Không tìm thấy giao dịch thanh toán.", null);

            var allowedFrom = new Dictionary<string, string[]>
            {
                { "pending",   new[] { "completed", "failed" } },
                { "completed", new[] { "refunded" } },
            };

            if (!allowedFrom.TryGetValue(entity.Status, out var allowed) || !allowed.Contains(newStatus))
                return (false, $"Không thể chuyển giao dịch từ '{entity.Status}' sang '{newStatus}'.", null);

            entity.Status = newStatus;
            if (newStatus == "completed")
                entity.PaidAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
            if (notes != null)
                entity.Notes = notes;

            await _db.SaveChangesAsync();
            return (true, null, await GetById(id));
        }

        private static PaymentDto ToDto(Payment p) => new()
        {
            Id = p.Id,
            BookingId = p.BookingId,
            CustomerName = p.Booking?.Customer?.Name ?? "",
            RoomNumber = p.Booking?.Room?.RoomNumber ?? "",
            Amount = p.Amount,
            Method = p.Method,
            Status = p.Status,
            TransactionCode = p.TransactionCode,
            Notes = p.Notes,
            CreatedAt = p.CreatedAt,
            PaidAt = p.PaidAt
        };
    }
}
