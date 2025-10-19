using System.ComponentModel.DataAnnotations;

namespace HardwareMonitorApi.Dtos
{
    /// <summary>
    /// 公司列表 DTO (用於列表顯示)
    /// </summary>
    public class CompanyListDto
    {
        public string CompanyCode { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public int RegistrationLimit { get; set; }
        public string Status { get; set; } = "Active";
        public DateTime UpdateDate { get; set; }
        public DateTime CreateDate { get; set; }

        // 擴展屬性：用於顯示目前已註冊設備數量
        public int CurrentDeviceCount { get; set; }
    }
}