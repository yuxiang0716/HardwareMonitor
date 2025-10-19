using System.ComponentModel.DataAnnotations;

namespace HardwareMonitorApi.Models
{
    public class SoftwareInfo
    {
        public int Id { get; set; }

        [Required]
        public string DeviceNo { get; set; } = string.Empty; // 外鍵

        public string SoftwareName { get; set; } = string.Empty;
        public string Publisher { get; set; } = string.Empty;
        public DateTime InstallationDate { get; set; }
        public string Version { get; set; } = string.Empty;

        // 導航屬性
        public virtual DeviceInfo DeviceInfo { get; set; } = null!;
    }
}