using HardwareMonitorApi.Dtos;

namespace HardwareMonitorApi.Services
{
    public interface IExportService
    {
        Task<byte[]> ExportDataToCsvAsync(ExportRequestDto request);
    }
}