using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HardwareMonitorApi.Models
{
    // 定義使用者角色
    public enum UserRole
    {
        Admin,          // 管理員
        CompanyStaff,   // 公司內部人員
        User            // 使用者
    }

    public class UserAccount
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Account { get; set; } = string.Empty;

        // 密碼哈希，JsonIgnore 避免密碼洩露到 API 回應中
        [Required]
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty; 
        
        [Required]
        public UserRole Role { get; set; } = UserRole.User;

        // 公司內部人員/使用者 需要綁定公司
        [MaxLength(100)]
        public string? CompanyName { get; set; }
    }
}