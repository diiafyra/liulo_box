using Microsoft.EntityFrameworkCore;

public class RoomPricingDAO
{
    private readonly ApplicationDbContext _context;

    public RoomPricingDAO(ApplicationDbContext context)
    {
        _context = context;
    }

    // Lấy giá theo RoomCategory và TimeSlot
    public async Task<List<RoomPricing>> GetPricingForRoomAsync(int roomCategoryId)
    {
        return await _context.RoomPricings
                             .Where(rp => rp.RoomCategoryId == roomCategoryId)
                             .Include(rp => rp.TimeSlotDefinition)
                             .ToListAsync();
    }
    public async Task<List<RoomPricing>> GetPricingForRoomAndDateAsync(int roomCategoryId, DateTime date)
    {
        string dayType = GetDayType(date); // weekday hoặc weekend

        var pricing = await _context.RoomPricings
            .Include(rp => rp.RoomCategory)
            .Include(rp => rp.TimeSlotDefinition)
                .ThenInclude(ts => ts.PriceConfigVersion)
            .Where(rp =>
                rp.RoomCategoryId == roomCategoryId &&
                rp.TimeSlotDefinition.DayType == dayType &&
                rp.TimeSlotDefinition.PriceConfigVersion.StartDate <= date &&
                (rp.TimeSlotDefinition.PriceConfigVersion.EndDate == null || rp.TimeSlotDefinition.PriceConfigVersion.EndDate >= date)
            )
            .ToListAsync();

        return pricing;
    }


    private string GetDayType(DateTime date)
    {
        // Nếu là cuối tuần, trả về "weekend", nếu không, trả về "weekday"
        return (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday) ? "weekend" : "weekday";
    }
}
