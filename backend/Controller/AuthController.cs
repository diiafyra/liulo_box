using Microsoft.AspNetCore.Mvc;
using DAO;
using Services;
using System;
using System.Threading.Tasks;
using FirebaseAdmin.Auth;

namespace Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly FirebaseService _firebaseService;
        private readonly IUserDao _userDao;
        private readonly EmailService _emailService;

        public AuthController(FirebaseService firebaseService, IUserDao userDao, EmailService emailService)
        {
            _firebaseService = firebaseService;
            _userDao = userDao;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            string firebaseUid;
            try
            {
                if (request.IsGoogleAuth)
                {
                    System.Console.WriteLine("Google Auth");
                    // Xác thực token Google
                    var decodedToken = await _firebaseService.VerifyTokenAsync(request.IdToken);
                    firebaseUid = decodedToken.Uid;
                    var googleEmail = decodedToken.Claims["email"]?.ToString();
                    var googleName = decodedToken.Claims["name"]?.ToString();

                    var existingUser = await _userDao.GetUserByFirebaseUidAsync(firebaseUid);
                    if (existingUser != null)
                    {
                        // Nếu người dùng đã tồn tại trong SQL Server, trả về thông báo
                        return Ok(new { Message = "User already exists in SQL Server." });
                    }
                    // Tạo mật khẩu ngẫu nhiên
                    var newPassword = GenerateRandomPassword();

                    // Lưu người dùng vào Firebase với email Google và mật khẩu ngẫu nhiên
                    await _firebaseService.UpdatePasswordAsync(firebaseUid, newPassword);

                    // Gửi email chứa mật khẩu cho người dùng
                    _emailService.SendEmail(googleEmail, "Your Password",
                        $"Dear {googleName}, Your password for email login is: {newPassword}. Use this with your Google email to log in.");

                    // Lưu thông tin người dùng vào database
                    var user = new User
                    {
                        FirebaseUid = firebaseUid,
                        Username = googleName,
                        Email = googleEmail,
                        PhoneNumber = "",
                        IsEmailVerified = true // Google Auth tự động xác minh email
                    };

                    await _userDao.AddUserAsync(user);

                    return Ok(new { Message = "User registered successfully. Please check your email for the password." });
                }
                else
                {
                    if (string.IsNullOrEmpty(request.Username))
                        return BadRequest(new { Message = "Username is required" });

                    if (string.IsNullOrEmpty(request.Email))
                        return BadRequest(new { Message = "Email is required for non-Google registration" });
                    if (string.IsNullOrEmpty(request.Password))
                        return BadRequest(new { Message = "Password is required for non-Google registration" });

                    // Tạo người dùng trong Firebase với email và mật khẩu từ form
                    firebaseUid = await _firebaseService.CreateUserAsync(request.Email, request.Password);

                    try
                    {
                        // Tạo custom token và gửi email xác minh
                        var idToken = await FirebaseAuth.DefaultInstance.CreateCustomTokenAsync(firebaseUid);
                        _emailService.SendEmail(request.Email, "Verify Your Email",
                            $"Click to verify: <a href='http://localhost:5220/api/auth/verify-email?idToken={idToken}'>Verify</a>");

                        // Lưu thông tin người dùng vào database
                        var user = new User
                        {
                            FirebaseUid = firebaseUid,
                            Username = request.Username,
                            Email = request.Email,
                            PhoneNumber = request.PhoneNumber,
                            IsEmailVerified = false
                        };

                        await _userDao.AddUserAsync(user);
                    }
                    catch (Exception dbEx)
                    {
                        // Nếu lưu database thất bại, xóa người dùng trên Firebase
                        await _firebaseService.DeleteUserAsync(firebaseUid);
                        return StatusCode(500, new { Message = "Failed to save user to database", Error = dbEx.Message });
                    }

                    return Ok(new { Message = "Registration successful, please check your email for verification" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Registration failed", Error = ex.Message });
            }
        }

        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail(string idToken)
        {
            var decodedToken = await _firebaseService.VerifyTokenAsync(idToken);
            var user = await _userDao.GetUserByFirebaseUidAsync(decodedToken.Uid);
            if (user == null) return NotFound();

            user.IsEmailVerified = true;
            await _userDao.UpdateUserAsync(user);
            return Ok(new { Message = "Email verified" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var decodedToken = await _firebaseService.VerifyTokenAsync(request.IdToken);
                var user = await _userDao.GetUserByFirebaseUidAsync(decodedToken.Uid);
                if (user == null || !user.IsEmailVerified)
                    return Unauthorized(new { Message = "Invalid credentials or email not verified" });

                return Ok(new { Uid = user.FirebaseUid, Username = user.Username });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error during login", Error = ex.Message });
            }
        }

        private string GenerateRandomPassword()
        {
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 8).Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }

    public class RegisterRequest
    {
        public string IdToken { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public bool IsGoogleAuth { get; set; }
    }

    public class LoginRequest
    {
        public string IdToken { get; set; }
    }
}