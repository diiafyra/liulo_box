namespace DTO
{
    // DTOs liên quan đến xác minh khách hàng (Customer Verification)
    /// <summary>
    /// Yêu cầu xác minh thông tin khách hàng dựa trên tên và số điện thoại.
    /// </summary>
    public class VerifyCustomerRequest
    {
        public string Name { get; set; }
        public string PhoneNumber { get; set; }
    }

    /// <summary>
    /// Phản hồi từ quá trình xác minh khách hàng.
    /// </summary>
    public class VerifyCustomerResponse
    {
        public int UserId { get; set; }
        public bool IsExistingUser { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Message { get; set; }
    }

    // DTOs liên quan đến đăng ký (Registration)
    /// <summary>
    /// Yêu cầu đăng ký người dùng (hỗ trợ Google Auth hoặc Email/Password).
    /// </summary>
    public class RegisterRequest
    {
        public string IdToken { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public bool IsGoogleAuth { get; set; }
    }

    /// <summary>
    /// Phản hồi từ quá trình đăng ký người dùng.
    /// </summary>
    public class RegisterResponse
    {
        public string FirebaseUid { get; set; }
        public string Message { get; set; }
    }

    // DTOs liên quan đến đăng nhập (Login)
    /// <summary>
    /// Yêu cầu đăng nhập sử dụng IdToken (Google Auth).
    /// </summary>
    public class LoginRequest
    {
        public string IdToken { get; set; }
    }
}