using System.ComponentModel.DataAnnotations;

public class FoodDrink
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; } // Number of units available
    public string Description { get; set; }
    public string Category { get; set; } // "Food" or "Drink"
    public string ImageUrl { get; set; }
}
