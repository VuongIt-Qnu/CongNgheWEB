using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    /// <summary>
    /// Bản ghi thanh toán cho một đơn đặt phòng. Một booking có thể có nhiều payment
    /// (VD: đặt cọc trước + thanh toán phần còn lại khi trả phòng, hoặc thử lại sau khi failed).
    /// Đây là mô hình thanh toán cơ bản (staff xác nhận thủ công), KHÔNG tích hợp cổng thanh toán thật.
    /// </summary>
    [Table("payments")]
    public class Payment
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("booking_id")]
        public int BookingId { get; set; }

        [Required]
        [Column("amount")]
        public double Amount { get; set; }

        /// <summary>cash | bank_transfer | credit_card</summary>
        [MaxLength(20)]
        [Column("method")]
        public string Method { get; set; } = "cash";

        /// <summary>pending | completed | failed | refunded</summary>
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "pending";

        /// <summary>Mã giao dịch tự sinh, dùng để tra cứu/đối soát.</summary>
        [MaxLength(50)]
        [Column("transaction_code")]
        public string? TransactionCode { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

        [MaxLength(30)]
        [Column("created_at")]
        public string? CreatedAt { get; set; }

        [MaxLength(30)]
        [Column("paid_at")]
        public string? PaidAt { get; set; }

        [ForeignKey("BookingId")]
        public Booking? Booking { get; set; }
    }
}
