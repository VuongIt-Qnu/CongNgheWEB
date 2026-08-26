using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("bookings")]
    public class Booking
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("customer_id")]
        public int CustomerId { get; set; }

        [Column("room_id")]
        public int RoomId { get; set; }

        [Required, MaxLength(10)]
        [Column("check_in_date")]
        public string CheckInDate { get; set; } = string.Empty;

        [Required, MaxLength(10)]
        [Column("check_out_date")]
        public string CheckOutDate { get; set; } = string.Empty;

        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "pending";

        [Column("total_price")]
        public double TotalPrice { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

        [MaxLength(30)]
        [Column("created_at")]
        public string? CreatedAt { get; set; }

        [MaxLength(30)]
        [Column("updated_at")]
        public string? UpdatedAt { get; set; }

        [ForeignKey("CustomerId")]
        public Customer? Customer { get; set; }

        [ForeignKey("RoomId")]
        public Room? Room { get; set; }

        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
