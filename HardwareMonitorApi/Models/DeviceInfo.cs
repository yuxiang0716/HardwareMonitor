using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HardwareMonitorApi.Models
{
    public class DeviceInfo
    {
        // 設備編號作為主鍵
        [Key]
        [MaxLength(50)]
        public string DeviceNo { get; set; } = string.Empty;

        [Required]
        public string Category { get; set; } = string.Empty; // 類別: 筆記型電腦, 桌上型電腦, 伺服器
        
        [Required]
        [MaxLength(100)]
        public string ComputerName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string CompanyName { get; set; } = string.Empty;

        public string OperatingSystem { get; set; } = string.Empty;

        public int SoftwareCount { get; set; }

        public string? User { get; set; } // 使用人員

        public string? Initializer { get; set; } // 開通人員

        public string? Notes { get; set; } // 備註

        public string? Version { get; set; }

        public DateTime RegistrationDate { get; set; } = DateTime.Now;

        public string RegistrationStatus { get; set; } = "已註冊"; // 註冊狀態: 已註冊, 反註冊

        // 導航屬性 (Navigation Properties) - EF Core 會自動建立一對多關聯
        public virtual ICollection<HardwareInfo> HardwareInfos { get; set; } = new List<HardwareInfo>();
        public virtual ICollection<SoftwareInfo> SoftwareInfos { get; set; } = new List<SoftwareInfo>();
        public virtual ICollection<AlertInfo> AlertInfos { get; set; } = new List<AlertInfo>();
        public virtual ICollection<PowerLog> PowerLogs { get; set; } = new List<PowerLog>();
        public virtual ICollection<DiskInfo> DiskInfos { get; set; } = new List<DiskInfo>();
        public virtual ICollection<GraphicsCardInfo> GraphicsCardInfos { get; set; } = new List<GraphicsCardInfo>();
    }
}