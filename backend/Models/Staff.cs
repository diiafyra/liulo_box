using System.ComponentModel.DataAnnotations;

public class Staff
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string Username { get; set; }
    public string Password { get; set; } // Encrypted password
    public string Role { get; set; } // Admin, Manager, Staff
    public bool IsActive { get; set; }
}
