using System.ComponentModel.DataAnnotations;

namespace HardwareMonitorApi.Models
{
    public class DiskInfo
    {
        public int Id { get; set; }
        
        [Required]
        public string DeviceNo { get; set; } = string.Empty; // 外鍵

        public string SlotName { get; set; } = string.Empty; // 槽名稱 (如: C槽)
        public long TotalCapacityGB { get; set; }
        public long AvailableCapacityGB { get; set; }

        // 導航屬性
        public virtual DeviceInfo DeviceInfo { get; set; } = null!;
    }
}