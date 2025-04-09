using Microsoft.AspNetCore.Mvc;
using DAO;
using Services;
using System;
using System.Threading.Tasks;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Authorization;

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
                    // Logic đăng ký với Google Auth
                    var decodedToken = await _firebaseService.VerifyTokenAsync(request.IdToken);
                    firebaseUid = decodedToken.Uid;
                    var googleEmail = decodedToken.Claims["email"]?.ToString();
                    var googleName = decodedToken.Claims["name"]?.ToString();

                    var existingUser = await _userDao.GetUserByFirebaseUidAsync(firebaseUid);
                    if (existingUser != null)
                    {
                        return Ok(new RegisterResponse { Message = "User already exists in SQL Server." });
                    }

                    var newPassword = GenerateRandomPassword();
                    await _firebaseService.UpdatePasswordAsync(firebaseUid, newPassword);

                    _emailService.SendEmail(googleEmail, "Your Password",
                        $"Dear {googleName}, Your password for email login is: {newPassword}. Use this with your Google email to log in.");

                    var user = new User
                    {
                        FirebaseUid = firebaseUid,
                        Username = googleName,
                        Email = googleEmail,
                        PhoneNumber = "",
                        IsEmailVerified = true
                    };

                    await _userDao.AddUserAsync(user);
                    if (!decodedToken.Claims.ContainsKey("role"))
                    {
                        await _firebaseService.SetUserRoleAsync(firebaseUid, "user");
                    }

                    return Ok(new RegisterResponse { FirebaseUid = firebaseUid, Message = "User registered successfully. Please check your email for the password." });
                }
                else
                {
                    // Logic đăng ký với thông tin người dùng tự nhập
                    if (string.IsNullOrEmpty(request.Username))
                        return BadRequest(new { Message = "Username is required" });

                    if (string.IsNullOrEmpty(request.Email))
                        return BadRequest(new { Message = "Email is required for non-Google registration" });

                    if (string.IsNullOrEmpty(request.Password))
                        return BadRequest(new { Message = "Password is required for non-Google registration" });

                    firebaseUid = await _firebaseService.CreateUserAsync(request.Email, request.Password);
                    System.Console.WriteLine($"[🔥 AuthController] Firebase UID: {firebaseUid}");
                    try
                    {
                        var verificationCode = GenerateRandomPassword();

                        // Nối uid và mã xác minh, phân cách bằng "|"
                        var combined = $"{firebaseUid}|{verificationCode}";

                        // Mã hóa Base64 để an toàn cho URL
                        byte[] combinedBytes = System.Text.Encoding.UTF8.GetBytes(combined);
                        var encodedCode = Convert.ToBase64String(combinedBytes)
                            .Replace("+", "-")
                            .Replace("/", "_")
                            .Replace("=", "");

                        // Tạo link xác minh
                        System.Console.WriteLine($"[🔥 AuthController] Verification link: http://localhost:5220/api/auth/verify-email?code={encodedCode}");
                        var verificationLink = $"http://localhost:5220/api/auth/verify-email?code={encodedCode}";
                        _emailService.SendEmail(request.Email, "Xác minh Email của bạn",
                            $"Nhấn vào đây để xác minh: <a href='{verificationLink}'>Xác minh</a>");
                        System.Console.WriteLine($"[🔥 AuthController] Verification link sent to email: {request.Email}");
                        var user = new User
                        {
                            FirebaseUid = firebaseUid,
                            Username = request.Username,
                            Email = request.Email,
                            PhoneNumber = request.PhoneNumber,
                            IsEmailVerified = false
                        };
                        System.Console.WriteLine($"[🔥 AuthController] User object: {user}");

                        await _userDao.AddUserAsync(user);
                        await _firebaseService.SetUserRoleAsync(firebaseUid, "user");
                        System.Console.WriteLine($"[🔥 AuthController] User role set to 'user' for UID: {firebaseUid}");
                        return Ok(new RegisterResponse { FirebaseUid = firebaseUid, Message = "Registration successful, please check your email for verification" });
                    }
                    catch (Exception dbEx)
                    {
                        await _firebaseService.DeleteUserAsync(firebaseUid);
                        return StatusCode(500, new { Message = "Failed to save user to database", Error = dbEx.Message });
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Registration failed", Error = ex.Message });
            }
        }

        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail(string code)
        {
            if (string.IsNullOrEmpty(code))
                return BadRequest(new { Message = "Mã xác minh là bắt buộc" });

            try
            {
                // Giải mã Base64
                string base64 = code.Replace("-", "+").Replace("_", "/");
                int padding = (4 - base64.Length % 4) % 4;
                base64 = base64.PadRight(base64.Length + padding, '=');
                byte[] combinedBytes = Convert.FromBase64String(base64);
                string combined = System.Text.Encoding.UTF8.GetString(combinedBytes);

                // Tách uid và mã xác minh
                var parts = combined.Split('|');
                if (parts.Length != 2)
                    return BadRequest(new { Message = "Mã xác minh không hợp lệ" });

                var firebaseUid = parts[0];
                // parts[1] là verificationCode, nhưng ta không cần kiểm tra vì chỉ cần uid là đủ

                var user = await _userDao.GetUserByFirebaseUidAsync(firebaseUid);
                if (user == null)
                    return NotFound(new { Message = "Không tìm thấy người dùng" });

                if (user.IsEmailVerified)
                    return Ok(new { Message = "Email đã được xác minh trước đó" });

                user.IsEmailVerified = true;
                await _userDao.UpdateUserAsync(user);
                return Ok(new { Message = "Email đã được xác minh" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi xác minh email", Error = ex.Message });
            }
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

                var role = await _firebaseService.GetUserRoleAsync(user.FirebaseUid); // Lấy quyền từ Firebase (nếu có)
                return Ok(new { Uid = user.FirebaseUid, Username = user.Username, Role = role });
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

        // [Authorize(Roles = "staff")] // 👈 staff mới được tạo user
        [HttpPost("create-user")]
        public async Task<IActionResult> CreateUser([FromBody] RegisterRequest request)
        {
            try
            {
                var registerResponse = await Register(request);

                if (registerResponse is OkObjectResult okResult &&
                    okResult.Value is RegisterResponse responseValue)
                {
                    var firebaseUid = responseValue.FirebaseUid;

                    // Đặt role cho người mới (ở đây là staff)
                    await _firebaseService.SetUserRoleAsync(firebaseUid, "staff");

                    return Ok(new { Message = "User created successfully and role assigned." });
                }

                return BadRequest(new { Message = "Failed to register user." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Failed to create user", Error = ex.Message });
            }
        }
        // Trong AuthController.cs, thêm endpoint mới
        [HttpPost("verify-customer")]
        public async Task<IActionResult> VerifyCustomer([FromBody] VerifyCustomerRequest request)
        {
            try
            {
                var existingUser = await _userDao.GetUserByPhoneNumberAsync(request.PhoneNumber);

                if (existingUser != null)
                {
                    return Ok(new VerifyCustomerResponse
                    {
                        UserId = existingUser.Id, // Trả về UserId
                        IsExistingUser = true,
                        Username = existingUser.Username,
                        Email = existingUser.Email,
                        PhoneNumber = existingUser.PhoneNumber,
                    });
                }
                else
                {
                    var firebaseUid = $"offline_{Guid.NewGuid()}";
                    var newUser = new User
                    {
                        FirebaseUid = firebaseUid,
                        Username = request.Name,
                        Email = $"offline_{request.PhoneNumber}@example.com",
                        PhoneNumber = request.PhoneNumber,
                        IsEmailVerified = false,
                        IsActive = true
                    };

                    await _userDao.AddUserAsync(newUser);

                    return Ok(new VerifyCustomerResponse
                    {
                        UserId = newUser.Id, // Trả về UserId sau khi thêm thành công
                        IsExistingUser = false,
                        Username = newUser.Username,
                        Email = newUser.Email,
                        PhoneNumber = newUser.PhoneNumber,
                        Message = "New offline user created successfully"
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error verifying customer", Error = ex.Message });
            }
        }


        // Thêm các class request/response
        public class VerifyCustomerRequest
        {
            public string Name { get; set; }
            public string PhoneNumber { get; set; }
        }

        public class VerifyCustomerResponse
        {
            public int UserId { get; set; }              // Thêm dòng này
            public bool IsExistingUser { get; set; }
            public string Username { get; set; }
            public string Email { get; set; }
            public string PhoneNumber { get; set; }
            public string Message { get; set; }
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
    public class RegisterResponse
    {
        public string FirebaseUid { get; set; }
        public string Message { get; set; }
    }

}