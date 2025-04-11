using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class RoomDAO
{
    private readonly ApplicationDbContext _context;

    public RoomDAO(ApplicationDbContext context)
    {
        _context = context;
    }

    // Lấy tất cả các phòng
    public async Task<List<Room>> GetAllRoomsAsync()
    {
        return await _context.Rooms.Include(r => r.RoomCategory).ToListAsync();
    }

    public async Task<List<Room>> GetAllActiveRoomsAsync()
    {
        return await _context.Rooms
            .Where(r => r.isActive)
            .Include(r => r.RoomCategory)
            .Include(r => r.RoomImages.Where(ri => ri.IsMain))
            .ToListAsync();// Thực hiện truy vấn và trả về kết quả dưới dạng danh sách
    }
    public async Task<Room> FindAsync(int roomId)
    {
        return await _context.Rooms
            .FirstOrDefaultAsync(r => r.Id == roomId);
    }


    // Lấy phòng theo ID
    public async Task<Room> GetRoomByIdAsync(int roomId)
    {
        return await _context.Rooms
            .Include(r => r.RoomCategory)
            .Include(r => r.RoomImages)
            .FirstOrDefaultAsync(r => r.Id == roomId);

    }

public async Task<List<RoomViewModel>> GetActiveRoomsWithPricingAsync()
{
//     TimeSpan timeOfDay = TimeSpan.Parse("10:00");
// DateTime todayAt8AM = DateTime.Today + timeOfDay;

    var now =  DateTime.Now;
    var today = now.Date;
    var isWeekend = now.DayOfWeek == DayOfWeek.Saturday || now.DayOfWeek == DayOfWeek.Sunday;
    var dayType = isWeekend ? "weekend" : "weekday";

    var rooms = await _context.Rooms
        .Where(r => r.isActive)
        .Include(r => r.RoomCategory)
            .ThenInclude(rc => rc.RoomPricing)
                .ThenInclude(rp => rp.TimeSlotDefinition)
                    .ThenInclude(ts => ts.PriceConfigVersion)
        .Include(r => r.Bookings)
            .ThenInclude(b => b.BookingTimes)
        .ToListAsync();

    var result = rooms.Select(room =>
    {
        // Tìm khung giờ áp dụng hiện tại
        var matchingPrice = room.RoomCategory.RoomPricing
            .FirstOrDefault(rp =>
                rp.TimeSlotDefinition != null &&
                rp.TimeSlotDefinition.PriceConfigVersion != null &&
                rp.TimeSlotDefinition.PriceConfigVersion.StartDate <= now &&
                rp.TimeSlotDefinition.PriceConfigVersion.EndDate >= now &&
                rp.TimeSlotDefinition.StartTime <= now.TimeOfDay &&
                rp.TimeSlotDefinition.EndTime >= now.TimeOfDay &&
                rp.TimeSlotDefinition.DayType.ToLower() == dayType
            );

        // Tìm booking offline chưa hoàn thành (nếu có)
        var offlineBooking = room.Bookings
            .FirstOrDefault(b => b.BookingType == "offline" && !b.IsComplete);

        // Tính trạng thái phòng
        var isOnline = room.Bookings.Any(b =>
            b.BookingType == "online" &&
            b.BookingTimes.Any(bt => bt.StartDate <= now && bt.EndDate >= now));

        var bookingStatus = isOnline ? "online"
            : offlineBooking != null ? "offline"
            : "empty";

        // Booking online còn lại trong ngày
        var futureOnlineBookings = room.Bookings
            .Where(b => b.BookingType == "online" && b.BookingStatus == "Confirmed")
            .SelectMany(b => b.BookingTimes
                .Where(bt => bt.EndDate > now && bt.StartDate.Date == today)
                .Select(bt => new FutureBookingViewModel
                {
                    BookingId = b.Id,
                    StartTime = bt.StartDate,
                    EndTime = bt.EndDate
                }))
            .OrderBy(bt => bt.StartTime)
            .ToList();

        return new RoomViewModel
        {
            RoomId = room.Id,
            RoomNumber = room.RoomNumber,
            CategoryId = room.RoomCategoryId,
            RoomCategoryName = room.RoomCategory.Name,

            CurrentPrice = matchingPrice?.Price ?? 0,
            CurrentIdPrice = matchingPrice?.Id ?? 0,

            BookingId = offlineBooking?.Id ?? 0,
            BookingStatus = bookingStatus,
            FutureOnlineBookings = futureOnlineBookings
        };
    })
    .ToList();

    return result;
}


}
public class RoomViewModel
{
    public int RoomId { get; set; }
    public int CategoryId { get; set; }
    public int BookingId { get; set; }
    public string RoomNumber { get; set; }
    public string RoomCategoryName { get; set; }
    public decimal CurrentPrice { get; set; }
    public int CurrentIdPrice { get; set; }
    public string BookingStatus { get; set; } // "online", "offline", or null
    public List<FutureBookingViewModel> FutureOnlineBookings { get; set; } = new List<FutureBookingViewModel>();

}

public class FutureBookingViewModel
{
    public int BookingId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
}