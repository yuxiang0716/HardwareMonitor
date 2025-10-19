using System.ComponentModel.DataAnnotations;

namespace HardwareMonitorApi.Dtos
{
    /// <summary>
    /// 開關機紀錄列表 DTO
    /// 包含設備基本資訊，用於列表顯示
    /// </summary>
    public class PowerLogListDto
    {
        public int Id { get; set; }
        
        // 來自 PowerLog
        public string DeviceNo { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Action { get; set; } = string.Empty; // 動作: 開機, 關機

        // 來自 DeviceInfo (為了方便顯示)
        public string ComputerName { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
    }

    // 您可能還需要一個通用的分頁和排序參數 DTO，但我們先省略，直接獲取所有資料。
}