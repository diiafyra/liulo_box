using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<RoomCategory> RoomCategories { get; set; }
    public DbSet<PriceConfigVersion> PriceConfigVersions { get; set; }
    public DbSet<TimeSlotDefinition> TimeSlotDefinitions { get; set; }
    public DbSet<RoomPricing> RoomPricings { get; set; }
    public DbSet<Room> Rooms { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<BookingFoodDrink> BookingFoodDrinks { get; set; }
    public DbSet<FoodDrink> FoodDrinks { get; set; }
    public DbSet<Rules> Rules { get; set; }
    public DbSet<RoomImage> RoomImages { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<BookingTime> BookingTimes { get; set; }
    public DbSet<StockHistory> StockHistories { get; set; } // Thêm dòng này
    public DbSet<StockDetail> StockDetails { get; set; }

    // Configure relationships using Fluent API if needed
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure RoomPricing - Many-to-One Relationship with RoomCategory and TimeSlotDefinition

        modelBuilder.Entity<RoomPricing>()
            .HasOne(rp => rp.RoomCategory)
            .WithMany(rc => rc.RoomPricing)
            .HasForeignKey(rp => rp.RoomCategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RoomPricing>()
            .HasOne(rp => rp.TimeSlotDefinition)
            .WithMany()
            .HasForeignKey(rp => rp.TimeSlotDefinitionId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure Booking - Many-to-One Relationship with User and Room
        modelBuilder.Entity<Booking>()
            .HasOne(b => b.User)
            .WithMany(u => u.Bookings)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Room)
            .WithMany(r => r.Bookings)
            .HasForeignKey(b => b.RoomId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure BookingTime - Many-to-One Relationship with Booking and RoomPricing
        modelBuilder.Entity<BookingTime>()
            .HasOne(bt => bt.Booking)
            .WithMany(b => b.BookingTimes)
            .HasForeignKey(bt => bt.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BookingTime>()
            .HasOne(bt => bt.RoomPricing)
            .WithMany()
            .HasForeignKey(bt => bt.PriceId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure BookingFoodDrink - Many-to-One Relationship with Booking and FoodDrink
        modelBuilder.Entity<BookingFoodDrink>()
            .HasOne(bfd => bfd.Booking)
            .WithMany(b => b.BookingFoodDrinks)
            .HasForeignKey(bfd => bfd.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BookingFoodDrink>()
            .HasOne(bfd => bfd.FoodDrink)
            .WithMany()
            .HasForeignKey(bfd => bfd.FoodDrinkId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure RoomImage - Many-to-One Relationship with Room
        modelBuilder.Entity<RoomImage>()
            .HasOne(ri => ri.Room)
            .WithMany(r => r.RoomImages)
            .HasForeignKey(ri => ri.RoomId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure User - One-to-Many Relationship with Booking
        modelBuilder.Entity<User>()
            .HasMany(u => u.Bookings)
            .WithOne(b => b.User)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Mối quan hệ giữa StockHistory và User
        modelBuilder.Entity<StockHistory>()
            .HasOne(sh => sh.User)
            .WithMany(u => u.StockHistories)
            .HasForeignKey(sh => sh.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict); // Khi xóa user, không xóa StockHistory

        // Mối quan hệ giữa StockDetail và StockHistory
        modelBuilder.Entity<StockDetail>()
            .HasOne(sd => sd.StockHistory)
            .WithMany(sh => sh.StockDetails)
            .HasForeignKey(sd => sd.StockHistoryId)
            .OnDelete(DeleteBehavior.Cascade); // Xóa StockDetail khi StockHistory bị xóa

        // Mối quan hệ giữa StockDetail và FoodDrink
        modelBuilder.Entity<StockDetail>()
            .HasOne(sd => sd.FoodDrink)
            .WithMany()
            .HasForeignKey(sd => sd.FoodDrinkId)
            .OnDelete(DeleteBehavior.Cascade); // Xóa StockDetail khi FoodDrink bị xóa

    }
}
