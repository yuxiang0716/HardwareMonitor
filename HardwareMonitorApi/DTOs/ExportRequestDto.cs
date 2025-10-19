using System.ComponentModel.DataAnnotations;
using System.Text.Json.Nodes; // 處理動態 JSON 篩選條件

namespace HardwareMonitorApi.Dtos
{
    public class ExportRequestDto
    {
        /// <summary>
        /// 要導出的資料類型：device, power-logs, alert-logs
        /// </summary>
        [Required]
        public string DataType { get; set; } = string.Empty;

        /// <summary>
        /// 前端傳來的篩選、搜尋、排序條件 (JSON 格式)
        /// 讓後端可以根據這些條件查詢資料庫
        /// </summary>
        public JsonNode? Filters { get; set; }
    }
}