using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

public class FoodDrinkDAO
{
    private readonly ApplicationDbContext _context;

    public FoodDrinkDAO(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<FoodDrink>> GetAllAsync()
    {
        return await _context.FoodDrinks.ToListAsync();
    }

    public async Task<List<FoodDrink>> GetByCategoryAsync(string category)
    {
        return await _context.FoodDrinks
            .Where(fd => fd.Category.ToLower() == category.ToLower())
            .ToListAsync();
    }

    public async Task<List<FoodDrink>> GetRemainByCategoryAsync(string category)
{
    return await _context.FoodDrinks
        .Where(fd => fd.Category.ToLower() == category.ToLower() && fd.Stock > 0)
        .ToListAsync();
}


    public async Task<FoodDrink> GetByIdAsync(int id)
    {
        return await _context.FoodDrinks.FindAsync(id);
    }

    public async Task AddAsync(FoodDrink item)
    {
        _context.FoodDrinks.Add(item);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(FoodDrink item)
    {
        _context.FoodDrinks.Update(item);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var item = await _context.FoodDrinks.FindAsync(id);
        if (item != null)
        {
            _context.FoodDrinks.Remove(item);
            await _context.SaveChangesAsync();
        }
    }
}
