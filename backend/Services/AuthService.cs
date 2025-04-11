using DAO;
using DTO;
using Services;
using System;
using System.Threading.Tasks;

public interface IAuthService
{
    Task<RegisterResponse> RegisterAsync(RegisterRequest request);
}
public class AuthService : IAuthService
{
    private readonly FirebaseService _firebaseService;
    private readonly IUserDao _userDao;
    private readonly EmailService _emailService;

    public AuthService(FirebaseService firebaseService, IUserDao userDao, EmailService emailService)
    {
        _firebaseService = firebaseService;
        _userDao = userDao;
        _emailService = emailService;
    }

    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request)
    {
        if (request.IsGoogleAuth)
        {
            return await RegisterWithGoogleAsync(request);
        }
        else
        {
            return await RegisterWithEmailAsync(request);
        }
    }

    private async Task<RegisterResponse> RegisterWithGoogleAsync(RegisterRequest request)
    {
        var decodedToken = await _firebaseService.VerifyTokenAsync(request.IdToken);
        var firebaseUid = decodedToken.Uid;
        var googleEmail = decodedToken.Claims["email"]?.ToString();
        var googleName = decodedToken.Claims["name"]?.ToString();

        Console.WriteLine("Decoded token: " + decodedToken);
        Console.WriteLine("Google Email: " + googleEmail);

        var existingUser = await _userDao.GetUserByFirebaseUidAsync(firebaseUid);
        if (existingUser != null)
        {
            return new RegisterResponse { Message = "User already exists in SQL Server." };
        }

        Console.WriteLine("Firebase UID: " + firebaseUid);

        var newPassword = GenerateRandomPassword();
        await _firebaseService.UpdatePasswordAsync(firebaseUid, newPassword);

        Console.WriteLine("New password: " + newPassword);

        _emailService.SendEmail(googleEmail, "Your Password",
            $"Dear {googleName}, Your password for email login is: {newPassword}. Use this with your Google email to log in.");

        Console.WriteLine("Email sent to: " + googleEmail);

        var user = new User
        {
            FirebaseUid = firebaseUid,
            Username = googleName,
            Email = googleEmail,
            PhoneNumber = "",
            IsEmailVerified = true
        };

        var resultMessage = await _userDao.AddUserAsync(user);
        Console.WriteLine("AddUserAsync result: " + resultMessage);

        if (!decodedToken.Claims.ContainsKey("role"))
        {
            await _firebaseService.SetUserRoleAsync(firebaseUid, "user");
        }

        return new RegisterResponse
        {
            FirebaseUid = firebaseUid,
            Message = resultMessage + " Please check your email for the password."
        };
    }

    private async Task<RegisterResponse> RegisterWithEmailAsync(RegisterRequest request)
    {
        if (string.IsNullOrEmpty(request.Username))
            throw new ArgumentException("Username is required");
        if (string.IsNullOrEmpty(request.Email))
            throw new ArgumentException("Email is required for non-Google registration");

        var password = request.Password ?? GenerateRandomPassword();
        Console.WriteLine("Generated password: " + password);
        Console.WriteLine("Registering with email: " + request.Email);

        var firebaseUid = await _firebaseService.CreateUserAsync(request.Email, password);
        Console.WriteLine("Firebase UID: " + firebaseUid);

        try
        {
            var verificationCode = GenerateRandomPassword();
            Console.WriteLine("Verification code: " + verificationCode);

            var verificationLink = GenerateVerificationLink(firebaseUid, verificationCode);
            Console.WriteLine("Verification link: " + verificationLink);

            _emailService.SendEmail(request.Email, "Xác minh Email của bạn",
                $"Nhấn vào đây để xác minh: <a href='{verificationLink}'>Xác minh</a>");

            var user = new User
            {
                FirebaseUid = firebaseUid,
                Username = request.Username,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                IsEmailVerified = false
            };

            Console.WriteLine("User to be added: " + user);

            var resultMessage = await _userDao.AddUserAsync(user);
            Console.WriteLine("AddUserAsync result: " + resultMessage);

            await _firebaseService.SetUserRoleAsync(firebaseUid, "user");

            Console.WriteLine("User role set to 'user' for: " + firebaseUid);

            return new RegisterResponse
            {
                FirebaseUid = firebaseUid,
                Message = resultMessage + " Please check your email for verification."
            };
        }
        catch (Exception dbEx)
        {
            await _firebaseService.DeleteUserAsync(firebaseUid);
            throw new Exception("Failed to save user to database", dbEx);
        }
    }

    private string GenerateRandomPassword()
    {
        Console.WriteLine("Generating random password");
        return Guid.NewGuid().ToString().Substring(0, 8);
    }

    private string GenerateVerificationLink(string firebaseUid, string verificationCode)
    {
        var combined = $"{firebaseUid}|{verificationCode}";
        byte[] combinedBytes = System.Text.Encoding.UTF8.GetBytes(combined);
        var encodedCode = Convert.ToBase64String(combinedBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
        return $"https://fbb1-171-224-84-105.ngrok-free.app/api/auth/verify-email?code={encodedCode}";
    }
}
