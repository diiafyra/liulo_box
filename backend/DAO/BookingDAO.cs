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

    public async Task<bool> ConfirmOfflineBookingAsync(int bookingId)
    {
        var booking = await _context.Bookings.FindAsync(bookingId);
        if (booking == null)
        {
            return false; // Booking không tồn tại
        }

        if (booking.BookingStatus == "Confirmed")
        {
            return true; // Đã được xác nhận trước đó, không cần cập nhật
        }

        booking.BookingStatus = "Confirmed";
        _context.Bookings.Update(booking);
        await _context.SaveChangesAsync();
        return true;
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


    // Thêm mới: Tạo BookingFoodDrink
    // public async Task<List<BookingFoodDrink>> AddBookingFoodDrinksAsync(int bookingId, List<BookingFoodDrinkDto> foodDrinkDtos)
    // {
    //     var bookingFoodDrinks = new List<BookingFoodDrink>();

    //     foreach (var dto in foodDrinkDtos)
    //     {
    //         var foodDrink = await _context.FoodDrinks.FindAsync(dto.FoodDrinkId);
    //         if (foodDrink == null)
    //         {
    //             throw new Exception($"FoodDrink với ID {dto.FoodDrinkId} không tồn tại");
    //         }

    //         decimal price = foodDrink.Price * dto.Units;

    //         // Gọi stored procedure để chèn BookingFoodDrink
    //         await _context.Database.ExecuteSqlRawAsync(
    //             "EXEC AddBookingFoodDrinkAndDecreaseStock @BookingId = {0}, @FoodDrinkId = {1}, @Units = {2}, @Price = {3}",
    //             bookingId, dto.FoodDrinkId, dto.Units, price
    //         );

    //         // Tạo object để trả về (không lưu vào DB lần nữa)
    //         bookingFoodDrinks.Add(new BookingFoodDrink
    //         {
    //             BookingId = bookingId,
    //             FoodDrinkId = dto.FoodDrinkId,
    //             Units = dto.Units,
    //             Price = price
    //         });
    //     }

    //     return bookingFoodDrinks;
    // }

    public async Task<bool> CheckoutOfflineBookingAsync(int roomId, int bookingId, DateTime currentTime)
    {
        try
        {
            using (var conn = new SqlConnection(_context.Database.GetConnectionString()))
            using (var command = new SqlCommand("ExtendOfflineBookingTimeIfNeeded", conn))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@RoomId", roomId);
                command.Parameters.AddWithValue("@BookingId", bookingId);
                command.Parameters.AddWithValue("@CurrentTime", currentTime);

                await conn.OpenAsync();
                await command.ExecuteNonQueryAsync(); // chỉ chạy, không cần đọc gì

                return true; // thành công
            }
        }
        catch (Exception ex)
        {
            // Ghi log nếu cần: _logger.LogError(ex, "Checkout failed");
            throw new Exception("Có lỗi xảy ra khi thực hiện checkout: " + ex.Message);
        }
    }

    public async Task<List<Booking>> GetBookingsWithDetailsAsync(int bookingId)
    {
        return await _context.Bookings
            .Include(b => b.User) 
            .Include(b => b.Room)
            .Include(b => b.BookingTimes)
                .ThenInclude(bt => bt.RoomPricing)
            .Include(b => b.BookingFoodDrinks)
                .ThenInclude(bfd => bfd.FoodDrink) 
            .Where(b => bookingId == b.Id)
            .ToListAsync();
    }

//gây lỗi hoặc trả về rỗng nếu Entity Framework không thể dựng quan hệ navigation giữa Booking.User.FirebaseUid .Where(b => b.User.FirebaseUid == firebaseUid)

    public async Task<List<Booking>> GetAllBookingsByUserUidAsync(string firebaseUid)
    {
        System.Console.WriteLine("Firebase UID: " + firebaseUid);

        return await _context.Bookings
            .Where(b => _context.Users
                .Any(u => u.Id == b.UserId && u.FirebaseUid == firebaseUid))
            .Include(b => b.User)
            .Include(b => b.Room)
            .Include(b => b.BookingTimes)
                .ThenInclude(bt => bt.RoomPricing)
            .Include(b => b.BookingFoodDrinks)
                .ThenInclude(bfd => bfd.FoodDrink)
            .ToListAsync();
    }


}

// DTO để nhận dữ liệu BookingFoodDrink từ frontend
public class BookingFoodDrinkDto
{
    public int FoodDrinkId { get; set; }
    public int Units { get; set; }
}