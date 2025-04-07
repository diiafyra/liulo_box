using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

public class RoomPricing
{
    [Key]
    public int Id { get; set; }
    public int RoomCategoryId { get; set; } // ForeignKey to RoomCategory
    public int TimeSlotDefinitionId { get; set; } // ForeignKey to TimeSlotDefinition
    public decimal Price { get; set; }

    [JsonIgnore]
    public RoomCategory RoomCategory { get; set; }
    public TimeSlotDefinition TimeSlotDefinition { get; set; }
}
