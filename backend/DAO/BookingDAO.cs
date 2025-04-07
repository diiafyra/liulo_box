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
}
