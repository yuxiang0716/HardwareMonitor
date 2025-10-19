using HardwareMonitorApi.Models;
using System.ComponentModel.DataAnnotations;

namespace HardwareMonitorApi.DTOs
{
    public class RegisterDto
    {
        [Required]
        public string Account { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        public UserRole Role { get; set; } = UserRole.User;

        // 僅當 Role 為 Staff 或 User 時需要
        public string? CompanyName { get; set; }
    }

    public class LoginDto
    {
        [Required]
        public string Account { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
    }
    
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Account { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? CompanyName { get; set; }
    }
}