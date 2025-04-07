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


    // Lấy phòng theo ID
    public async Task<Room> GetRoomByIdAsync(int roomId)
    {
        return await _context.Rooms
            .Include(r => r.RoomCategory)
            .Include(r => r.RoomImages)
            .FirstOrDefaultAsync(r => r.Id == roomId);
            
    }
}
