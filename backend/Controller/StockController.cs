using DAO;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class StockController : ControllerBase
{
    private readonly StockHistoryDao _stockHistoryDao;
    private readonly FoodDrinkDAO _foodDrinkDao;
    private readonly IUserDao _userDao;

    public StockController(
        StockHistoryDao stockHistoryDao,
        FoodDrinkDAO foodDrinkDao,
        IUserDao userDao)
    {
        _stockHistoryDao = stockHistoryDao;
        _foodDrinkDao = foodDrinkDao;
        _userDao = userDao;
    }

    public class StockRequest
    {
        public List<StockDetailDto> Items { get; set; }
    }

    public class StockDetailDto
    {
        public int FoodDrinkId { get; set; }
        public int Quantity { get; set; }
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddStockAndHistory([FromBody] StockRequest request)
    {
        // Lấy FirebaseUid từ Claims đã được gán bởi RoleMiddleware
        var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(firebaseUid))
        {
            return Unauthorized("Không tìm thấy thông tin người dùng trong token.");
        }

        // Kiểm tra dữ liệu request
        if (request == null || request.Items == null || request.Items.Count == 0)
        {
            return BadRequest("Dữ liệu không hợp lệ.");
        }

        // Kiểm tra người dùng
        var user = await _userDao.GetUserByFirebaseUidAsync(firebaseUid);
        if (user == null)
        {
            return NotFound("Người dùng không tồn tại.");
        }

        // Tạo danh sách StockDetail
        var stockDetails = new List<StockDetail>();
        foreach (var item in request.Items)
        {
            var foodDrink = await _foodDrinkDao.GetByIdAsync(item.FoodDrinkId);
            if (foodDrink == null)
            {
                return NotFound($"Sản phẩm với ID {item.FoodDrinkId} không tồn tại.");
            }

            stockDetails.Add(new StockDetail
            {
                FoodDrinkId = item.FoodDrinkId,
                Quantity = item.Quantity
            });
        }

        // Gọi DAO xử lý nhập kho + cập nhật tồn kho + tạo lịch sử
        var stockHistory = await _stockHistoryDao.AddStockHistory(firebaseUid, stockDetails);

        return Ok(new
        {
            Message = "Nhập kho thành công.",
            StockHistoryId = stockHistory.Id,
            CreatedAt = stockHistory.CreatedAt
        });
    }

    [HttpGet("test")]
    public IActionResult Test()
    {
        return Ok("Routing OK");
    }
}