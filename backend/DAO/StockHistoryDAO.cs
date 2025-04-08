using Microsoft.EntityFrameworkCore;

public class StockHistoryDao
{
    private readonly ApplicationDbContext _context;

    public StockHistoryDao(ApplicationDbContext context)
    {
        _context = context;
    }

    // Thêm lịch sử nhập kho
public async Task<StockHistory> AddStockHistory(string userUid, List<StockDetail> stockDetails)
{
    var user = await _context.Users.FirstOrDefaultAsync(u => u.FirebaseUid == userUid);
    if (user == null) throw new Exception("User not found");

    var stockHistory = new StockHistory
    {
        CreatedAt = DateTime.Now,
        CreatedBy = user.Id,
        StockDetails = new List<StockDetail>()
    };

    _context.StockHistories.Add(stockHistory);
    await _context.SaveChangesAsync(); // để có được stockHistory.Id trước

    foreach (var detail in stockDetails)
    {
        var foodDrink = await _context.FoodDrinks.FindAsync(detail.FoodDrinkId);
        if (foodDrink == null)
        {
            throw new Exception($"Sản phẩm với ID {detail.FoodDrinkId} không tồn tại.");
        }

        // Tạo mới StockDetail
        var newDetail = new StockDetail
        {
            FoodDrinkId = detail.FoodDrinkId,
            Quantity = detail.Quantity,
            StockHistoryId = stockHistory.Id
        };
        _context.StockDetails.Add(newDetail);

        // Cập nhật tồn kho
        foodDrink.Stock += detail.Quantity;
    }

    await _context.SaveChangesAsync();

    return stockHistory;
}


    // Cập nhật tồn kho sản phẩm
    public async Task IncreaseStock(int foodDrinkId, int quantity)
    {
        var foodDrink = await _context.FoodDrinks.FirstOrDefaultAsync(f => f.Id == foodDrinkId);
        if (foodDrink == null) throw new Exception("FoodDrink not found");

        foodDrink.Stock += quantity;
        await _context.SaveChangesAsync();
    }
}
