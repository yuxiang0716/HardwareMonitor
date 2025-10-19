using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HardwareMonitorApi.Data;
using HardwareMonitorApi.Dtos;
using HardwareMonitorApi.Models;

namespace HardwareMonitorApi.Controllers
{
    [Authorize] 
    [Route("api/[controller]")]
    [ApiController]
    public class CompaniesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CompaniesController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// GET /api/Companies
        /// 獲取所有公司列表 (限 Admin 角色)
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<CompanyListDto>), 200)]
        public async Task<ActionResult<IEnumerable<CompanyListDto>>> GetCompanies()
        {
            var userRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRoleClaim == null || !Enum.TryParse<UserRole>(userRoleClaim, out var userRole))
            {
                return Unauthorized();
            }

            // 1. 權限檢查：只有 Admin 可以看公司列表
            if (userRole != UserRole.Admin)
            {
                return StatusCode(403, new { Message = "只有管理員 (Admin) 有權限查看公司列表。" });
            }

            // 2. 獲取所有公司資訊
            var companies = await _context.CompanyInfos.AsNoTracking().ToListAsync();

            // 3. 獲取所有公司的設備計數 (一次性查詢，提高效率)
            var deviceCounts = await _context.Devices
                .Where(d => companies.Select(c => c.CompanyName).Contains(d.CompanyName))
                .GroupBy(d => d.CompanyName)
                .Select(g => new { CompanyName = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.CompanyName, x => x.Count);


            // 4. 映射 DTO 並加入設備計數
            var companyDtos = companies
                .OrderBy(c => c.CompanyName)
                .Select(c => new CompanyListDto
                {
                    CompanyCode = c.CompanyCode,
                    CompanyName = c.CompanyName,
                    RegistrationLimit = c.RegistrationLimit,
                    Status = c.Status,
                    UpdateDate = c.UpdateDate,
                    CreateDate = c.CreateDate,
                    // 獲取計數，如果公司沒有設備，則為 0
                    CurrentDeviceCount = deviceCounts.GetValueOrDefault(c.CompanyName, 0) 
                })
                .ToList();

            return Ok(companyDtos);
        }
    }
}