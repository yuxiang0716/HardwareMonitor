using HardwareMonitorApi.DTOs;
using HardwareMonitorApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HardwareMonitorApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            // 實際項目應進行更嚴格的驗證，例如檢查帳號重複

            if (registerDto.Role != Models.UserRole.Admin && string.IsNullOrEmpty(registerDto.CompanyName))
            {
                 return BadRequest("非管理員必須指定公司名稱。");
            }
            
            try
            {
                var user = await _authService.Register(registerDto);
                return CreatedAtAction(nameof(Register), new { userId = user.UserId }, new { Message = "註冊成功" });
            }
            catch (Exception ex)
            {
                // 處理帳號重複等錯誤
                return BadRequest(new { Message = $"註冊失敗: {ex.Message}" });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var user = await _authService.Login(loginDto.Account, loginDto.Password);

            if (user == null)
            {
                return Unauthorized(new { Message = "帳號或密碼錯誤" });
            }

            var token = _authService.GenerateJwtToken(user);
            
            return Ok(new LoginResponseDto
            {
                Token = token,
                Account = user.Account,
                Role = user.Role.ToString(),
                CompanyName = user.CompanyName
            });
        }
    }
}