using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Services;
using DAO;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Kết nối SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Cấu hình Firebase
builder.Services.AddSingleton<FirebaseService>();

builder.Services.AddControllers();

builder.Services.AddScoped<IUserDao, UserDao>();   // Đăng ký UserDao
builder.Services.AddScoped<RoomDAO>(); // Đăng ký RoomDAO
builder.Services.AddScoped<RoomPricingDAO>(); // Đăng ký RoomPricingDAO
builder.Services.AddScoped<BookingDAO>(); 
builder.Services.AddScoped<RoomCategoryDAO>(); // Đăng ký BookingDAO
builder.Services.AddScoped<FoodDrinkDAO>();


builder.Services.AddSingleton<EmailService>();

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer(options =>
    {
        options.Authority = "https://securetoken.google.com/liulobox";
        options.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidIssuer = "https://securetoken.google.com/liulobox",
            ValidateAudience = true,
            ValidAudience = "liulobox",
            ValidateLifetime = true
        };
    });

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true; // Tắt validation tự động
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder.WithOrigins("http://localhost:5173")  // Chỉ định nguồn của frontend
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials());  // Cho phép gửi chứng thực (cookies, token)
});



var app = builder.Build();
app.UseCors("AllowSpecificOrigin");  // Đảm bảo dùng policy đã thay đổi
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
