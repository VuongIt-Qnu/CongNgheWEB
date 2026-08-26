using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("customers")]
    public class Customer
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required, MaxLength(150)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(20)]
        [Column("phone")]
        public string? Phone { get; set; }

        [MaxLength(255)]
        [Column("email")]
        public string? Email { get; set; }

        [MaxLength(20)]
        [Column("id_card")]
        public string? IdCard { get; set; }

        [MaxLength(255)]
        [Column("address")]
        public string? Address { get; set; }

        [Column("user_id")]
        public int? UserId { get; set; }

        [MaxLength(30)]
        [Column("created_at")]
        public string? CreatedAt { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
