import React, { useState, useEffect, useCallback } from 'react';
import { 
    Box, Typography, CircularProgress, Alert, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { fetchPowerLogs } from '../services/apiClient';
import type { PowerLogListItem } from '../types/Device'; 
import { green, red } from '@mui/material/colors';

// 格式化日期時間 (重複使用您在 Modal 中定義的格式化函數)
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

const PowerLogPage: React.FC = () => {
    const [logs, setLogs] = useState<PowerLogListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchPowerLogs();
            setLogs(data);
        } catch (err: any) {
            console.error('Failed to fetch power logs:', err);
            const message = err.response?.data?.Message || '獲取開關機紀錄失敗。請檢查 API 伺服器或權限。';
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h4" color="text.secondary" sx={{ ml: 2 }}>
                    總計 {logs.length} 條記錄
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {logs.length === 0 && !error ? (
                <Alert severity="info">目前沒有任何開關機記錄。</Alert>
            ) : (
                <TableContainer component={Paper} sx={{ maxHeight: '80vh' }}>
                    <Table stickyHeader size="medium">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>動作</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>紀錄時間</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>設備編號</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>電腦名稱</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>公司名稱</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.map((log) => {
                                const isPowerOn = log.action === '開機';
                                return (
                                    <TableRow key={log.id} hover>
                                        <TableCell>
                                            <Chip
                                                label={log.action}
                                                size="small"
                                                sx={{ bgcolor: isPowerOn ? green[100] : red[100], color: isPowerOn ? green[800] : red[800] }}
                                            />
                                        </TableCell>
                                        <TableCell>{formatDate(log.timestamp)}</TableCell>
                                        <TableCell>{log.deviceNo}</TableCell>
                                        <TableCell>{log.computerName}</TableCell>
                                        <TableCell>{log.companyName}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default PowerLogPage;