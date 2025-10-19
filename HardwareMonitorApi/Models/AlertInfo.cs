using System.ComponentModel.DataAnnotations;

namespace HardwareMonitorApi.Models
{
    public class AlertInfo
    {
        public int Id { get; set; }

        [Required]
        public string DeviceNo { get; set; } = string.Empty; // 外鍵

        public DateTime AlertDate { get; set; } = DateTime.Now;

        // 溫度 (T: Temperature)
        public double CpuT { get; set; }
        public double MotherboardT { get; set; }
        public double GpuT { get; set; }
        public double HddT { get; set; }

        // 使用率 (U: Usage)
        public double CpuU { get; set; }
        public double MemoryU { get; set; } // 記憶體使用率
        public double GpuU { get; set; }
        public double HddU { get; set; } // 硬碟使用率

        // 導航屬性
        public virtual DeviceInfo DeviceInfo { get; set; } = null!;
    }
}