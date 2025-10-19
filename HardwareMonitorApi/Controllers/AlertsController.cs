using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HardwareMonitorApi.Data;
using HardwareMonitorApi.Dtos;
using HardwareMonitorApi.Models; // 確保引用 UserRole

namespace HardwareMonitorApi.Controllers
{
    [Authorize] // 確保需要登入
    [Route("api/[controller]")]
    [ApiController]
    public class AlertsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AlertsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// GET /api/Alerts
        /// 獲取所有符合權限的設備告警紀錄。
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<AlertLogListDto>), 200)]
        public async Task<ActionResult<IEnumerable<AlertLogListDto>>> GetAlertLogs()
        {
            var userRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            var userCompanyName = User.FindFirst("companyName")?.Value;

            if (userRoleClaim == null || !Enum.TryParse<UserRole>(userRoleClaim, out var userRole))
            {
                return Unauthorized();
            }

            // 1. 建立查詢基礎：聯接 AlertInfo 和 DeviceInfo
            var query = _context.AlertInfos
                .Include(a => a.DeviceInfo)
                .AsNoTracking();

            // 2. 應用權限過濾
            if (userRole == UserRole.User)
            {
                // User 角色不能看所有紀錄，這裡暫時禁止
                return StatusCode(403, new { Message = "普通使用者無權限查看所有設備告警紀錄。" });
            }
            else if (userRole == UserRole.CompanyStaff)
            {
                // CompanyStaff 只能看自己公司的設備紀錄
                if (string.IsNullOrEmpty(userCompanyName))
                {
                    return StatusCode(403, new { Message = "帳號未綁定公司，無權限查看紀錄。" });
                }
                query = query.Where(a => a.DeviceInfo.CompanyName == userCompanyName);
            }
            // Admin 角色則不過濾，查看所有紀錄

            // 3. 執行查詢並映射 DTO
            var alertLogs = await query
                .OrderByDescending(a => a.AlertDate) // 依時間倒序排列 (最新在前)
                .Select(a => new AlertLogListDto
                {
                    Id = a.Id,
                    DeviceNo = a.DeviceNo,
                    AlertDate = a.AlertDate,
                    CpuT = a.CpuT,
                    MotherboardT = a.MotherboardT,
                    GpuT = a.GpuT,
                    HddT = a.HddT,
                    CpuU = a.CpuU,
                    MemoryU = a.MemoryU,
                    GpuU = a.GpuU,
                    HddU = a.HddU,
                    ComputerName = a.DeviceInfo.ComputerName,
                    CompanyName = a.DeviceInfo.CompanyName
                })
                .ToListAsync();

            return Ok(alertLogs);
        }
    }
}