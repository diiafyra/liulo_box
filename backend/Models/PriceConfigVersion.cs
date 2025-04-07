using System.ComponentModel.DataAnnotations;

public class PriceConfigVersion
{
    [Key]
    public int Id { get; set; }
    public string VersionName { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}
