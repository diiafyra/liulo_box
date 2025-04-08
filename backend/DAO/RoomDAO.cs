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
        var currentDate = DateTime.Now; // Sử dụng giờ địa phương thay vì UTC
        var currentTimeOfDay = currentDate.TimeOfDay;
        System.Console.WriteLine("Current Date: " + currentDate);
        System.Console.WriteLine("Current Time: " + currentTimeOfDay);

        var rooms = await _context.Rooms
            .Where(r => r.isActive)
            .Select(r => new RoomViewModel
            {
                RoomId = r.Id,
                RoomNumber = r.RoomNumber,
                RoomCategoryName = r.RoomCategory.Name,
                CurrentPrice = r.RoomCategory.RoomPricing
                    .Where(p => p.TimeSlotDefinition.StartTime <= currentTimeOfDay &&
                               p.TimeSlotDefinition.EndTime >= currentTimeOfDay)
                    .OrderBy(p => p.TimeSlotDefinition.StartTime)
                    .Select(p => p.Price)
                    .FirstOrDefault(),
                CurrentIdPrice = r.RoomCategory.RoomPricing
                    .Where(p => p.TimeSlotDefinition.StartTime <= currentTimeOfDay &&
                               p.TimeSlotDefinition.EndTime >= currentTimeOfDay)
                    .OrderBy(p => p.TimeSlotDefinition.StartTime)
                    .Select(p => p.Id)
                    .FirstOrDefault(),
                BookingStatus = r.Bookings
                    .Where(b => b.BookingStatus == "Confirmed" &&
                               b.IsComplete == false &&
                               b.BookingTimes.Any(bt => bt.StartDate.Date == currentDate.Date &&
                                                       (bt.EndDate >= currentDate || bt.EndDate == null)))
                    .Select(b => b.BookingType)
                    .FirstOrDefault()
            })
            .ToListAsync();

        // Lấy tất cả booking online trong tương lai của ngày hiện tại
        var roomIds = rooms.Select(r => r.RoomId).ToList();
        var futureBookings = await _context.BookingTimes
            .Include(bt => bt.Booking)
            .Where(bt => bt.StartDate.Date == currentDate.Date &&
                         bt.EndDate > currentDate &&
                         roomIds.Contains(bt.Booking.RoomId) &&
                         bt.Booking.BookingType == "online" &&
                         bt.Booking.BookingStatus == "Confirmed" &&
                         !bt.Booking.IsComplete)
            .Select(bt => new
            {
                RoomId = bt.Booking.RoomId,
                BookingId = bt.BookingId,
                StartTime = bt.StartDate,
                EndTime = bt.EndDate
            })
            .ToListAsync();
        System.Console.WriteLine("Future Bookings: " + futureBookings.Count);

        // Gán vào từng phòng
        foreach (var room in rooms)
        {
            room.FutureOnlineBookings = futureBookings
                .Where(b => b.RoomId == room.RoomId)
                .Select(b => new FutureBookingViewModel
                {
                    BookingId = b.BookingId,
                    StartTime = b.StartTime,
                    EndTime = b.EndTime
                })
                .OrderBy(b => b.StartTime)
                .ToList();
        }

        return rooms;
    }

}
public class RoomViewModel
{
    public int RoomId { get; set; }
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