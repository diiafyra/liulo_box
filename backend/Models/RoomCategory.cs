using System.ComponentModel.DataAnnotations;

public class RoomCategory
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public int MaxCapacity { get; set; } // Maximum capacity of the room
    public string Url { get; set; }
    public List<RoomPricing> RoomPricing { get; set; } = new List<RoomPricing>();
}
