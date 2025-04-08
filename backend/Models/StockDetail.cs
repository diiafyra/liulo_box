public class StockDetail
{
    public int Id { get; set; }
    public int StockHistoryId { get; set; }
    public StockHistory StockHistory { get; set; }

    public int FoodDrinkId { get; set; }
    public FoodDrink FoodDrink { get; set; }

    public int Quantity { get; set; }
}