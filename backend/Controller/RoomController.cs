using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class RoomController : ControllerBase
{
    private readonly RoomDAO _roomDAO;
    private readonly RoomPricingDAO _roomPricingDAO;
    private readonly BookingDAO _bookingDAO;

    // Constructor
    public RoomController(RoomDAO roomDAO, RoomPricingDAO roomPricingDAO, BookingDAO bookingDAO)
    {
        _roomDAO = roomDAO;
        _roomPricingDAO = roomPricingDAO;
        _bookingDAO = bookingDAO;
    }

    // Lấy danh sách tất cả phòng
    [HttpGet]
    public async Task<ActionResult<List<Room>>> GetActiveRooms()
    {
        var rooms = await _roomDAO.GetAllActiveRoomsAsync();
        return Ok(rooms);
    }

    // Lấy phòng theo ID
    [HttpGet("{roomId}")]
    public async Task<ActionResult<Room>> GetRoom(int roomId)
    {
        var room = await _roomDAO.GetRoomByIdAsync(roomId);
        if (room == null)
        {
            return NotFound("Không tìm thấy phòng.");
        }
        return Ok(room);
    }

    // Lấy giá phòng theo RoomCategory và TimeSlot
    [HttpGet("pricing/{roomCategoryId}")]
    public async Task<ActionResult<List<RoomPricing>>> GetRoomPricing(int roomCategoryId)
    {
        var pricing = await _roomPricingDAO.GetPricingForRoomAsync(roomCategoryId);
        if (pricing == null || !pricing.Any())
        {
            return NotFound("Không tìm thấy giá cho phòng này.");
        }
        return Ok(pricing);
    }

[HttpGet("pricing/{roomCategoryId}/{date}")]
public async Task<ActionResult<List<RoomPricing>>> GetRoomPricingByDate(int roomCategoryId, DateTime date)
{
    var pricing = await _roomPricingDAO.GetPricingForRoomAndDateAsync(roomCategoryId, date);
    if (pricing == null || !pricing.Any())
    {
        return NotFound("Không tìm thấy giá cho phòng này.");
    }
    return Ok(pricing);
}



    [HttpGet("booked/{roomId}")]
    public async Task<ActionResult<List<BookingTime>>> GetBookedTimes(int roomId, DateTime date)
    {
        var bookedTimes = await _bookingDAO.GetBookedTimesAsync(roomId, date);

        return Ok(bookedTimes);
    }

}
