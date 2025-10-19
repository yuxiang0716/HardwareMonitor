import React from 'react';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { exportReport } from '../services/apiClient';
import type { ExportRequestPayload } from '../services/apiClient';

interface ReportDownloadButtonProps {
    /** 報表類型，對應後端 DTO 中的 DataType */
    dataType: ExportRequestPayload['dataType'];
    /** 當前頁面所有的篩選、搜尋、排序條件 */
    filters: any;
    /** 按鈕文字 */
    buttonText?: string;
}

const ReportDownloadButton: React.FC<ReportDownloadButtonProps> = ({ 
    dataType, 
    filters, 
    buttonText = '下載報表 (CSV)' 
}) => {
    const [loading, setLoading] = React.useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            await exportReport({ dataType, filters });
            // 下載成功，可以彈出成功通知
        } catch (error) {
            console.error('報表下載失敗:', error);
            // 彈出錯誤通知
            alert('報表下載失敗！請檢查權限或伺服器。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="outlined"
            color="info"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={loading}
        >
            {loading ? '正在生成...' : buttonText}
        </Button>
    );
};

export default ReportDownloadButton;