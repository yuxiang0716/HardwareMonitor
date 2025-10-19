using HardwareMonitorApi.Models;
using System.ComponentModel.DataAnnotations;

namespace HardwareMonitorApi.Dtos
{
    /// <summary>
    /// 帳號列表 DTO (用於列表顯示)
    /// </summary>
    public class AccountListDto
    {
        public int UserId { get; set; }
        public string Account { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public string? CompanyName { get; set; }
        // 假設還有一個建立時間
        public DateTime? CreateDate { get; set; } // 如果您的 UserAccount 模型有這個欄位
    }
}