using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc;

[Microsoft.AspNetCore.Mvc.Route("api/[controller]")]
[ApiController]
public class PriceConfigController : ControllerBase
{
    private readonly RoomCategoryDAO _roomCategoryDAO;

    public PriceConfigController(RoomCategoryDAO roomCategoryDAO)
    {
        _roomCategoryDAO = roomCategoryDAO;
    }

    // API lấy tất cả các RoomCategory
[HttpGet("getcategories")]
public async Task<ActionResult<IEnumerable<RoomCategory>>> GetRoomCategories()
{
    var roomCategories = await _roomCategoryDAO.GetAllRoomCategoriesAsync();

    if (roomCategories == null || !roomCategories.Any())
    {
        return NotFound("No room categories found.");
    }

    // Đảm bảo thông tin trả về đầy đủ
    var result = roomCategories.Select(rc => new 
    {
        rc.Id,
        rc.Name,
        rc.Description,
        rc.MaxCapacity,
        rc.Url,
        RoomPricing = rc.RoomPricing.Select(rp => new 
        {
            rp.Price,
            TimeSlot = new 
            {
                rp.TimeSlotDefinition.DayType,
                rp.TimeSlotDefinition.StartTime,
                rp.TimeSlotDefinition.EndTime
            }
        })
    });

    return Ok(result);
}

}
