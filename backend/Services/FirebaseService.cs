using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using System;
using System.Threading.Tasks;

namespace Services
{
    public class FirebaseService
    {
        private readonly FirebaseAuth _firebaseAuth;

        public FirebaseService()
        {
            if (FirebaseApp.DefaultInstance == null)
            {
                FirebaseApp.Create(new AppOptions()
                {
                    Credential = GoogleCredential.FromFile("liulobox-firebase-adminsdk-fbsvc-d132ce7b56.json"),
                });
                _firebaseAuth = FirebaseAuth.DefaultInstance;
            }
        }

        public async Task<string> CreateUserAsync(string email, string password)
        {
            var userRecord = await FirebaseAuth.DefaultInstance.CreateUserAsync(new UserRecordArgs
            {
                Email = email,
                Password = password
            });
            return userRecord.Uid;
        }

        public async Task<FirebaseToken> VerifyTokenAsync(string idToken)
        {
            return await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken); // Trả về FirebaseToken
        }

        public async Task DeleteUserAsync(string uid)
        {
            await FirebaseAuth.DefaultInstance.DeleteUserAsync(uid);
        }

        public async Task UpdatePasswordAsync(string firebaseUid, string newPassword)
        {
            try
            {
                // Lấy thông tin người dùng từ Firebase
                var userRecord = await _firebaseAuth.GetUserAsync(firebaseUid);
                if (userRecord != null)
                {
                    // Cập nhật mật khẩu
                    var updateArgs = new UserRecordArgs
                    {
                        Uid = firebaseUid,
                        Password = newPassword
                    };
                    await _firebaseAuth.UpdateUserAsync(updateArgs);
                    Console.WriteLine($"Password updated for user {firebaseUid}");
                }
                else
                {
                    throw new Exception("User not found in Firebase.");
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error updating password in Firebase: " + ex.Message);
            }
        }

        public async Task SetUserRoleAsync(string uid, string role)
        {
            var claims = new Dictionary<string, object> { { "role", role } };
            await FirebaseAuth.DefaultInstance.SetCustomUserClaimsAsync(uid, claims);
        }

        public async Task SendEmailVerificationAsync(string firebaseUid)
        {
            try
            {
                // Lấy thông tin người dùng từ Firebase
                var userRecord = await _firebaseAuth.GetUserAsync(firebaseUid);
                if (userRecord != null)
                {
                    // Gửi liên kết xác minh email cho người dùng
                    var emailLink = await _firebaseAuth.GenerateEmailVerificationLinkAsync(userRecord.Email);
                    // Lưu emailLink hoặc gửi liên kết xác minh qua email
                    Console.WriteLine($"Email verification link: {emailLink}");
                }
                else
                {
                    throw new Exception("User not found in Firebase.");
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error generating email verification link: " + ex.Message);
            }
        }
        public async Task<string> GetUserRoleAsync(string firebaseUid)
        {
            try
            {
                // Lấy thông tin người dùng từ Firebase bằng Firebase UID
                var userRecord = await _firebaseAuth.GetUserAsync(firebaseUid);

                // Lấy custom claims của người dùng (nơi lưu quyền)
                if (userRecord.CustomClaims != null && userRecord.CustomClaims.ContainsKey("role"))
                {
                    return userRecord.CustomClaims["role"]?.ToString(); // Trả về quyền nếu có
                }
                else
                {
                    return "default"; // Trả về quyền mặc định nếu không có custom claims
                }
            }
            catch (Exception ex)
            {
                // Xử lý lỗi nếu không lấy được thông tin người dùng
                throw new Exception($"Error fetching user role: {ex.Message}");
            }
        }
    }
}
