using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // ── Auth DTOs ──
    public class LoginDto
    {
        [Required] public string Email { get; set; } = string.Empty;
        [Required] public string Password { get; set; } = string.Empty;
    }

    public class RegisterDto
    {
        [Required] public string Name { get; set; } = string.Empty;
        [Required][EmailAddress] public string Email { get; set; } = string.Empty;
        [Required][MinLength(6)] public string Password { get; set; } = string.Empty;
        public string? Phone { get; set; }
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public UserDto User { get; set; } = null!;
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public int IsActive { get; set; }
    }

    // ── RoomType DTOs ──
    public class RoomTypeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int RoomCount { get; set; }
    }

    public class CreateRoomTypeDto
    {
        [Required] public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    // ── Room DTOs ──
    public class RoomDto
    {
        public int Id { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public int RoomTypeId { get; set; }
        public string RoomTypeName { get; set; } = string.Empty;
        public double Price { get; set; }
        public int Capacity { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class CreateRoomDto
    {
        [Required] public string RoomNumber { get; set; } = string.Empty;
        [Required] public int RoomTypeId { get; set; }
        [Range(0.01, double.MaxValue, ErrorMessage = "Giá phòng phải lớn hơn 0.")]
        public double Price { get; set; }
        [Range(1, 20, ErrorMessage = "Sức chứa phải từ 1 đến 20 người.")]
        public int Capacity { get; set; } = 1;
        public string Status { get; set; } = "available";
        public string? Description { get; set; }
    }

    public class UpdateRoomDto
    {
        [Required] public string RoomNumber { get; set; } = string.Empty;
        [Required] public int RoomTypeId { get; set; }
        [Range(0.01, double.MaxValue, ErrorMessage = "Giá phòng phải lớn hơn 0.")]
        public double Price { get; set; }
        [Range(1, 20, ErrorMessage = "Sức chứa phải từ 1 đến 20 người.")]
        public int Capacity { get; set; } = 1;
        public string Status { get; set; } = "available";
        public string? Description { get; set; }
    }

    // ── Customer DTOs ──
    public class CustomerDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? IdCard { get; set; }
        public string? Address { get; set; }
        public int? UserId { get; set; }
        public string? CreatedAt { get; set; }
    }

    public class CreateCustomerDto
    {
        [Required] public string Name { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? IdCard { get; set; }
        public string? Address { get; set; }
    }

    // ── Booking DTOs ──
    public class BookingDto
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int RoomId { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public string CheckInDate { get; set; } = string.Empty;
        public string CheckOutDate { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public double TotalPrice { get; set; }
        public string? Notes { get; set; }
        public string? CreatedAt { get; set; }
        public string? UpdatedAt { get; set; }

        // ── Tổng hợp thanh toán (tính từ các Payment có Status = "completed") ──
        public double AmountPaid { get; set; }
        public double AmountDue { get; set; }
        /// <summary>unpaid | partial | paid</summary>
        public string PaymentStatus { get; set; } = "unpaid";
    }

    public class CreateBookingDto
    {
        [Required] public int CustomerId { get; set; }
        [Required] public int RoomId { get; set; }
        [Required] public string CheckInDate { get; set; } = string.Empty;
        [Required] public string CheckOutDate { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class UpdateBookingDto
    {
        public int? CustomerId { get; set; }
        public int? RoomId { get; set; }
        public string? CheckInDate { get; set; }
        public string? CheckOutDate { get; set; }
        public string? Status { get; set; }
        public double? TotalPrice { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateBookingStatusDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }

    // ── Service DTOs ──
    public class ServiceDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double Price { get; set; }
        public string? Description { get; set; }
    }

    public class CreateServiceDto
    {
        [Required] public string Name { get; set; } = string.Empty;
        [Range(0, double.MaxValue, ErrorMessage = "Giá dịch vụ không được âm.")]
        public double Price { get; set; }
        public string? Description { get; set; }
    }

    // ── Payment DTOs ──
    public class PaymentDto
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string RoomNumber { get; set; } = string.Empty;
        public double Amount { get; set; }
        public string Method { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? TransactionCode { get; set; }
        public string? Notes { get; set; }
        public string? CreatedAt { get; set; }
        public string? PaidAt { get; set; }
    }

    public class CreatePaymentDto
    {
        [Required] public int BookingId { get; set; }
        [Required][Range(1, double.MaxValue, ErrorMessage = "Số tiền thanh toán phải lớn hơn 0.")]
        public double Amount { get; set; }
        [Required] public string Method { get; set; } = "cash";
        public string? Notes { get; set; }
    }

    public class UpdatePaymentStatusDto
    {
        /// <summary>completed | failed | refunded</summary>
        [Required] public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
}
