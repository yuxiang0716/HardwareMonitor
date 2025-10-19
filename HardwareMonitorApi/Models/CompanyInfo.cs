using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HardwareMonitorApi.Models
{
    /// <summary>
    /// 公司資訊模型，用於管理公司註冊限制與狀態
    /// </summary>
    public class CompanyInfo
    {
        // 公司編號 (作為主鍵，也可能作為 DeviceInfo 的外鍵，但我們先使用 CompanyName 連接)
        [Key]
        [MaxLength(50)]
        public string CompanyCode { get; set; } = string.Empty;

        // 公司名稱 (通常是唯一的，且用於連接其他表格，如 DeviceInfo, UserAccount)
        [Required]
        [MaxLength(100)]
        public string CompanyName { get; set; } = string.Empty;

        // 設備註冊最大上限
        [Required]
        public int RegistrationLimit { get; set; }

        // 發送狀態 (例如：Active, Suspended, Pending)
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Active";

        // 更新日期
        public DateTime UpdateDate { get; set; } = DateTime.Now;

        // 建立日期
        public DateTime CreateDate { get; set; } = DateTime.Now;

        // 導航屬性：計算該公司已註冊設備數量 (可選，但很有用)
        public virtual ICollection<DeviceInfo> Devices { get; set; } = new List<DeviceInfo>(); 
    }
}