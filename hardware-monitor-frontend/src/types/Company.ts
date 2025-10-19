/**
 * 公司列表中的單一項目 (對應後端 CompanyListDto)
 */
export interface CompanyListItem {
    companyCode: string;
    companyName: string;
    registrationLimit: number; // 設備註冊最大上限
    status: string;           // 發送狀態 (Active, Suspended...)
    updateDate: string;
    createDate: string;
    currentDeviceCount: number; // 目前已註冊設備數量
}