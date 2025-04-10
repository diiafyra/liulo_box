using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class FoodDrinkController : ControllerBase
{
    private readonly FoodDrinkDAO _dao;

    public FoodDrinkController(FoodDrinkDAO dao)
    {
        _dao = dao;
    }

    /// Lấy danh sách tất cả món ăn và đồ uống
    /// Dùng trong giao diện staff nhập kho
    [HttpGet]
    public async Task<ActionResult<List<FoodDrink>>> GetAll()
    {
        return await _dao.GetAllAsync();
    }

    /// Lấy danh sách theo đồ ăn và đồ uống
    /// Dùng trong giao diện khách và staff khi mua hàng
    [HttpGet("{category}")]
    public async Task<ActionResult<List<FoodDrink>>> GetRemainByCategory(string category)
    {
        var result = await _dao.GetByCategoryAsync(category);
        if (result == null || result.Count == 0)
            return NotFound();
        return result;
    }
    /// Lấy món ăn và đồ uống theo ID 
    /// dùng trong giao diện khách khi xem chi tiết
    [HttpGet("byid/{id}")]
    public async Task<ActionResult<FoodDrink>> GetById(int id)
    {
        var item = await _dao.GetByIdAsync(id);
        if (item == null)
            return NotFound();
        return item;
    }

    // Thêm món ăn và đồ uống mới
    [HttpPost]
    [Authorize(Roles = "staff")] // Chỉ cho phép người dùng có vai trò "staff" thực hiện yêu cầu này
    public async Task<IActionResult> Create([FromBody] FoodDrinkCreateDto dto)
    {
        if (dto == null)
            return BadRequest("Dữ liệu không hợp lệ.");

        // Ánh xạ từ DTO sang entity
        var foodDrink = new FoodDrink
        {
            Name = dto.Name,
            Price = dto.Price,
            Description = dto.Description,
            Category = dto.Category,
            ImageUrl = dto.ImageUrl,
            Stock = 0 // Khởi tạo tồn kho về 0
        };

        await _dao.AddAsync(foodDrink);
        return CreatedAtAction(nameof(GetById), new { id = foodDrink.Id }, foodDrink);
    }

    // Nhập kho món ăn và đồ uống
    [Authorize(Roles = "staff")] // Chỉ cho phép người dùng có vai trò "staff" thực hiện yêu cầu này
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, FoodDrink updated)
    {
        if (id != updated.Id)
            return BadRequest();

        var existing = await _dao.GetByIdAsync(id);
        if (existing == null)
            return NotFound();

        await _dao.UpdateAsync(updated);
        return NoContent();
    }

    // [HttpDelete("{id}")]
    // public async Task<IActionResult> Delete(int id)
    // {
    //     var existing = await _dao.GetByIdAsync(id);
    //     if (existing == null)
    //         return NotFound();

    //     await _dao.DeleteAsync(id);
    //     return NoContent();
    // }
}
public class FoodDrinkCreateDto
{
    public string Name { get; set; }
    public decimal Price { get; set; }
    public string Description { get; set; }
    public string Category { get; set; }
    public string ImageUrl { get; set; }
}
