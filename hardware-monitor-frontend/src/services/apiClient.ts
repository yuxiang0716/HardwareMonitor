// src/services/apiClient.ts

import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { UpdateNotesPayload } from '../types/Device';
import type { CreateDevicePayload, DeviceSummary, PowerLogListItem, AlertLogListItem } from '../types/Device'; 
import type { AccountListItem } from '../types/Account';
import type { CompanyListItem } from '../types/Company';

// ----------------------------------------------------
// 定義不需要 Token 的公開路由 (白名單)
// ----------------------------------------------------
const PUBLIC_ROUTES = [
  '/Auth/login',
  '/Auth/register',
];

// 後端 API 基礎 URL
const API_BASE_URL = 'http://localhost:5036/api'; 

// 建立 Axios 實例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ----------------------------------------------------
// 【關鍵步驟】請求攔截器：自動附加 JWT Token
// ----------------------------------------------------
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    
    // 獲取當前請求的路徑 (例如：/Auth/login)
    const urlPath = config.url ? config.url.replace(API_BASE_URL, '') : '';
    
    // 判斷是否為公開路由 (忽略大小寫和 URL 前後的斜線)
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
        urlPath.toLowerCase().includes(route.toLowerCase())
    );

    // 只有當不是公開路由且 Token 存在時，才附加 Token
    if (!isPublicRoute) {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    
    return config;
  },
  (error) => {
    // 處理請求錯誤
    return Promise.reject(error);
  }
);

// ----------------------------------------------------
// 【可選增強】回應攔截器：處理 401/403 錯誤，自動登出
// ----------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 檢查錯誤回應狀態碼
    if (error.response) {
        const status = error.response.status;
        
        // 401 Unauthorized 或 403 Forbidden 處理
        if (status === 401 || status === 403) {
            console.error('權限不足或 Token 過期，自動登出。');
            
            // 清除 Token 並導向登入頁面
            localStorage.clear();
            
            // 由於攔截器中無法直接使用 useNavigate，這裡使用 window.location
            // 實際項目中建議使用一個狀態管理機制來處理導航。
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'; 
            }
        }
    }
    return Promise.reject(error);
  }
);

// ----------------------------------------------------
// 【新增】設備操作 API 函式
// ----------------------------------------------------

/**
 * 更新設備備註 (PUT /api/Devices/{deviceNo}/notes)
 * @param deviceNo 設備編號
 * @param payload 包含新備註的物件
 * @returns Promise<void>
 */
export const updateDeviceNotes = (deviceNo: string, payload: UpdateNotesPayload) => {
    return apiClient.put(`/Devices/${deviceNo}/notes`, payload);
};

/**
 * 將設備註冊狀態改為「反註冊」 (PUT /api/Devices/{deviceNo}/unregister)
 * @param deviceNo 設備編號
 * @returns Promise<void>
 */
export const unregisterDevice = (deviceNo: string) => {
    return apiClient.put(`/Devices/${deviceNo}/unregister`);
};

/**
 * 新增設備 (POST /api/Devices)
 * @param payload 設備資料
 * @returns Promise<DeviceSummary> 新增成功的設備摘要
 */
export const createDevice = (payload: CreateDevicePayload) => {
    // POST 請求將返回 DeviceSummaryDto，因此我們預期返回 DeviceSummary
    return apiClient.post<DeviceSummary>(`/Devices`, payload).then(res => res.data);
};

/**
 * 獲取所有符合權限的設備開關機紀錄 (GET /api/PowerLogs)
 * @returns Promise<PowerLogListItem[]> 紀錄列表
 */
export const fetchPowerLogs = () => {
    return apiClient.get<PowerLogListItem[]>(`/PowerLogs`).then(res => res.data);
};

/**
 * 獲取所有符合權限的設備告警紀錄 (GET /api/Alerts)
 * @returns Promise<AlertLogListItem[]> 紀錄列表
 */
export const fetchAlertLogs = () => {
    return apiClient.get<AlertLogListItem[]>(`/Alerts`).then(res => res.data);
};

/**
 * 獲取所有使用者帳號列表 (GET /api/Accounts)
 * @returns Promise<AccountListItem[]> 帳號列表
 */
export const fetchAccounts = () => {
    return apiClient.get<AccountListItem[]>(`/Accounts`).then(res => res.data);
};

/**
 * 獲取所有公司列表 (GET /api/Companies)
 * @returns Promise<CompanyListItem[]> 公司列表
 */
export const fetchCompanies = () => {
    return apiClient.get<CompanyListItem[]>(`/Companies`).then(res => res.data);
};

// 報表請求 DTO 類型
export interface ExportRequestPayload {
    dataType: 'device' | 'power-logs' | 'alert-logs' | 'accounts' | 'companies';
    filters: any; // 傳遞當前頁面的篩選狀態
}

/**
 * 導出報表文件 (POST /api/Export)
 * @param payload 導出請求內容
 * @returns Promise<void> 函式將直接觸發瀏覽器下載
 */
export const exportReport = (payload: ExportRequestPayload): Promise<void> => {
    return apiClient.post('/Export', payload, {
        responseType: 'blob', // 關鍵：告知 axios 預期收到二進制數據
    })
    .then(response => {
        // 處理檔名 (從 Content-Disposition 或手動定義)
        const contentDisposition = response.headers['content-disposition'];
        let filename = `${payload.dataType}_report.csv`;
        if (contentDisposition) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;]*)/.exec(contentDisposition);
            if (matches != null && matches[1]) {
                filename = decodeURIComponent(matches[1].replace(/['"]/g, ''));
            }
        }

        // 創建一個 Blob URL 並觸發下載
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename); 
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    });
};

export default apiClient;