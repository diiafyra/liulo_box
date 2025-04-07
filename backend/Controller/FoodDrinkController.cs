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

    [HttpGet]
    public async Task<ActionResult<List<FoodDrink>>> GetAll()
    {
        return await _dao.GetAllAsync();
    }

    [HttpGet("{category}")]
    public async Task<ActionResult<List<FoodDrink>>> GetRemainByCategory(string category)
    {
        var result = await _dao.GetByCategoryAsync(category);
        if (result == null || result.Count == 0)
            return NotFound();
        return result;
    }

    [HttpGet("byid/{id}")]
    public async Task<ActionResult<FoodDrink>> GetById(int id)
    {
        var item = await _dao.GetByIdAsync(id);
        if (item == null)
            return NotFound();
        return item;
    }

    [HttpPost]
    public async Task<IActionResult> Create(FoodDrink item)
    {
        await _dao.AddAsync(item);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

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

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _dao.GetByIdAsync(id);
        if (existing == null)
            return NotFound();

        await _dao.DeleteAsync(id);
        return NoContent();
    }
}
