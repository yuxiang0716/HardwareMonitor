using HardwareMonitorApi.Models;
using HardwareMonitorApi.DTOs;

namespace HardwareMonitorApi.Services
{
    public interface IAuthService
    {
        Task<UserAccount?> Login(string account, string password);
        string GenerateJwtToken(UserAccount user);
        Task<UserAccount> Register(RegisterDto registerDto);
    }
}