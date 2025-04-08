using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Http;
using Services;
using System.Security.Claims;
using System.Threading.Tasks;

public class RoleMiddleware
{
    private readonly FirebaseService _firebaseService;

    private readonly RequestDelegate _next;
    private readonly ILogger<RoleMiddleware> _logger;

    public RoleMiddleware(RequestDelegate next, ILogger<RoleMiddleware> logger, FirebaseService firebaseService)
    {
        _next = next;
        _logger = logger;
        _firebaseService = firebaseService;

    }

    public async Task Invoke(HttpContext context)
    {
        var authHeader = context.Request.Headers["Authorization"].ToString();

        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
        {
            var token = authHeader.Substring("Bearer ".Length).Trim();
            try
            {

                var decodedToken = await _firebaseService.VerifyTokenAsync(token);
                var role = decodedToken.Claims.ContainsKey("role") ? decodedToken.Claims["role"].ToString() : "customer";
                System.Console.WriteLine($"[🔥 RoleMiddleware] Token role: {role}");
                var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, decodedToken.Uid),
                new Claim(ClaimTypes.Role, role),
            };

                var identity = new ClaimsIdentity(claims, "firebase");
                var principal = new ClaimsPrincipal(identity);
                context.User = principal;
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"[🔥 RoleMiddleware] Token invalid: {ex.Message}");
            }
        }

        await _next(context);
    }

}
