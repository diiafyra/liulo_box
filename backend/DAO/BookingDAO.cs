using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

public class BookingDAO
{
    private readonly ApplicationDbContext _context;

    public BookingDAO(ApplicationDbContext context)
    {
        _context = context;
    }

    // Kiểm tra xem phòng đã được đặt trong khung giờ này chưa
    public async Task<List<BookingTime>> GetBookedTimesAsync(int roomId, DateTime date)
    {
        return await _context.BookingTimes
                             .Where(bt => bt.Booking.RoomId == roomId && bt.StartDate.Date == date.Date)
                             .Include(bt => bt.RoomPricing)
                             .ToListAsync();
    }

    // Lấy danh sách các booking của một phòng
    public async Task<List<Booking>> GetBookingsByRoomAsync(int roomId)
    {
        return await _context.Bookings
                             .Where(b => b.RoomId == roomId)
                             .Include(b => b.BookingTimes)
                             .ToListAsync();
    }

    public async Task<List<Booking>> GetOnlineBookingsAsync(DateTime date)
    {
        return await _context.Bookings
            .Where(b => b.BookingType == "online" && !b.IsComplete &&
                       b.BookingTimes.Any(bt => bt.StartDate.Date == date.Date))
            .Include(b => b.Room)
            .Include(b => b.User)
            .Include(b => b.BookingTimes)
                .ThenInclude(bt => bt.RoomPricing)
            .Include(b => b.BookingFoodDrinks)
                .ThenInclude(bfd => bfd.FoodDrink)
            .ToListAsync();
    }
    public async Task<bool> ConfirmBookingAsync(int bookingId)
    {
        var booking = await _context.Bookings.FindAsync(bookingId);
        if (booking == null)
        {
            return false; // Booking không tồn tại
        }

        if (booking.IsComplete)
        {
            return true; // Đã được xác nhận trước đó, không cần cập nhật
        }

        booking.IsComplete = true;
        _context.Bookings.Update(booking);
        await _context.SaveChangesAsync();
        return true;
    }
    // Thêm mới: Tạo Booking
    public async Task<Booking> CreateBookingAsync(Booking booking)
    {
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();
        return booking;
    }

    public async Task<int> CreateOfflineBookingWithSPAsync(int userId, int roomId, string describe, string paymentMethod, DateTime newStartDate, int priceId)
    {
        var query = "sp_CreateBookingWithTime";

        using (SqlConnection connection = new SqlConnection(_context.Database.GetConnectionString()))
        using (SqlCommand command = new SqlCommand(query, connection))
        {
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.AddWithValue("@UserId", userId);
            command.Parameters.AddWithValue("@RoomId", roomId);
            command.Parameters.AddWithValue("@Describe", describe ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@PaymentMethod", paymentMethod);
            command.Parameters.AddWithValue("@NewStartDate", newStartDate);
            command.Parameters.AddWithValue("@PriceId", priceId);

            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();

            // Giả sử bạn có thêm OUTPUT trong stored procedure để trả BookingId
            // Nếu chưa có, bạn cần chỉnh SP để trả BookingId hoặc truy vấn lại Booking mới nhất

            var commandGetId = new SqlCommand("SELECT MAX(Id) FROM Bookings WHERE UserId = @UserId AND RoomId = @RoomId", connection);
            commandGetId.Parameters.AddWithValue("@UserId", userId);
            commandGetId.Parameters.AddWithValue("@RoomId", roomId);

            var result = await commandGetId.ExecuteScalarAsync();
            return Convert.ToInt32(result);
        }
    }


    // Thêm mới: Tạo BookingTime
    public async Task<BookingTime> AddBookingTimeAsync(int bookingId, DateTime startDate, int priceId)
    {
        var bookingTime = new BookingTime
        {
            BookingId = bookingId,
            StartDate = startDate,
            PriceId = priceId
            // EndDate để trống vì chưa có
        };

        _context.BookingTimes.Add(bookingTime);
        await _context.SaveChangesAsync();
        return bookingTime;
    }

    // Thêm mới: Tạo BookingFoodDrink
    public async Task<List<BookingFoodDrink>> AddBookingFoodDrinksAsync(int bookingId, List<BookingFoodDrinkDto> foodDrinkDtos)
    {
        var bookingFoodDrinks = new List<BookingFoodDrink>();

        foreach (var dto in foodDrinkDtos)
        {
            var foodDrink = await _context.FoodDrinks.FindAsync(dto.FoodDrinkId);
            if (foodDrink == null)
            {
                throw new Exception($"FoodDrink với ID {dto.FoodDrinkId} không tồn tại");
            }

            decimal price = foodDrink.Price * dto.Units;

            // Gọi stored procedure để chèn BookingFoodDrink
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC AddBookingFoodDrinkAndDecreaseStock @BookingId = {0}, @FoodDrinkId = {1}, @Units = {2}, @Price = {3}",
                bookingId, dto.FoodDrinkId, dto.Units, price
            );

            // Tạo object để trả về (không lưu vào DB lần nữa)
            bookingFoodDrinks.Add(new BookingFoodDrink
            {
                BookingId = bookingId,
                FoodDrinkId = dto.FoodDrinkId,
                Units = dto.Units,
                Price = price
            });
        }

        return bookingFoodDrinks;
    }

    // Thêm mới: Tìm PriceId dựa trên thời gian hiện tại
    public async Task<int> GetPriceIdForCurrentTimeAsync(int roomCategoryId, DateTime currentTime)
    {
        System.Console.WriteLine("Current Time: " + currentTime.ToString("yyyy-MM-dd HH:mm:ss"));
        // Tìm PriceConfigVersion hiện tại
        var priceConfig = await _context.PriceConfigVersions
            .Where(pcv => pcv.StartDate <= currentTime && pcv.EndDate >= currentTime)
            .FirstOrDefaultAsync();
        System.Console.WriteLine("PriceConfigVersion: " + priceConfig?.Id);
        if (priceConfig == null)
        {
            return 0; // Không tìm thấy phiên bản giá
        }

        // Xác định loại ngày (weekday hoặc weekend)
        string dayType = currentTime.DayOfWeek == DayOfWeek.Saturday || currentTime.DayOfWeek == DayOfWeek.Sunday
            ? "weekend"
            : "weekday";
        System.Console.WriteLine("Day Type: " + dayType);
        // Chuyển thời gian hiện tại thành TimeSpan
        TimeSpan currentTimeSpan = currentTime.TimeOfDay;

        // Tìm TimeSlotDefinition phù hợp
        var timeSlot = await _context.TimeSlotDefinitions
            .Where(tsd => tsd.PriceConfigVersionId == priceConfig.Id
                       && tsd.DayType == dayType
                       && tsd.StartTime <= currentTimeSpan
                       && tsd.EndTime >= currentTimeSpan)
            .FirstOrDefaultAsync();

        System.Console.WriteLine("TimeSlotDefinition: " + timeSlot?.Id);
        if (timeSlot == null)
        {
            return 0; // Không tìm thấy khung giờ
        }

        // Tìm RoomPricing
        var roomPricing = await _context.RoomPricings
            .Where(rp => rp.RoomCategoryId == roomCategoryId && rp.TimeSlotDefinitionId == timeSlot.Id)
            .FirstOrDefaultAsync();
        System.Console.WriteLine("RoomPricing: " + roomPricing?.Id);
        return roomPricing?.Id ?? 0;
    }
}

// DTO để nhận dữ liệu BookingFoodDrink từ frontend
public class BookingFoodDrinkDto
{
    public int FoodDrinkId { get; set; }
    public int Units { get; set; }
}