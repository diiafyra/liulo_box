using System.ComponentModel.DataAnnotations;

public class Booking
{
    [Key]
    public int Id { get; set; }
    public int UserId { get; set; } // ForeignKey to User
    public int RoomId { get; set; } // ForeignKey to Room
    public string BookingType { get; set; } // e.g. "online", "offline"
    public string Describe { get; set; }
    public string BookingStatus { get; set; } // e.g. "Confirmed", "Cancelled"
    public string PaymentMethod { get; set; } // e.g. "Momo", "Cash", "Bank Transfer"
    public decimal TotalPrice { get; set; }

    public Room Room { get; set; }
    public User User { get; set; }
    public ICollection<BookingTime> BookingTimes { get; set; } = new List<BookingTime>();
    public ICollection<BookingFoodDrink> BookingFoodDrinks { get; set; } = new List<BookingFoodDrink>();
}
