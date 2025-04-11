using Microsoft.AspNetCore.Mvc;
using DAO;
using Services;
using System;
using System.Threading.Tasks;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Authorization;
using DTO;
namespace Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly FirebaseService _firebaseService;
        private readonly IUserDao _userDao;
        private readonly EmailService _emailService;

        public AuthController(FirebaseService firebaseService, IUserDao userDao, EmailService emailService, IAuthService authService)
        {
            _authService = authService;
            _firebaseService = firebaseService;
            _userDao = userDao;
            _emailService = emailService;
        }

        // Đăng ký người dùng mới
        // Nếu là Google Auth, thì chỉ cần lấy uid từ token và gửi email cho người dùng với mật khẩu ngẫu nhiên
        // Nếu không phải Google Auth, thì tạo tài khoản mới với thông tin người dùng tự nhập và gửi email xác minh
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            System.Console.WriteLine("Register request: " + request.ToString());
            try
            {
                var response = await _authService.RegisterAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Registration failed", Error = ex.Message });
            }
        }
        // Xác minh email
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

        // Đăng nhập người dùng
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

        [Authorize(Roles = "staff")] // staff mới được tạo user
        [HttpPost("create-user")]
        public async Task<IActionResult> CreateUser([FromBody] RegisterRequest request)
        {
            System.Console.WriteLine("Create user request: " + request.ToString());
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
        // Xác minh khách hàng
        // Dùng trong giao diên staff lúc đặt phòng cho khách off
        // Nếu khách hàng đã có trong hệ thống thì trả về thông tin của họ
        // Nếu chưa có thì tạo mới một tài khoản offline với uid là offline_{guid}
        [Authorize(Roles = "staff")] // staff mới được tạo user
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


        // Thêm các class request/respons

    }
}