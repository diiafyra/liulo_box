using System.ComponentModel.DataAnnotations;

public class BookingFoodDrink
{
    [Key]
    public int Id { get; set; }
    public int BookingId { get; set; } // ForeignKey to Booking
    public int FoodDrinkId { get; set; } // ForeignKey to FoodDrink
    public int Units { get; set; }
    public decimal Price { get; set; }

    public Booking Booking { get; set; }
    public FoodDrink FoodDrink { get; set; }
}
