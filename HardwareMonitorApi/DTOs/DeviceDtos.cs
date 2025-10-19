using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HardwareMonitorApi.Dtos
{
    // =================================================================
    // 1. 列表摘要 (GET /api/Devices)
    // =================================================================
    public class DeviceSummaryDto
    {
        public string DeviceNo { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string RegistrationStatus { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }


    // =================================================================
    // 2. 詳細資料 (GET /api/Devices/{deviceNo}) - 根 DTO
    // =================================================================

    // 2-1. 基本資料 DTO (BaseInfo)
    public class DeviceBaseInfoDto
    {
        public string DeviceNo { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string ComputerName { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string OperatingSystem { get; set; } = string.Empty;
        public int SoftwareCount { get; set; }
        public string? User { get; set; }
        public string? Initializer { get; set; }
        public string? Notes { get; set; }
        public string? Version { get; set; }
        public DateTime RegistrationDate { get; set; }
        public string RegistrationStatus { get; set; } = string.Empty;
    }

    // 2-2. 硬體子 DTO: 顯示卡
    public class GraphicsCardDetailDto
    {
        public int Id { get; set; }
        public string CardName { get; set; } = string.Empty;
    }

    // 2-2. 硬體子 DTO: 硬碟
    public class DiskDetailDto
    {
        public int Id { get; set; }
        public string SlotName { get; set; } = string.Empty;
        public long TotalCapacityGB { get; set; }
        public long AvailableCapacityGB { get; set; }
    }

    // 2-2. 硬體資料彙總 DTO (HardwareDetail)
    public class HardwareDetailInfoDto
    {
        // 來自最新的 HardwareInfo
        public string Processor { get; set; } = string.Empty;
        public string Motherboard { get; set; } = string.Empty;
        public long MemoryTotalGB { get; set; }
        public long MemoryAvailableGB { get; set; }
        public string IPAddress { get; set; } = string.Empty;
        public DateTime UpdateDate { get; set; }
        public DateTime CreateDate { get; set; }

        // 列表
        public ICollection<GraphicsCardDetailDto> GraphicsCards { get; set; } = new List<GraphicsCardDetailDto>();
        public ICollection<DiskDetailDto> Disks { get; set; } = new List<DiskDetailDto>();
    }

    // 2-3. 軟體資料 DTO (SoftwareList)
    public class SoftwareDetailDto
    {
        public int Id { get; set; }
        public string SoftwareName { get; set; } = string.Empty;
        public string Publisher { get; set; } = string.Empty;
        public DateTime InstallationDate { get; set; }
        public string Version { get; set; } = string.Empty;
    }

    // 2-4. 告警資料 DTO (AlertList)
    public class AlertDetailDto
    {
        public int Id { get; set; }
        public DateTime AlertDate { get; set; }
        public double CpuT { get; set; }
        public double MotherboardT { get; set; }
        public double GpuT { get; set; }
        public double HddT { get; set; }
        public double CpuU { get; set; }
        public double MemoryU { get; set; }
        public double GpuU { get; set; }
        public double HddU { get; set; }
    }

    // 2-5. 開關機資料 DTO (PowerLogList)
    public class PowerLogDetailDto
    {
        public int Id { get; set; }
        public DateTime Timestamp { get; set; }
        public string Action { get; set; } = string.Empty;
    }

    // 完整設備詳細 DTO (對應前端 DeviceDetail 介面)
    public class DeviceDetailDto
    {
        // 巢狀結構，確保前端能讀取
        public DeviceBaseInfoDto BaseInfo { get; set; } = new DeviceBaseInfoDto();
        public HardwareDetailInfoDto HardwareDetail { get; set; } = new HardwareDetailInfoDto();
        public ICollection<SoftwareDetailDto> SoftwareList { get; set; } = new List<SoftwareDetailDto>();
        public ICollection<AlertDetailDto> AlertList { get; set; } = new List<AlertDetailDto>();
        public ICollection<PowerLogDetailDto> PowerLogList { get; set; } = new List<PowerLogDetailDto>();
    }

    // 3. 儲存備註
    public class UpdateNotesDto
    {
        public string? Notes { get; set; } // 允許為 null
    }

    // 4. 新增設備 DTO (POST /api/Devices)
    public class CreateDeviceDto
    {
        // 必填欄位 (Required fields based on DeviceInfo.cs)
        [Required]
        [MaxLength(50)]
        public string DeviceNo { get; set; } = string.Empty;

        [Required]
        public string Category { get; set; } = string.Empty; // 筆記型電腦, 桌上型電腦, 伺服器

        [Required]
        [MaxLength(100)]
        public string ComputerName { get; set; } = string.Empty;

        // 備註：CompanyName 將由後端根據 JWT Token 自動填入（Admin 模式下可能需要傳入，但這裡先預設從 Token 取）
        // 我們讓前端傳入，給 Admin 使用，然後後端根據角色決定使用傳入值還是 Token 值。
        [Required]
        [MaxLength(100)]
        public string CompanyName { get; set; } = string.Empty;

        // 可選欄位
        public string OperatingSystem { get; set; } = string.Empty;
        public string? User { get; set; } // 使用人員
        public string? Initializer { get; set; } // 開通人員
        public string? Notes { get; set; } // 備註
        public string? Version { get; set; }
    }
}

