using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required, MaxLength(150)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        // MaxLength bắt buộc: có unique index (OnModelCreating) — MySQL không cho tạo index
        // trên cột TEXT/LONGTEXT không giới hạn độ dài như SQLite, phải là VARCHAR(n).
        [Required, MaxLength(255)]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Required, MaxLength(255)]
        [Column("password")]
        public string Password { get; set; } = string.Empty;

        [MaxLength(20)]
        [Column("role")]
        public string Role { get; set; } = "customer";

        [MaxLength(20)]
        [Column("phone")]
        public string? Phone { get; set; }

        [MaxLength(255)]
        [Column("address")]
        public string? Address { get; set; }

        [Column("is_active")]
        public int IsActive { get; set; } = 1;

        [MaxLength(30)]
        [Column("created_at")]
        public string? CreatedAt { get; set; }
    }
}
