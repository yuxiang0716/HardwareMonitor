using HardwareMonitorApi.Data;
using HardwareMonitorApi.Dtos;
using HardwareMonitorApi.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using System.Linq;
using System.IO;
using System.Text.Json.Nodes; // 處理 JsonNode
using System.Security.Claims; // 雖然這裡用不到，但確保環境完整
using System;

namespace HardwareMonitorApi.Services
{
    public class ExportService : IExportService
    {
        private readonly ApplicationDbContext _context;

        public ExportService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<byte[]> ExportDataToCsvAsync(ExportRequestDto request)
        {
            IEnumerable<object>? data;
            string[] headers;

            // 1. 根據 DataType 獲取篩選後的數據
            switch (request.DataType.ToLower())
            {
                case "device":
                    data = await GetFilteredDevices(request.Filters);
                    headers = new[] { "設備編號", "類別", "電腦名稱", "作業系統", "軟體數量", "使用人員", "開通人員", "版本" };
                    break;
                case "power-logs":
                    data = await GetFilteredPowerLogs(request.Filters);
                    headers = new[] { "設備編號", "類別", "日期時間", "動作" };
                    break;
                case "alert-logs":
                    data = await GetFilteredAlertLogs(request.Filters);
                    headers = new[] { "設備編號", "類別", "告警日期", "CPU溫度(℃)", "CPU使用率(%)", "主機板溫度(℃)", "記憶體使用率(%)", "GPU溫度(℃)", "GPU使用率(%)", "硬碟溫度(℃)", "HDD使用率(%)" };
                    break;
                // 後續規劃：硬體規格下載、軟體記錄下載
                default:
                    throw new ArgumentException($"不支援的導出類型: {request.DataType}");
            }

            if (data == null || !data.Any())
            {
                // 注意：必須使用 Byte 陣列返回，否則 File Result 會報錯
                return Encoding.UTF8.GetBytes("無資料"); 
            }
            
            // 2. 生成 CSV 內容
            return GenerateCsv(data, headers);
        }
        
        // --- 輔助方法 1: 設備基本資料 (Device) ---
        private async Task<IEnumerable<object>> GetFilteredDevices(JsonNode? filters)
        {
            var query = _context.Devices.AsNoTracking();

            // "設備編號", "類別", "電腦名稱", "作業系統", "軟體數量", "使用人員", "開通人員", "版本"
            return await query
                .Select(d => new
                {
                    d.DeviceNo,
                    d.Category,
                    d.ComputerName,
                    d.OperatingSystem,
                    d.SoftwareCount,
                    d.User,
                    d.Initializer,
                    d.Version
                })
                .ToListAsync();
        }
        
        // --- 輔助方法 2: 開關機紀錄 (PowerLogs) ---
        private async Task<IEnumerable<object>> GetFilteredPowerLogs(JsonNode? filters)
        {
            // 需要 Join DeviceInfo 來獲取 ComputerName 和 CompanyName
            var query = _context.PowerLogs
                .Include(p => p.DeviceInfo)
                .AsNoTracking()
                .OrderByDescending(p => p.Timestamp);

            // "設備編號", "類別", "日期時間", "動作"

            return await query
                .Select(p => new
                {
                    p.DeviceNo,
                    p.DeviceInfo.Category,
                    p.Timestamp,
                    p.Action,
                })
                .ToListAsync();
        }

        // --- 輔助方法 3: 告警紀錄 (AlertLogs) ---
        private async Task<IEnumerable<object>> GetFilteredAlertLogs(JsonNode? filters)
        {
            var query = _context.AlertInfos
                .Include(a => a.DeviceInfo)
                .AsNoTracking()
                .OrderByDescending(a => a.AlertDate);

            // "設備編號", "類別", "告警日期", "CPU溫度(℃)", "CPU使用率(%)", "主機板溫度(℃)", 
            // "記憶體使用率(%)", "GPU溫度(℃)", "GPU使用率(%)", "硬碟溫度(℃)", "HDD使用率(%)"

            return await query
                .Select(a => new
                {
                    a.DeviceInfo.DeviceNo,
                    a.DeviceInfo.Category,
                    a.AlertDate,
                    a.CpuT,
                    a.CpuU,
                    a.MotherboardT,
                    a.MemoryU,
                    a.GpuT,
                    a.GpuU,
                    a.HddT,
                    a.HddU
                })
                .ToListAsync();
        }

        // --- 輔助方法：簡單 CSV 生成 ---
        private byte[] GenerateCsv(IEnumerable<object> data, string[] headers)
        {
            var csv = new StringBuilder();
            
            // 加入 BOM 確保中文正確顯示
            csv.Append(Encoding.UTF8.GetString(Encoding.UTF8.GetPreamble()));

            // 加入標頭
            csv.AppendLine(string.Join(",", headers.Select(h => $"\"{h}\"")));

            // 加入數據
            var properties = data.FirstOrDefault()?.GetType().GetProperties();
            if (properties != null)
            {
                foreach (var item in data)
                {
                    var values = properties.Select(p => {
                        // 使用 ToString() 方法處理 DateTime 等複雜類型
                        var val = p.GetValue(item)?.ToString() ?? string.Empty; 
                        // 處理包含逗號或引號的字串
                        return $"\"{val.Replace("\"", "\"\"")}\""; 
                    });
                    csv.AppendLine(string.Join(",", values));
                }
            }

            return Encoding.UTF8.GetBytes(csv.ToString());
        }
    }
}