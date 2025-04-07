using System.ComponentModel.DataAnnotations;

public class BookingTime
{
    [Key]
    public int Id { get; set; }
    public int BookingId { get; set; } // ForeignKey to Booking
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int PriceId { get; set; } // ForeignKey to RoomPricing

    public Booking Booking { get; set; }
    public RoomPricing RoomPricing { get; set; }

    // Helper property to calculate the total price for this booking time
    public decimal TotalPrice
    {
        get
        {
            TimeSpan duration = EndDate - StartDate;
            decimal hourlyRate = RoomPricing.Price;
            decimal totalPrice = (decimal)duration.TotalHours * hourlyRate;
            return totalPrice;
        }
    }
}
