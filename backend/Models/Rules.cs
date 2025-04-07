using System.ComponentModel.DataAnnotations;

public class Rules
{
    [Key]
    public int Id { get; set; }
    public string RuleName { get; set; }
    public string Description { get; set; }
}
