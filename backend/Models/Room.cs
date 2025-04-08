using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

public class Room
{
    [Key]
    public int Id { get; set; }
    public int RoomCategoryId { get; set; } // ForeignKey to RoomCategory
    public string RoomNumber { get; set; }
    public string Description { get; set; }

    public bool isActive { get; set; } = true;

    public RoomCategory RoomCategory { get; set; }
    public List<RoomImage> RoomImages { get; set; } = new();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();

}
