using System.ComponentModel.DataAnnotations;

namespace HardwareMonitorApi.Dtos
{
    /// <summary>
    /// 告警紀錄列表 DTO
    /// 包含設備基本資訊和告警詳細數據
    /// </summary>
    public class AlertLogListDto
    {
        public int Id { get; set; }
        
        // 來自 AlertInfo
        public string DeviceNo { get; set; } = string.Empty;
        public DateTime AlertDate { get; set; } = DateTime.Now;

        // 溫度 (T: Temperature)
        public double CpuT { get; set; }
        public double MotherboardT { get; set; }
        public double GpuT { get; set; }
        public double HddT { get; set; }

        // 使用率 (U: Usage)
        public double CpuU { get; set; }
        public double MemoryU { get; set; }
        public double GpuU { get; set; }
        public double HddU { get; set; }

        // 來自 DeviceInfo (為了方便顯示)
        public string ComputerName { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
    }
}