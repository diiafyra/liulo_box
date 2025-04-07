using System.ComponentModel.DataAnnotations;

public class TimeSlotDefinition
{
    [Key]
    public int Id { get; set; }
    public int PriceConfigVersionId { get; set; }  // ForeignKey to PriceConfigVersion
    public string DayType { get; set; } // e.g. "weekday", "weekend"
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }

    public PriceConfigVersion PriceConfigVersion { get; set; }
}
