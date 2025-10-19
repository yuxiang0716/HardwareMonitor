// 這是您後端 UserRole 的 TypeScript 對應
export type UserRole = 'Admin' | 'CompanyStaff' | 'User';

/**
 * 帳號列表中的單一項目 (對應後端 AccountListDto)
 */
export interface AccountListItem {
    userId: number;
    account: string;
    role: UserRole;
    companyName: string | null;
    createDate?: string; // 假設後端提供 ISO 格式日期字串
}