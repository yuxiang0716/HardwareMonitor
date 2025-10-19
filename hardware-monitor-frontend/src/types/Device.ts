// src/types/Device.ts

// ---------------------------------------------------------------------
// 1. 首頁列表摘要 (GET /api/Devices)
// ---------------------------------------------------------------------
export interface DeviceSummary {
    deviceNo: string;
    category: string;
    companyName: string;
    registrationStatus: string; // "已註冊" / "反註冊"
    notes: string | null;
}

// ---------------------------------------------------------------------
// 2. 彈出視窗的詳細資料 (GET /api/Devices/{deviceNo})
// ---------------------------------------------------------------------

// 2-1. 基本資料 (BaseInfo)
export interface DeviceBaseInfo {
    deviceNo: string;
    category: string;
    computerName: string;
    companyName: string;
    operatingSystem: string;
    softwareCount: number;
    user: string | null;
    initializer: string | null;
    notes: string | null;
    version: string | null;
    registrationDate: string; // C# DateTime 映射為 string
    registrationStatus: string; 
}

// 2-2. 硬體資料 - 子項目
export interface GraphicsCardDetail { id: number; cardName: string; }
export interface DiskDetail { 
    id: number;
    slotName: string; 
    totalCapacityGB: number; // C# long 映射為 number
    availableCapacityGB: number; // C# long 映射為 number
}

// 2-2. 硬體資料彙總 (HardwareDetail)
export interface HardwareDetailInfo {
    processor: string;
    motherboard: string;
    memoryTotalGB: number;
    memoryAvailableGB: number;
    ipAddress: string;
    updateDate: string; // C# DateTime 映射為 string
    createDate: string; // C# DateTime 映射為 string
     
    graphicsCards: GraphicsCardDetail[]; 
    disks: DiskDetail[];
}

// 2-3. 軟體資料 (SoftwareList)
export interface SoftwareDetail {
    id: number;
    softwareName: string;
    publisher: string;
    installationDate: string; // C# DateTime 映射為 string
    version: string;
}

// 2-4. 告警資料 (AlertList)
export interface AlertDetail {
    id: number;
    alertDate: string; // C# DateTime 映射為 string
    cpuT: number; // C# double 映射為 number
    motherboardT: number;
    gpuT: number;
    hddT: number;
    cpuU: number;
    memoryU: number;
    gpuU: number;
    hddU: number;
}

// 2-5. 開關機資料 (PowerLogList)
export interface PowerLogDetail {
    id: number;
    timestamp: string; // C# DateTime 映射為 string
    action: string; // "開機" / "關機"
}


// 完整設備詳細 DTO (根介面)
export interface DeviceDetail {
    baseInfo: DeviceBaseInfo;
    hardwareDetail: HardwareDetailInfo;
    softwareList: SoftwareDetail[];
    alertList: AlertDetail[];
    powerLogList: PowerLogDetail[];
}

// ---------------------------------------------------------------------
// 3. 篩選與操作
// ---------------------------------------------------------------------

export interface DeviceFilter {
    deviceNo: string;
    companyName: string;
    status: string; // '已註冊', '反註冊', 或 ''
}

// 更新設備備註的 Payload (對應後端 UpdateNotesDto)
export interface UpdateNotesPayload {
    notes: string | null;
}

//新增設備的 Payload (對應後端 CreateDeviceDto)
export interface CreateDevicePayload {
    deviceNo: string;
    category: string; // 筆記型電腦, 桌上型電腦, 伺服器
    computerName: string;
    companyName: string; 
    operatingSystem: string;
    user: string | null;
    initializer: string | null;
    notes: string | null;
    version: string | null;
}

/**
 * 開關機紀錄列表中的單一項目 (對應後端 PowerLogListDto)
 */
export interface PowerLogListItem {
    id: number;
    deviceNo: string;
    timestamp: string;
    action: '開機' | '關機' | string; // 動作
    computerName: string;
    companyName: string;
}

/**
 * 告警紀錄列表中的單一項目 (對應後端 AlertLogListDto)
 */
export interface AlertLogListItem {
    id: number;
    deviceNo: string;
    alertDate: string;
    
    // 溫度
    cpuT: number;
    motherboardT: number;
    gpuT: number;
    hddT: number;

    // 使用率
    cpuU: number;
    memoryU: number;
    gpuU: number;
    hddU: number;
    
    computerName: string;
    companyName: string;
}