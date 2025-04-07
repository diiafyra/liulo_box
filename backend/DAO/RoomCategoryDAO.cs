using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

public class RoomCategoryDAO
{
    private readonly ApplicationDbContext _context;

    public RoomCategoryDAO(ApplicationDbContext context)
    {
        _context = context;
    }

public async Task<List<RoomCategory>> GetAllRoomCategoriesAsync()
{
    var roomCategories = await _context.RoomCategories
        .Include(rc => rc.RoomPricing)  // Liên kết RoomPricing
        .ThenInclude(rp => rp.TimeSlotDefinition)  // Liên kết TimeSlotDefinition
        .Where(rc => rc.RoomPricing.Any())  // Lọc chỉ các phòng có thông tin giá
        .ToListAsync();

    return roomCategories;
}



    // Lấy thông tin RoomCategory theo Id
    public async Task<RoomCategory> GetRoomCategoryByIdAsync(int id)
    {
        return await _context.RoomCategories
                             .Where(rc => rc.Id == id)
                             .FirstOrDefaultAsync();
    }
}
