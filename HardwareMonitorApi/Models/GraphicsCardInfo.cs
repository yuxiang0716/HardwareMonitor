using System.ComponentModel.DataAnnotations;

namespace HardwareMonitorApi.Models
{
    public class GraphicsCardInfo
    {
        public int Id { get; set; }

        [Required]
        public string DeviceNo { get; set; } = string.Empty; // 外鍵

        public string CardName { get; set; } = string.Empty; // 顯示卡名稱

        // 導航屬性
        public virtual DeviceInfo DeviceInfo { get; set; } = null!;
    }
}