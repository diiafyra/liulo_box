using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

public class RoomImage
{
    [Key]
    public int Id { get; set; }
    public int RoomId { get; set; } // ForeignKey to Room
    public string Url { get; set; }
    public string Alt { get; set; }
    public bool IsMain { get; set; } = false; 
    [JsonIgnore]

    public Room Room { get; set; }
}
