using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HardwareMonitorApi.Data;
using HardwareMonitorApi.Dtos;
using HardwareMonitorApi.Models;

namespace HardwareMonitorApi.Controllers
{
    [Authorize] // 確保需要登入
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AccountsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// GET /api/Accounts
        /// 獲取所有使用者帳號列表 (限 Admin 角色)
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<AccountListDto>), 200)]
        public async Task<ActionResult<IEnumerable<AccountListDto>>> GetAccounts()
        {
            var userRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRoleClaim == null || !Enum.TryParse<UserRole>(userRoleClaim, out var userRole))
            {
                return Unauthorized();
            }

            // 1. 權限檢查：只有 Admin 可以看所有帳號列表
            if (userRole != UserRole.Admin)
            {
                return StatusCode(403, new { Message = "只有管理員 (Admin) 有權限查看所有使用者列表。" });
            }

            // 2. 執行查詢並映射 DTO
            var accounts = await _context.UserAccounts
                .AsNoTracking()
                .OrderBy(u => u.Role) // 依角色排序
                .ThenBy(u => u.Account) // 依帳號排序
                .Select(u => new AccountListDto
                {
                    UserId = u.UserId,
                    Account = u.Account,
                    Role = u.Role,
                    CompanyName = u.CompanyName,
                    // 假設您的 UserAccount Model 有 CreateDate 欄位
                    // CreateDate = u.CreateDate 
                })
                .ToListAsync();

            return Ok(accounts);
        }
    }
}