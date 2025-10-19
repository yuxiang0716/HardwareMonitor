using System.ComponentModel.DataAnnotations;

namespace HardwareMonitorApi.Models
{
    public class HardwareInfo
    {
        public int Id { get; set; }
        
        [Required]
        public string DeviceNo { get; set; } = string.Empty; // 外鍵

        public string Processor { get; set; } = string.Empty;
        public string Motherboard { get; set; } = string.Empty;
        public long MemoryTotalGB { get; set; }
        public long MemoryAvailableGB { get; set; }
        public string IPAddress { get; set; } = string.Empty;
        public DateTime UpdateDate { get; set; } = DateTime.Now;
        public DateTime CreateDate { get; set; } = DateTime.Now;

        // 導航屬性
        public virtual DeviceInfo DeviceInfo { get; set; } = null!;
    }
}
// 請建立 GraphicsCardInfo.cs, SoftwareInfo.cs, AlertInfo.cs