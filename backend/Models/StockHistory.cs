public class StockHistory
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    // Khóa ngoại đến User (người tạo)
    public int CreatedBy { get; set; } // Lấy từ token header (FirebaseUid)

    // Liên kết với bảng StockDetail (1:N)
    public ICollection<StockDetail> StockDetails { get; set; } = new List<StockDetail>();

    // Mối quan hệ với User
    public User User { get; set; }
}
