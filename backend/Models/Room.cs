using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("rooms")]
    public class Room
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("room_number")]
        public string RoomNumber { get; set; } = string.Empty;

        [Column("room_type_id")]
        public int RoomTypeId { get; set; }

        [Required]
        [Column("price")]
        public double Price { get; set; }

        [Column("capacity")]
        public int Capacity { get; set; } = 1;

        [Column("status")]
        public string Status { get; set; } = "available";

        [Column("description")]
        public string? Description { get; set; }

        [ForeignKey("RoomTypeId")]
        public RoomType? RoomType { get; set; }

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
