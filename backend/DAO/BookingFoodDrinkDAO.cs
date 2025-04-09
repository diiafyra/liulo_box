using Microsoft.EntityFrameworkCore;

public class BookingFoodDrinkDAO
{
    private readonly ApplicationDbContext _context;

    public BookingFoodDrinkDAO(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddOrUpdateBookingFoodDrinksAsync(int bookingId, List<BookingFoodDrinkDto> foodDrinkDtos)
    {
        foreach (var dto in foodDrinkDtos.Where(d => d.Units > 0)) // Chỉ xử lý các mục có số lượng > 0
        {
            var foodDrink = await _context.FoodDrinks.FindAsync(dto.FoodDrinkId);
            if (foodDrink == null)
            {
                throw new Exception($"Không tìm thấy món ăn/uống với ID {dto.FoodDrinkId}.");
            }

            if (foodDrink.Stock < dto.Units)
            {
                throw new Exception($"Kho không đủ cho món ăn/uống ID {dto.FoodDrinkId}. Còn lại: {foodDrink.Stock}, Yêu cầu: {dto.Units}");
            }

            // Kiểm tra xem món ăn/uống này đã có trong booking chưa
            var existingFoodDrink = await _context.BookingFoodDrinks
                .FirstOrDefaultAsync(bfd => bfd.BookingId == bookingId && bfd.FoodDrinkId == dto.FoodDrinkId);

            if (existingFoodDrink != null)
            {
                // Cập nhật mục hiện có
                existingFoodDrink.Units += dto.Units;
                existingFoodDrink.Price = foodDrink.Price * existingFoodDrink.Units; // Cập nhật tổng giá
            }
            else
            {
                // Thêm mục mới
                var newBookingFoodDrink = new BookingFoodDrink
                {
                    BookingId = bookingId,
                    FoodDrinkId = dto.FoodDrinkId,
                    Units = dto.Units,
                    Price = foodDrink.Price * dto.Units
                };
                _context.BookingFoodDrinks.Add(newBookingFoodDrink);
            }

            // Giảm kho
            foodDrink.Stock -= dto.Units;
        }

        await _context.SaveChangesAsync();
    }

    private async Task DecreaseStockAsync(int foodDrinkId, int quantity)
    {
        var foodDrink = await _context.FoodDrinks.FirstOrDefaultAsync(f => f.Id == foodDrinkId);
        if (foodDrink == null) throw new Exception($"Không tìm thấy món ăn/uống với ID {foodDrinkId}.");
        if (foodDrink.Stock < quantity) throw new Exception($"Kho không đủ cho món ăn/uống ID {foodDrinkId}.");
        
        foodDrink.Stock -= quantity;
        await _context.SaveChangesAsync();
    }

    // Phương thức phụ để tăng kho (nếu cần dùng ở nơi khác)
    public async Task IncreaseStockAsync(int foodDrinkId, int quantity)
    {
        var foodDrink = await _context.FoodDrinks.FirstOrDefaultAsync(f => f.Id == foodDrinkId);
        if (foodDrink == null) throw new Exception($"Không tìm thấy món ăn/uống với ID {foodDrinkId}.");

        foodDrink.Stock += quantity;
        await _context.SaveChangesAsync();
    }

}