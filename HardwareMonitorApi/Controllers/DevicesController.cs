using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HardwareMonitorApi.Data; 
using HardwareMonitorApi.Dtos;
using HardwareMonitorApi.Models; // 使用 Models/UserRole, DeviceInfo, etc.

namespace HardwareMonitorApi.Controllers
{
    [Authorize] // 確保只有登入的使用者才能存取
    [ApiController]
    [Route("api/[controller]")]
    public class DevicesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DevicesController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        /// <summary>
        /// PUT /api/Devices/{deviceNo}/notes
        /// 更新設備備註。
        /// </summary>
        [HttpPut("{deviceNo}/notes")]
        public async Task<IActionResult> UpdateDeviceNotes(string deviceNo, [FromBody] UpdateNotesDto dto)
        {
            var userRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            var userCompanyNameClaim = User.FindFirst("companyName")?.Value; 

            if (userRoleClaim == null || !Enum.TryParse<UserRole>(userRoleClaim, out var userRole))
            {
                return Unauthorized(); 
            }

            var device = await _context.Devices.SingleOrDefaultAsync(d => d.DeviceNo == deviceNo);

            if (device == null)
            {
                return NotFound(new { Message = "設備不存在。" });
            }

            // 權限過濾：公司人員只能修改自己公司的設備
            if (userRole == UserRole.CompanyStaff && device.CompanyName != userCompanyNameClaim)
            {
                return StatusCode(403, new { Message = "禁止操作非本公司設備。" });
            }

            // 更新備註
            device.Notes = dto.Notes;
            
            try
            {
                await _context.SaveChangesAsync();
                // 成功更新，返回 204 No Content
                return NoContent(); 
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(500, new { Message = "資料庫更新失敗，請稍後再試。" });
            }
        }


        /// <summary>
        /// PUT /api/Devices/{deviceNo}/unregister
        /// 將設備註冊狀態改為「反註冊」。
        /// </summary>
        [HttpPut("{deviceNo}/unregister")]
        public async Task<IActionResult> UnregisterDevice(string deviceNo)
        {
            var userRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            var userCompanyNameClaim = User.FindFirst("companyName")?.Value; 

            if (userRoleClaim == null || !Enum.TryParse<UserRole>(userRoleClaim, out var userRole))
            {
                return Unauthorized(); 
            }
            
            // 註銷功能通常是高權限操作
            if (userRole == UserRole.User)
            {
                return StatusCode(403, new { Message = "您的權限不足以執行設備註銷操作。" });
            }

            var device = await _context.Devices.SingleOrDefaultAsync(d => d.DeviceNo == deviceNo);

            if (device == null)
            {
                return NotFound(new { Message = "設備不存在。" });
            }
            
            // 權限過濾：公司人員只能操作自己公司的設備
            if (userRole == UserRole.CompanyStaff && device.CompanyName != userCompanyNameClaim)
            {
                return StatusCode(403, new { Message = "禁止操作非本公司設備。" });
            }

            // 更新狀態
            device.RegistrationStatus = "反註冊";
            
            try
            {
                await _context.SaveChangesAsync();
                return NoContent(); // 成功更新，返回 204
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(500, new { Message = "資料庫更新失敗，請稍後再試。" });
            }
        }

        /// <summary>
        /// GET /api/Devices
        /// 獲取設備列表，並根據使用者角色和篩選條件進行過濾。
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DeviceSummaryDto>>> GetDevices(
            [FromQuery] string? deviceNo,
            [FromQuery] string? companyName,
            [FromQuery] string? status)
        {
            // 1. 獲取當前使用者資訊 (從 JWT Claims)
            var userRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            // 假設 CompanyName 是以 "companyName" 作為 Claim Type 儲存的
            var userCompanyNameClaim = User.FindFirst("companyName")?.Value; 

            if (userRoleClaim == null || !Enum.TryParse<UserRole>(userRoleClaim, out var userRole))
            {
                return Unauthorized(); 
            }

            // 修正：使用您的實際 DbSet 名稱 Devices
            var query = _context.Devices.AsQueryable();

            // 2. 實作權限過濾 (安全機制核心)
            if (userRole == UserRole.CompanyStaff)
            {
                // 公司人員只能看到自己公司的設備
                if (string.IsNullOrWhiteSpace(userCompanyNameClaim))
                {
                    return Ok(new List<DeviceSummaryDto>());
                }
                // 將查詢過濾到該公司
                query = query.Where(d => d.CompanyName == userCompanyNameClaim);
            }
            // Admin (管理員) 不過濾

            // 3. 實作篩選條件
            if (!string.IsNullOrWhiteSpace(deviceNo))
            {
                // 設備編號模糊查詢
                query = query.Where(d => d.DeviceNo.Contains(deviceNo)); 
            }

            // 只有 Admin 才能以 companyName 進行額外篩選
            if (!string.IsNullOrWhiteSpace(companyName) && userRole == UserRole.Admin)
            {
                // 公司名稱模糊查詢
                query = query.Where(d => d.CompanyName.Contains(companyName)); 
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                // 註冊狀態精確匹配
                query = query.Where(d => d.RegistrationStatus == status); 
            }

            // 4. 投影 (Projection) 到 DeviceSummaryDto
            var deviceSummaries = await query
                .OrderBy(d => d.CompanyName) 
                .ThenBy(d => d.DeviceNo)
                .Select(d => new DeviceSummaryDto
                {
                    DeviceNo = d.DeviceNo, //
                    Category = d.Category, //
                    CompanyName = d.CompanyName, //
                    RegistrationStatus = d.RegistrationStatus, //
                    Notes = d.Notes //
                })
                .ToListAsync();

            return Ok(deviceSummaries);
        }

        /// <summary>
        /// GET /api/Devices/{deviceNo}
        /// 根據設備編號獲取單一設備的完整詳細資料。
        /// </summary>
        [HttpGet("{deviceNo}")]
        public async Task<ActionResult<DeviceDetailDto>> GetDeviceDetails(string deviceNo)
        {
            // 1. 獲取當前使用者資訊 (JWT Claims)
            var userRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            var userCompanyNameClaim = User.FindFirst("companyName")?.Value;

            if (userRoleClaim == null || !Enum.TryParse<UserRole>(userRoleClaim, out var userRole))
            {
                return Unauthorized();
            }

            // 2. 構建查詢：使用 Include() 載入所有導航屬性
            var query = _context.Devices
                .AsNoTracking()
                .Include(d => d.HardwareInfos)
                .Include(d => d.SoftwareInfos)
                .Include(d => d.AlertInfos)
                .Include(d => d.PowerLogs)
                .Include(d => d.DiskInfos)
                .Include(d => d.GraphicsCardInfos)
                .AsQueryable();

            // 3. 權限過濾 (保持不變)
            if (userRole == UserRole.CompanyStaff)
            {
                if (string.IsNullOrWhiteSpace(userCompanyNameClaim))
                {
                    return NotFound();
                }
                query = query.Where(d => d.CompanyName == userCompanyNameClaim);
            }

            // 4. 根據 DeviceNo 查找設備
            var device = await query.SingleOrDefaultAsync(d => d.DeviceNo == deviceNo);

            if (device == null)
            {
                return NotFound();
            }

            // 5. 資料投影 (Mapping) 到 DeviceDetailDto 【新的映射邏輯】
            var latestHardware = device.HardwareInfos.OrderByDescending(h => h.UpdateDate).FirstOrDefault();

            var dto = new DeviceDetailDto
            {
                // 2-1. 基本資料
                BaseInfo = new DeviceBaseInfoDto
                {
                    DeviceNo = device.DeviceNo,
                    Category = device.Category,
                    ComputerName = device.ComputerName,
                    CompanyName = device.CompanyName,
                    OperatingSystem = device.OperatingSystem,
                    SoftwareCount = device.SoftwareCount,
                    User = device.User,
                    Initializer = device.Initializer,
                    Notes = device.Notes,
                    Version = device.Version,
                    RegistrationDate = device.RegistrationDate,
                    RegistrationStatus = device.RegistrationStatus,
                },

                // 2-2. 硬體資訊彙總
                HardwareDetail = new HardwareDetailInfoDto
                {
                    Processor = latestHardware?.Processor ?? "N/A",
                    Motherboard = latestHardware?.Motherboard ?? "N/A",
                    MemoryTotalGB = latestHardware?.MemoryTotalGB ?? 0,
                    MemoryAvailableGB = latestHardware?.MemoryAvailableGB ?? 0,
                    IPAddress = latestHardware?.IPAddress ?? "N/A",
                    UpdateDate = latestHardware?.UpdateDate ?? DateTime.MinValue,
                    CreateDate = latestHardware?.CreateDate ?? DateTime.MinValue,

                    // 列表
                    GraphicsCards = device.GraphicsCardInfos
                        .Select(g => new GraphicsCardDetailDto { Id = g.Id, CardName = g.CardName })
                        .ToList(),

                    Disks = device.DiskInfos
                        .Select(d => new DiskDetailDto
                        {
                            Id = d.Id,
                            SlotName = d.SlotName,
                            TotalCapacityGB = d.TotalCapacityGB,
                            AvailableCapacityGB = d.AvailableCapacityGB
                        })
                        .ToList(),
                },

                // 2-3. 軟體資料列表
                SoftwareList = device.SoftwareInfos
                    .Select(s => new SoftwareDetailDto
                    {
                        Id = s.Id,
                        SoftwareName = s.SoftwareName,
                        Publisher = s.Publisher,
                        InstallationDate = s.InstallationDate,
                        Version = s.Version
                    })
                    .ToList(),

                // 2-4. 告警資料列表 (按日期排序)
                AlertList = device.AlertInfos
                    .OrderByDescending(a => a.AlertDate)
                    .Select(a => new AlertDetailDto
                    {
                        Id = a.Id,
                        AlertDate = a.AlertDate,
                        CpuT = a.CpuT,
                        MotherboardT = a.MotherboardT,
                        GpuT = a.GpuT,
                        HddT = a.HddT,
                        CpuU = a.CpuU,
                        MemoryU = a.MemoryU,
                        GpuU = a.GpuU,
                        HddU = a.HddU,
                    })
                    .ToList(),

                // 2-5. 開關機資料列表 (按時間排序)
                PowerLogList = device.PowerLogs
                    .OrderByDescending(p => p.Timestamp)
                    .Select(p => new PowerLogDetailDto
                    {
                        Id = p.Id,
                        Timestamp = p.Timestamp,
                        Action = p.Action
                    })
                    .ToList()
            };

            return Ok(dto);
        }
        
        /// <summary>
        /// POST /api/Devices
        /// 新增設備。
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<DeviceSummaryDto>> CreateDevice([FromBody] CreateDeviceDto dto)
        {
            // 1. 獲取當前使用者資訊
            var userRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            var userCompanyNameClaim = User.FindFirst("companyName")?.Value; 

            if (userRoleClaim == null || !Enum.TryParse<UserRole>(userRoleClaim, out var userRole))
            {
                return Unauthorized(); 
            }

            // 2. 權限檢查：只有 Admin 和 CompanyStaff 才能新增設備
            if (userRole == UserRole.User)
            {
                return StatusCode(403, new { Message = "您的權限不足以新增設備。" });
            }
            
            // 3. 公司名稱處理：CompanyStaff 只能新增自己公司的設備，Admin 可以新增任意公司的
            string finalCompanyName;
            if (userRole == UserRole.CompanyStaff)
            {
                if (string.IsNullOrWhiteSpace(userCompanyNameClaim))
                {
                    return StatusCode(403, new { Message = "您的帳號未綁定公司，無法新增設備。" });
                }
                // CompanyStaff 只能新增自己公司的設備
                if (dto.CompanyName != userCompanyNameClaim)
                {
                    return StatusCode(403, new { Message = "公司人員只能為自己所屬的公司新增設備。" });
                }
                finalCompanyName = userCompanyNameClaim;
            }
            else // Admin 角色
            {
                // Admin 可以新增任意公司，使用傳入的 CompanyName
                finalCompanyName = dto.CompanyName; 
            }

            // 4. 檢查 DeviceNo 是否已存在
            if (await _context.Devices.AnyAsync(d => d.DeviceNo == dto.DeviceNo))
            {
                return Conflict(new { Message = $"設備編號 {dto.DeviceNo} 已存在。" });
            }

            // 5. 映射 DTO 到 Model
            var newDevice = new DeviceInfo
            {
                DeviceNo = dto.DeviceNo,
                Category = dto.Category,
                ComputerName = dto.ComputerName,
                CompanyName = finalCompanyName, // 使用經檢查的最終公司名稱
                OperatingSystem = dto.OperatingSystem,
                SoftwareCount = 0, // 初始為 0
                User = dto.User,
                Initializer = dto.Initializer,
                Notes = dto.Notes,
                Version = dto.Version,
                RegistrationDate = DateTime.Now,
                RegistrationStatus = "已註冊", // 預設為已註冊
                
                // 其他導航屬性將在設備運行監控程式後才加入
            };

            _context.Devices.Add(newDevice);
            
            try
            {
                await _context.SaveChangesAsync();
                
                // 6. 返回 Summary DTO 作為回應 (創建成功，201 Created)
                var summaryDto = new DeviceSummaryDto
                {
                    DeviceNo = newDevice.DeviceNo,
                    Category = newDevice.Category,
                    CompanyName = newDevice.CompanyName,
                    RegistrationStatus = newDevice.RegistrationStatus,
                    Notes = newDevice.Notes
                };
                
                // 使用 CreatedAtAction 返回，提供查詢新設備的 URI
                return CreatedAtAction(nameof(GetDeviceDetails), new { deviceNo = newDevice.DeviceNo }, summaryDto);
            }
            catch (Exception ex)
            {
                // 捕獲其他可能的資料庫錯誤
                return StatusCode(500, new { Message = "新增設備失敗，請檢查輸入資料或連線。", Detail = ex.Message });
            }
        }
    }
}