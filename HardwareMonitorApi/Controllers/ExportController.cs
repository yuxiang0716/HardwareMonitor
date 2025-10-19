using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HardwareMonitorApi.Dtos;
using HardwareMonitorApi.Services;

namespace HardwareMonitorApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ExportController : ControllerBase
    {
        private readonly IExportService _exportService;

        public ExportController(IExportService exportService)
        {
            _exportService = exportService;
        }

        /// <summary>
        /// POST /api/Export
        /// 根據前端傳入的類型和篩選條件，導出 CSV 報表
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Export([FromBody] ExportRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.DataType))
            {
                return BadRequest("必須指定 DataType 參數。");
            }
            
            try
            {
                var csvBytes = await _exportService.ExportDataToCsvAsync(request);
                
                // 檔案名稱
                var fileName = $"{request.DataType.Replace("-", "_")}_Report_{DateTime.Now:yyyyMMddHHmmss}.csv";

                return File(
                    csvBytes, 
                    "text/csv; charset=utf-8", // 設定正確的 MIME type
                    fileName
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception)
            {
                // 記錄例外情況
                return StatusCode(500, new { Message = "導出報表時發生內部錯誤。" });
            }
        }
    }
}