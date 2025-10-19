import React, { useState, useEffect, useCallback } from 'react';
import { 
    Box, Typography, CircularProgress, Alert, Grid, Card, CardContent, Chip, Divider
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { fetchAccounts } from '../services/apiClient';
import type { AccountListItem, UserRole } from '../types/Account'; 
import { blue, green, grey, purple, red } from '@mui/material/colors';

// 格式化日期時間 (使用您定義的輔助函數)
const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = { 
            year: 'numeric', month: '2-digit', day: '2-digit', hour12: false 
        };
        return date.toLocaleString('zh-TW', options).replace(/\//g, '-');
    } catch {
        return dateString;
    }
};

// 輔助函數：根據角色返回顏色和圖示
const getRoleInfo = (role: UserRole) => {
    switch (role) {
        case 'Admin': return { label: '管理員', color: 'primary' as const, icon: <AdminPanelSettingsIcon /> };
        case 'CompanyStaff': return { label: '公司職員', color: 'success' as const, icon: <GroupIcon /> };
        case 'User': return { label: '使用者', color: 'default' as const, icon: <PersonIcon /> };
        default: return { label: '未知', color: 'default' as const, icon: <PersonIcon /> };
    }
};

// ----------------------------------------------------
// 單一帳號卡片元件
// ----------------------------------------------------
const AccountCard: React.FC<{ account: AccountListItem }> = ({ account }) => {
    const roleInfo = getRoleInfo(account.role);

    return (
        <Card 
            variant="outlined" 
            sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderColor: grey[300],
                transition: 'box-shadow 0.3s, transform 0.3s',
                '&:hover': {
                    boxShadow: 6, // 浮動效果
                    transform: 'translateY(-2px)' 
                }
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    {/* 角色標籤 */}
                    <Chip 
                        label={roleInfo.label} 
                        size="medium" 
                        color={roleInfo.color}
                        icon={roleInfo.icon}
                        variant="outlined"
                        sx={{ fontWeight: 'bold' }}
                    />
                </Box>
                {/* 帳號 ID */}
                <Typography variant="body2" color="text.secondary">
                    ID: {account.userId}
                </Typography>
                
                {/* 帳號名稱 */}
                <Typography variant="h5" component="div" fontWeight="bold" sx={{ mb: 1.5, color: blue[700] }}>
                    {account.account}
                </Typography>
                
                <Divider sx={{ mb: 1.5 }} />

                {/* 公司資訊 */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BusinessIcon color="action" sx={{ mr: 1, fontSize: 18 }} />
                    <Typography variant="body1" color="text.primary">
                        公司: 
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" sx={{ ml: 1 }}>
                        {account.companyName || '無綁定公司'}
                    </Typography>
                </Box>

                {/* 建立日期 (如果存在) */}
                {account.createDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            註冊日期: 
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 1 }}>
                            {formatDate(account.createDate)}
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};


// ----------------------------------------------------
// 帳號列表頁面
// ----------------------------------------------------
const AccountPage: React.FC = () => {
    const [accounts, setAccounts] = useState<AccountListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadAccounts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAccounts();
            setAccounts(data);
        } catch (err: any) {
            console.error('Failed to fetch accounts:', err);
            const message = err.response?.data?.Message || '獲取帳號列表失敗。請檢查 API 伺服器或權限（Admin 權限）。';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <AdminPanelSettingsIcon color="action" sx={{ mr: 1, fontSize: 32, color: purple[700] }} />
                <Typography variant="h4" color="text.secondary" sx={{ ml: 2 }}>
                    總計 {accounts.length} 個帳號
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {accounts.length === 0 && !error ? (
                <Alert severity="info">目前沒有任何使用者帳號記錄。</Alert>
            ) : (
                <Grid container spacing={3}>
                    {accounts.map((account) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={account.userId}>
                            <AccountCard account={account} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default AccountPage;