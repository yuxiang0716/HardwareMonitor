import React, { useState, useEffect, useCallback } from 'react';
import { 
    Box, Typography, CircularProgress, Alert, Grid, Card, CardContent, Chip, Divider, LinearProgress
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BlockIcon from '@mui/icons-material/Block';
import UpdateIcon from '@mui/icons-material/Update';
import { fetchCompanies } from '../services/apiClient';
import type { CompanyListItem } from '../types/Company'; 
import { green, red, blue, grey, orange } from '@mui/material/colors';

// 格式化日期時間 (使用您定義的輔助函數)
const formatDate = (dateString: string | null, type: 'date' | 'datetime' = 'datetime') => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = type === 'datetime' ? 
            { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false } :
            { year: 'numeric', month: '2-digit', day: '2-digit' };
        return date.toLocaleString('zh-TW', options).replace(/\//g, '-').replace(/,/g, ' ');
    } catch {
        return dateString;
    }
};

// 輔助函數：根據狀態返回顏色和圖示
const getStatusInfo = (status: string) => {
    switch (status) {
        case 'Active': return { label: '啟用中', color: 'success' as const, icon: <VerifiedUserIcon /> };
        case 'Suspended': return { label: '已停用', color: 'error' as const, icon: <BlockIcon /> };
        case 'Pending': return { label: '待審核', color: 'warning' as const, icon: <UpdateIcon /> };
        default: return { label: status, color: 'default' as const, icon: <UpdateIcon /> };
    }
};

// ----------------------------------------------------
// 單一公司卡片元件
// ----------------------------------------------------
const CompanyCard: React.FC<{ company: CompanyListItem }> = ({ company }) => {
    const statusInfo = getStatusInfo(company.status);
    const progress = (company.currentDeviceCount / company.registrationLimit) * 100;
    const isOverLimit = company.currentDeviceCount > company.registrationLimit;

    return (
        <Card 
            variant="outlined" 
            sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderColor: isOverLimit ? red[400] : grey[300],
                transition: 'box-shadow 0.3s, transform 0.3s',
                '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)' 
                }
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    {/* 公司名稱 */}
                    <Typography variant="h5" component="div" fontWeight="bold" sx={{ color: blue[700] }}>
                        {company.companyName}
                    </Typography>
                    {/* 狀態標籤 */}
                    <Chip 
                        label={statusInfo.label} 
                        size="medium" 
                        color={statusInfo.color}
                        icon={statusInfo.icon}
                        variant="outlined"
                        sx={{ fontWeight: 'bold' }}
                    />
                </Box>
                
                <Divider sx={{ mb: 1.5 }} />

                {/* 核心資訊 Grid */}
                <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">公司編號</Typography>
                        <Typography variant="body1" fontWeight="bold">{company.companyCode}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">建立日期</Typography>
                        <Typography variant="body1" fontWeight="bold">{formatDate(company.createDate, 'date')}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">更新日期</Typography>
                        <Typography variant="body1" fontWeight="bold">{formatDate(company.updateDate, 'date')}</Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* 設備限制進度條 */}
                <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
                    設備註冊進度: ({company.currentDeviceCount} / {company.registrationLimit})
                </Typography>
                
                <LinearProgress 
                    variant="determinate" 
                    value={Math.min(100, progress)} 
                    color={isOverLimit ? 'error' : progress > 80 ? 'warning' : 'primary'}
                    sx={{ height: 10, borderRadius: 5 }}
                />

                {isOverLimit && (
                     <Alert severity="error" sx={{ mt: 1, p: '4px 8px' }}>
                        <Typography variant="caption" fontWeight="bold">已超過註冊上限！</Typography>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};


// ----------------------------------------------------
// 公司管理頁面
// ----------------------------------------------------
const CompanyPage: React.FC = () => {
    const [companies, setCompanies] = useState<CompanyListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCompanies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchCompanies();
            setCompanies(data);
        } catch (err: any) {
            console.error('Failed to fetch companies:', err);
            const message = err.response?.data?.Message || '獲取公司列表失敗。請檢查 API 伺服器或權限（Admin 權限）。';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCompanies();
    }, [loadCompanies]);

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
                <BusinessIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
                <Typography variant="h4" color="text.secondary" sx={{ ml: 2 }}>
                    總計 {companies.length} 家公司
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {companies.length === 0 && !error ? (
                <Alert severity="info">目前沒有任何公司記錄。</Alert>
            ) : (
                <Grid container spacing={3}>
                    {companies.map((company) => (
                        <Grid item xs={12} sm={6} md={4} key={company.companyCode}>
                            <CompanyCard company={company} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default CompanyPage;