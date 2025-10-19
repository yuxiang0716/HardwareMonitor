using HardwareMonitorApi.Data;
using HardwareMonitorApi.Models;
using HardwareMonitorApi.DTOs;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

namespace HardwareMonitorApi.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<UserAccount?> Login(string account, string password)
        {
            var user = await _context.UserAccounts.SingleOrDefaultAsync(u => u.Account == account);

            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
                return null;
            }

            return user;
        }

        public async Task<UserAccount> Register(RegisterDto registerDto)
        {
            // 檢查帳號是否已存在 (省略)

            var user = new UserAccount
            {
                Account = registerDto.Account,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                Role = registerDto.Role,
                CompanyName = registerDto.CompanyName
            };

            _context.UserAccounts.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public string GenerateJwtToken(UserAccount user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"]!);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                    new Claim(ClaimTypes.Name, user.Account),
                    new Claim(ClaimTypes.Role, user.Role.ToString()),
                    new Claim("Company", user.CompanyName ?? "") 
                }),
                Expires = DateTime.UtcNow.AddHours(2), // 2 小時後過期
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}