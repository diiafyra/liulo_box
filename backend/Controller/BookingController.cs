using System.Security.Claims;
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
    private readonly BookingFoodDrinkDAO _bookingFoodDrinkDAO;
    // private readonly IBookingService _bookingService;

    public BookingsController(BookingDAO bookingDAO, IUserDao userDAO, RoomDAO roomDAO, BookingFoodDrinkDAO bookingFoodDrinkDAO)
    {
        _bookingDAO = bookingDAO;
        _userDAO = userDAO;
        _roomDAO = roomDAO;
        _bookingFoodDrinkDAO = bookingFoodDrinkDAO;
        // _bookingService = bookingService;
    }


    [HttpGet("online")]
    public async Task<IActionResult> GetOnlineBookings([FromQuery] DateTime date)
    {
        var bookings = await _bookingDAO.GetOnlineBookingsAsync(date);

        var result = bookings.Select(b => new
        {
            Id = b.Id,
            BookingType = b.BookingType, // Thêm BookingType
            Describe = b.Describe, // Thêm Describe
            BookingStatus = b.BookingStatus, // Thêm BookingStatus
            PaymentMethod = b.PaymentMethod, // Thêm PaymentMethod
            IsComplete = b.IsComplete, // Thêm IsComplete
            User = new
            {
                Username = b.User.Username // Lồng Username trong User
            },
            Room = new
            {
                RoomNumber = b.Room.RoomNumber // Lồng RoomNumber trong Room
            },
            BookingTimes = b.BookingTimes.Select(t => new
            {
                Id = t.Id, // Thêm Id
                StartDate = t.StartDate, // Đổi Start thành StartDate
                EndDate = t.EndDate, // Đổi End thành EndDate
                PriceId = t.PriceId, // Thêm PriceId
                Price = t.RoomPricing.Price, // Lấy Price từ RoomPricing
                TotalPrice = t.TotalPrice // Đổi Price thành TotalPrice để đồng bộ
            }).ToList(),
            BookingFoodDrinks = b.BookingFoodDrinks.Select(f => new
            {
                Id = f.Id, // Thêm Id
                FoodDrinkId = f.FoodDrinkId, // Thêm FoodDrinkId
                Units = f.Units,
                Price = f.Price,
                FoodDrink = new
                {
                    Name = f.FoodDrink.Name // Lồng Name trong FoodDrink
                }
            }).ToList()
        }).ToList();

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

    [HttpPut("confirm/{bookingId}")]
    public async Task<IActionResult> ConfirmOfflineBooking(int bookingId)
    {

        // Xác nhận booking
        var result = await _bookingDAO.ConfirmOfflineBookingAsync(bookingId);
        if (!result)
        {
            return NotFound($"Không tìm thấy booking với ID {bookingId}.");
        }

        return Ok(new
        {
            Message = $"Booking {bookingId} đã được xác nhận thành công.",
            BookingId = bookingId,
            ConfirmedAt = DateTime.Now
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
            await _bookingFoodDrinkDAO.AddOrUpdateBookingFoodDrinksAsync(newBookingId, bookingDto.BookingFoodDrinks);
        }

        return Ok(new { BookingId = newBookingId });
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> CheckoutOfflineBooking([FromBody] CheckOutDto checkOutDto)
    {
        try
        {
            DateTime currentTime = DateTime.Now;

            // 1. Gọi SP để xử lý checkout (trả về danh sách BookingId được cập nhật)
            bool updatedBookingId = await _bookingDAO.CheckoutOfflineBookingAsync(checkOutDto.roomId, checkOutDto.bookingId, currentTime);

            if (!updatedBookingId)
            {
                return NotFound("Không có booking nào được checkout.");
            }

            // 2. Lấy chi tiết booking
            var bookingDetails = await _bookingDAO.GetBookingsWithDetailsAsync(checkOutDto.bookingId);

            // 3. Định hình dữ liệu trả về với anonymous type
            var response = bookingDetails.Select(b => new
            {
                Id = b.Id,
                BookingType = b.BookingType,
                Describe = b.Describe,
                BookingStatus = b.BookingStatus,
                PaymentMethod = b.PaymentMethod,
                IsComplete = b.IsComplete,
                User = b.User.Username, // Chỉ lấy Username
                Room = b.Room.RoomNumber, // Chỉ lấy RoomNumber
                BookingTimes = b.BookingTimes.Select(bt => new
                {
                    Id = bt.Id,
                    StartDate = bt.StartDate,
                    EndDate = bt.EndDate,
                    PriceId = bt.PriceId,
                    Price = bt.RoomPricing.Price, // Chỉ lấy Price
                    TotalPrice = bt.TotalPrice
                }).ToList(),
                BookingFoodDrinks = b.BookingFoodDrinks.Select(bfd => new
                {
                    Id = bfd.Id,
                    FoodDrinkId = bfd.FoodDrinkId,
                    Units = bfd.Units,
                    Price = bfd.Price,
                    FoodDrink = bfd.FoodDrink.Name  // Chỉ lấy Name
                }).ToList()
            }).ToList();

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi xử lý checkout: {ex.Message}");
        }
    }

    [HttpPost("add-fooddrinks")]
    public async Task<IActionResult> AddBookingFoodDrinks([FromBody] BookingFoodDrinkRequest request)
    {
        try
        {

            await _bookingFoodDrinkDAO.AddOrUpdateBookingFoodDrinksAsync(request.BookingId, request.Items);
            return Ok("Thêm món ăn/uống vào booking thành công.");
        }
        catch (Exception ex)
        {
            return BadRequest($"Lỗi: {ex.Message}");
        }
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetBookingsByUserId()
    {
        var uid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var bookings = await _bookingDAO.GetAllBookingsByUserUidAsync(uid);

        var result = bookings.Select(b => new
        {
            id = b.Id,
            bookingType = b.BookingType,
            describe = b.Describe,
            bookingStatus = b.BookingStatus,
            paymentMethod = b.PaymentMethod,
            isComplete = b.IsComplete,
            
            user = new
            {
                username = b.User.Username
            },
            room = new
            {
                roomNumber = b.Room.RoomNumber
            },
            bookingTimes = b.BookingTimes.Select(bt => new
            {
                id = bt.Id,
                startDate = bt.StartDate,
                endDate = bt.EndDate,
                priceId = bt.PriceId,
                price = bt.RoomPricing.Price,
                totalPrice = bt.TotalPrice
            }).ToList(),
            bookingFoodDrinks = b.BookingFoodDrinks.Select(bfd => new
            {
                id = bfd.Id,
                foodDrinkId = bfd.FoodDrinkId,
                units = bfd.Units,
                price = bfd.Price,
                foodDrink = new
                {
                    name = bfd.FoodDrink.Name
                }
            }).ToList()
        }).ToList();

        return Ok(result);
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
public class BookingFoodDrinkRequest
{
    public int BookingId { get; set; }
    public List<BookingFoodDrinkDto> Items { get; set; }
}

// DTO for checkout request
public class CheckOutDto
{
    public int roomId { get; set; }
    public int bookingId { get; set; }
}