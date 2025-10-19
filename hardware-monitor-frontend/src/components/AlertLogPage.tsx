import React, { useState, useEffect, useCallback } from 'react';
import { 
    Box, Typography, CircularProgress, Alert, Grid, Card, CardContent, Chip, Divider
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { fetchAlertLogs } from '../services/apiClient';
import type { AlertLogListItem } from '../types/Device'; 
import { orange, red, blue } from '@mui/material/colors';

// 格式化日期時間 (使用您定義的輔助函數，假設它在某個公用檔案或在 Modal 中定義)
const formatDate = (dateString: string | null) => {
    if (!dateString || dateString.startsWith('0001')) return 'N/A';
    try {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = { 
            year: 'numeric', month: '2-digit', day: '2-digit', 
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
        };
        return date.toLocaleString('zh-TW', options).replace(/\//g, '-').replace(/,/g, ' ');
    } catch {
        return dateString;
    }
};

// 輔助函數：判斷是否為高風險，超過 80% 或 80 度視為高風險
const isHighRisk = (value: number, type: 'T' | 'U'): boolean => {
    if (type === 'T') { return value > 80; } // 溫度超過 80 度
    if (type === 'U') { return value > 80; } // 使用率超過 80%
    return false;
};

// 判斷整條紀錄是否為嚴重告警
const isSevereAlert = (log: AlertLogListItem): boolean => {
    return isHighRisk(log.cpuT, 'T') || isHighRisk(log.memoryU, 'U');
};


// ----------------------------------------------------
// 單一告警卡片元件
// ----------------------------------------------------
const AlertCard: React.FC<{ log: AlertLogListItem }> = ({ log }) => {
    const isSevere = isSevereAlert(log);
    const borderColor = isSevere ? red[400] : orange[300];
    const bgColor = isSevere ? red[50] : 'background.paper';

    // 定義要顯示的數據組
    const temperatureData = [
        { label: 'CPU', value: log.cpuT, type: 'T' as 'T' | 'U' },
        { label: '主機板', value: log.motherboardT, type: 'T' as 'T' | 'U' },
        { label: 'GPU', value: log.gpuT, type: 'T' as 'T' | 'U' },
        { label: 'HDD', value: log.hddT, type: 'T' as 'T' | 'U' },
    ];
    const usageData = [
        { label: 'CPU', value: log.cpuU, type: 'U' as 'T' | 'U' },
        { label: '記憶體', value: log.memoryU, type: 'U' as 'T' | 'U' },
        { label: 'GPU', value: log.gpuU, type: 'U' as 'T' | 'U' },
        { label: 'HDD', value: log.hddU, type: 'U' as 'T' | 'U' },
    ];

    return (
        <Card 
            variant="outlined" 
            sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderColor: borderColor, // 使用顏色邊框
                bgcolor: bgColor,
                transition: 'box-shadow 0.3s, transform 0.3s',
                '&:hover': {
                    boxShadow: 6, // 浮動效果
                    transform: 'translateY(-2px)' // 輕微上浮
                }
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                         <WarningIcon sx={{ color: isSevere ? red[600] : orange[500], mr: 1 }} />
                         <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                            設備: {log.computerName}
                         </Typography>
                    </Box>
                    <Chip 
                        label={isSevere ? "嚴重告警" : "一般告警"} 
                        size="small" 
                        color={isSevere ? 'error' : 'warning'} 
                        variant="outlined"
                    />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    紀錄時間: {formatDate(log.alertDate)} ({log.companyName})
                </Typography>
                
                <Divider sx={{ mb: 2 }} />

                {/* 溫度數據 Grid */}
                <Typography variant="h6" color={blue[700]} gutterBottom>溫度 (℃)</Typography>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                    {temperatureData.map((d) => {
                        const isAlert = isHighRisk(d.value, d.type);
                        return (
                             <Grid item xs={6} sm={3} key={d.label}>
                                <Chip 
                                    label={`${d.label}: ${d.value.toFixed(1)}℃`} 
                                    size="small"
                                    color={isAlert ? 'error' : 'default'}
                                    variant={isAlert ? 'filled' : 'outlined'}
                                    sx={{ width: '100%' }}
                                />
                            </Grid>
                        );
                    })}
                </Grid>

                {/* 使用率數據 Grid */}
                <Typography variant="h6" color={blue[700]} gutterBottom>使用率 (%)</Typography>
                <Grid container spacing={1}>
                    {usageData.map((d) => {
                        const isAlert = isHighRisk(d.value, d.type);
                        return (
                             <Grid item xs={6} sm={3} key={d.label}>
                                <Chip 
                                    label={`${d.label}: ${d.value.toFixed(1)}%`} 
                                    size="small"
                                    color={isAlert ? 'error' : 'default'}
                                    variant={isAlert ? 'filled' : 'outlined'}
                                    sx={{ width: '100%' }}
                                />
                            </Grid>
                        );
                    })}
                </Grid>
            </CardContent>
        </Card>
    );
};


// ----------------------------------------------------
// 告警紀錄頁面
// ----------------------------------------------------
const AlertLogPage: React.FC = () => {
    const [logs, setLogs] = useState<AlertLogListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAlertLogs();
            setLogs(data);
        } catch (err: any) {
            console.error('Failed to fetch alert logs:', err);
            const message = err.response?.data?.Message || '獲取告警紀錄失敗。請檢查 API 伺服器或權限。';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

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
                <WarningIcon color="error" sx={{ mr: 1, fontSize: 32 }} />
                <Typography variant="h4" color="text.secondary" sx={{ ml: 2 }}>
                    總計 {logs.length} 條記錄
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {logs.length === 0 && !error ? (
                <Alert severity="info">目前沒有任何告警記錄。</Alert>
            ) : (
                <Grid container spacing={3}>
                    {logs.map((log) => (
                        <Grid item xs={12} md={6} lg={4} key={log.id}>
                            <AlertCard log={log} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default AlertLogPage;