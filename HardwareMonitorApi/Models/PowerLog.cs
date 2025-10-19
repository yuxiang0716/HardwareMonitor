using System.ComponentModel.DataAnnotations;

namespace HardwareMonitorApi.Models
{
    public class PowerLog
    {
        public int Id { get; set; }

        [Required]
        public string DeviceNo { get; set; } = string.Empty; // 外鍵

        public DateTime Timestamp { get; set; } = DateTime.Now;

        public string Action { get; set; } = string.Empty; // 動作: 開機, 關機

        // 導航屬性
        public virtual DeviceInfo DeviceInfo { get; set; } = null!;
    }
}