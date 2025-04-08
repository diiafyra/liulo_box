using DAO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

[Route("api/bookings")]
[ApiController]
public class BookingsController : ControllerBase
{
    private readonly BookingDAO _bookingDAO;
    private readonly IUserDao _userDAO;
    private readonly RoomDAO _roomDAO;

    public BookingsController(BookingDAO bookingDAO, IUserDao userDAO, RoomDAO roomDAO)
    {
        _userDAO = userDAO;
        _roomDAO = roomDAO;
        _bookingDAO = bookingDAO;
    }

    [HttpGet("online")]
    public async Task<IActionResult> GetOnlineBookings([FromQuery] DateTime date)
    {
        var bookings = await _bookingDAO.GetOnlineBookingsAsync(date);
        var result = bookings.Select(b => new
        {
            Id = b.Id,
            Username = b.User.Username,
            RoomName = b.Room.RoomNumber,
            Status = b.BookingStatus,
            TotalPrice = b.TotalPrice,
            Times = b.BookingTimes.Select(t => new
            {
                Start = t.StartDate,
                End = t.EndDate,
                Price = t.TotalPrice
            }),
            FoodDrinks = b.BookingFoodDrinks.Select(f => new
            {
                Name = f.FoodDrink.Name,
                Units = f.Units,
                Price = f.Price
            })
        });

        return Ok(result);
    }

    [HttpGet("room/{roomId}")]
    public async Task<IActionResult> GetBookingsByRoom(int roomId)
    {
        var bookings = await _bookingDAO.GetBookingsByRoomAsync(roomId);
        var result = bookings.Select(b => new
        {
            Id = b.Id,
            Status = b.BookingStatus,
            TotalPrice = b.TotalPrice,
            Times = b.BookingTimes.Select(t => new
            {
                Start = t.StartDate,
                End = t.EndDate,
                Price = t.TotalPrice
            })
        });

        return Ok(result);
    }

    [HttpGet("booked-times/{roomId}")]
    public async Task<IActionResult> GetBookedTimes(int roomId, [FromQuery] DateTime date)
    {
        var bookedTimes = await _bookingDAO.GetBookedTimesAsync(roomId, date);
        var result = bookedTimes.Select(t => new
        {
            Start = t.StartDate,
            End = t.EndDate,
            Price = t.TotalPrice
        });

        return Ok(result);
    }

    [HttpPut("{bookingId}/confirm")]
    public async Task<IActionResult> ConfirmBooking(int bookingId)
    {

        // Xác nhận booking
        var result = await _bookingDAO.ConfirmBookingAsync(bookingId);
        if (!result)
        {
            return NotFound($"Không tìm thấy booking với ID {bookingId}.");
        }

        return Ok(new
        {
            Message = $"Booking {bookingId} đã được xác nhận thành công.",
            BookingId = bookingId,
            ConfirmedAt = DateTime.UtcNow
        });
    }
    // Thêm mới: Tạo Booking offline
    [HttpPost("offline")]
    public async Task<IActionResult> CreateOfflineBooking([FromBody] BookingDto bookingDto)
    {
        System.Console.WriteLine("CreateOfflineBooking called with DTO: " + bookingDto.ToString());
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        System.Console.WriteLine("ModelState is valid.");

        // Kiểm tra tồn tại User và Room
        var user = await _userDAO.FindAsync(bookingDto.UserId);
        var room = await _roomDAO.FindAsync(bookingDto.RoomId);
        if (user == null || room == null)
        {
            return BadRequest("User hoặc Room không tồn tại");
        }
        System.Console.WriteLine("User and Room found: " + user.Username + ", " + room.RoomNumber);

        // Lấy PriceId phù hợp với thời gian hiện tại
        var now = DateTime.Now;
        System.Console.WriteLine("Current DateTime: " + now);
        int newBookingId;
        try
        {
            // Gọi stored procedure để tạo Booking và BookingTime
            newBookingId = await _bookingDAO.CreateOfflineBookingWithSPAsync(
                bookingDto.UserId,
                bookingDto.RoomId,
                bookingDto.Describe,
                bookingDto.PaymentMethod,
                now,
                bookingDto.PriceId
            );
        }
        catch (SqlException ex) when (ex.Number == 51000)
        {
            // Conflict từ store procedure
            return Conflict(ex.Message);
        }
        System.Console.WriteLine("New Booking ID: " + newBookingId);
        // Nếu có FoodDrinks thì thêm vào
        if (bookingDto.BookingFoodDrinks != null && bookingDto.BookingFoodDrinks.Any())
        {
            await _bookingDAO.AddBookingFoodDrinksAsync(newBookingId, bookingDto.BookingFoodDrinks);
        }

        return Ok(new { BookingId = newBookingId });
    }

}

// DTO để nhận dữ liệu từ frontend
public class BookingDto
{
    public int UserId { get; set; }
    public int RoomId { get; set; }
    public string Describe { get; set; }
    public string PaymentMethod { get; set; }
    public int PriceId { get; set; }
    public List<BookingFoodDrinkDto> BookingFoodDrinks { get; set; }
}