import React, { useState, useEffect } from 'react';
import { 
  Modal, Box, Typography, Tabs, Tab, Paper, CircularProgress, Alert, Grid, Divider, ListItemText, List, ListItem, Chip
} from '@mui/material';
import apiClient from '../services/apiClient'; // 使用統一的 apiClient
import type { 
    DeviceDetail, DeviceBaseInfo, HardwareDetailInfo, SoftwareDetail, AlertDetail, PowerLogDetail 
} from '../types/Device'; // 導入所有 DTO 介面
import { green, red } from '@mui/material/colors'; // 用於 PowerLog/Alert 顏色
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const formatDate = (dateString: string | null, format: 'date' | 'datetime' = 'datetime') => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const datePart = date.toLocaleDateString('zh-TW');
        const timePart = date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return format === 'date' ? datePart : `${datePart} ${timePart}`;
    } catch {
        return dateString;
    }
};

// 輔助函數：判斷是否為高風險，超過 80% 或 80 度視為高風險 (保持不變)
const isHighRisk = (value: number, type: 'T' | 'U'): boolean => {
    if (type === 'T') {
        return value > 80; // 溫度超過 80 度
    }
    if (type === 'U') {
        return value > 80; // 使用率超過 80%
    }
    return false;
}

const InfoItem: React.FC<{ 
    label: string; 
    value: string | number | null | undefined; 
    sm?: 12 | 6; 
    unit?: string 
}> = ({ label, value, sm = 6, unit = '' }) => {
    
    // 處理值，確保空值顯示 N/A
    const displayValue = value !== null && value !== undefined && value !== '' ? `${value}${unit}` : 'N/A';
    
    return (
        <Grid item xs={12} sm={sm}>
            <Box 
                sx={{ 
                    p: 1.5,
                    height: '75%', // 確保所有卡片高度一致，使視覺更平衡
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    // 輕微的 hover 效果增加互動性
                    transition: 'box-shadow 0.3s',
                    '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                    }
                }}
            >
                {/* 頂部：欄位名稱 (淡灰色) */}
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {label}
                </Typography>

                {/* 分隔線 (淡灰色) */}
                <Divider sx={{ my: 0.8, backgroundColor: 'rgba(0, 0, 0, 0.1)' }} />

                {/* 底部：資料值 (大字體、粗體) */}
                <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    sx={{ 
                        wordBreak: 'break-word', 
                        mt: 0.5,
                        color: displayValue === 'N/A' ? 'text.disabled' : 'text.primary' // N/A 使用灰色
                    }}
                >
                    {displayValue}
                </Typography>
            </Box>
        </Grid>
    );
};

// 內容顯示區塊
const TabPanel: React.FC<{ children: React.ReactNode, value: number, index: number }> = ({ children, value, index }) => (
    <div hidden={value !== index} style={{ flexGrow: 1, overflowY: 'auto', paddingTop: '16px' }}>
         {value === index && children}
    </div>
);

// ------------------------------------
// 頁籤內容元件 - 0. 基本資料 (BaseInfoTab)
// ------------------------------------
export const BaseInfoTab: React.FC<{ data: DeviceBaseInfo }> = ({ data }) => (
    <Box>
        {/* 區塊 1: 核心資訊 */}
        <Typography variant="h5" gutterBottom color="primary">設備資訊</Typography>
        <Grid container spacing={2} sx={{ mb: 3 ,spacing:2 }}>
            <InfoItem label="設備編號" value={data.deviceNo} sm={6} />
            <InfoItem label="類別" value={data.category} sm={6} />
            <InfoItem label="電腦名稱" value={data.computerName} sm={6} />
            <InfoItem label="作業系統" value={data.operatingSystem} sm={6} />
            <InfoItem label="公司名稱" value={data.companyName} sm={6} />
            <InfoItem label="軟體數量" value={data.softwareCount} unit=" 個" sm={6} />
            <InfoItem label="版本號" value={data.version} sm={6} />
            <InfoItem label="註冊狀態" value={data.registrationStatus} sm={6} />
        </Grid>

        {/* 區塊 2: 人員及時間 */}
        <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>管理與人員</Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
            <InfoItem label="使用人員" value={data.user} sm={6} />
            <InfoItem label="開通人員" value={data.initializer} sm={6} />
            <InfoItem label="註冊日期" value={formatDate(data.registrationDate, 'datetime')} sm={6} />
        </Grid>

        {/* 區塊 3: 備註 (備註應獨佔一行) */}
        <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>備註</Typography>
        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="body1" sx={{ color: data.notes ? 'text.primary' : 'text.secondary', whiteSpace: 'pre-wrap' }}>
                {data.notes || '無備註'}
            </Typography>
        </Box>
    </Box>
);

// ------------------------------------
// 頁籤內容元件 - 1. 硬體資料 (HardwareInfoTab)
// ------------------------------------
export const HardwareInfoTab: React.FC<{ data: HardwareDetailInfo }> = ({ data }) => (
    <Box>
        {/* 區塊 1: 核心資訊 */}
        <Typography variant="h5" gutterBottom color="primary">核心硬體 ({formatDate(data.updateDate)})</Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* 處理器和主機板建議獨佔一行 (sm=12) 以顯示完整名稱 */}
            <InfoItem label="處理器 (CPU)" value={data.processor} sm={12} />
            <InfoItem label="主機板 (MB)" value={data.motherboard} sm={12} />
            
            <InfoItem label="記憶體總容量" value={data.memoryTotalGB} unit="GB" sm={6} />
            <InfoItem label="記憶體可用容量" value={data.memoryAvailableGB} unit="GB" sm={6} />
            <InfoItem label="IP 位址" value={data.ipAddress} sm={6} />
            <InfoItem label="資料建立日期" value={formatDate(data.createDate)} sm={6} />
        </Grid>
        
        {/* 區塊 2: 儲存裝置 - 列表保持不變 (適合多個項目) */}
        <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>硬碟資訊</Typography>
        <Paper variant="outlined" sx={{ mt: 1 }}>
            {data.disks.length === 0 ? (
                <Alert severity="info" sx={{ p: 2 }}>無硬碟資料。</Alert>
            ) : (
                <List disablePadding>
                    {data.disks.map((disk, index) => (
                        <ListItem key={index} divider={index < data.disks.length - 1} sx={{ py: 1 }}>
                            <ListItemText 
                                primary={<Typography fontWeight="bold">{disk.slotName || '未命名硬碟'}</Typography>}
                                secondary={`總容量: ${disk.totalCapacityGB} GB / 可用容量: ${disk.availableCapacityGB} GB`}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Paper>

        {/* 區塊 3: 顯示卡 - 列表保持不變 */}
        <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>顯示卡資訊</Typography>
        <Paper variant="outlined" sx={{ mt: 1 }}>
            {data.graphicsCards.length === 0 ? (
                <Alert severity="info" sx={{ p: 2 }}>無顯示卡資料。</Alert>
            ) : (
                <List disablePadding>
                    {data.graphicsCards.map((card, index) => (
                        <ListItem key={index} divider={index < data.graphicsCards.length - 1} sx={{ py: 1 }}>
                            <ListItemText 
                                primary={<Typography fontWeight="bold">{card.cardName || 'N/A'}</Typography>}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Paper>
    </Box>
);

// ------------------------------------
// 頁籤內容元件 - 2. 軟體資料 (SoftwareTab)
// ------------------------------------
export const SoftwareTab: React.FC<{ list: SoftwareDetail[] }> = ({ list }) => {
    const sortedList = list.sort((a, b) => 
        new Date(b.installationDate).getTime() - new Date(a.installationDate).getTime()
    );

    if (sortedList.length === 0) {
        return <Alert severity="info">無軟體安裝記錄。</Alert>;
    }

    return (
        <TableContainer component={Paper} sx={{ maxHeight: 500, overflowX: 'auto' }}>
            <Table stickyHeader size="small" sx={{ minWidth: 650 }}>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>軟體名稱</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>發佈者</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>版本</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>安裝日期</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedList.map((software) => (
                        <TableRow key={software.id} hover>
                            <TableCell>{software.softwareName || 'N/A'}</TableCell>
                            <TableCell>{software.publisher || 'N/A'}</TableCell>
                            <TableCell>{software.version || 'N/A'}</TableCell>
                            <TableCell>{formatDate(software.installationDate, 'date')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

// ------------------------------------
// 頁籤內容元件 - 3. 告警資料 (AlertTab)
// ------------------------------------
export const AlertTab: React.FC<{ list: AlertDetail[] }> = ({ list }) => {
    const sortedList = list.sort((a, b) => 
        new Date(b.alertDate).getTime() - new Date(a.alertDate).getTime()
    );

    if (sortedList.length === 0) {
        return <Alert severity="info">無歷史告警記錄。</Alert>;
    }

    return (
        <List disablePadding sx={{ maxHeight: 500, overflowY: 'auto' }}>
            {sortedList.map((alert) => (
                <Paper 
                    key={alert.id} 
                    variant="outlined" 
                    sx={{ 
                        mb: 2, 
                        p: 2, 
                        borderColor: isHighRisk(alert.cpuT, 'T') || isHighRisk(alert.memoryU, 'U') ? red[300] : 'divider',
                        bgcolor: isHighRisk(alert.cpuT, 'T') || isHighRisk(alert.memoryU, 'U') ? red[50] : 'background.paper'
                    }}
                >
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        告警時間: <Chip label={formatDate(alert.alertDate)} size="small" />
                    </Typography>
                    <Grid container spacing={2}>
                        {/* 溫度數據 */}
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>溫度 (℃)</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {['CPU', '主機板', 'GPU', 'HDD'].map((label, i) => {
                                    const temp = [alert.cpuT, alert.motherboardT, alert.gpuT, alert.hddT][i];
                                    const isAlert = isHighRisk(temp, 'T');
                                    return (
                                        <Chip 
                                            key={label}
                                            label={`${label}: ${temp.toFixed(1)}℃`} 
                                            size="small"
                                            color={isAlert ? 'error' : 'default'}
                                            variant={isAlert ? 'filled' : 'outlined'}
                                        />
                                    );
                                })}
                            </Box>
                        </Grid>

                        {/* 使用率數據 */}
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>使用率 (%)</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {['CPU', '記憶體', 'GPU', 'HDD'].map((label, i) => {
                                    const usage = [alert.cpuU, alert.memoryU, alert.gpuU, alert.hddU][i];
                                    const isAlert = isHighRisk(usage, 'U');
                                    return (
                                        <Chip 
                                            key={label}
                                            label={`${label}: ${usage.toFixed(1)}%`} 
                                            size="small"
                                            color={isAlert ? 'error' : 'default'}
                                            variant={isAlert ? 'filled' : 'outlined'}
                                        />
                                    );
                                })}
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            ))}
        </List>
    );
};

// ------------------------------------
// 頁籤內容元件 - 4. 開關機資料 (PowerLogTab)
// ------------------------------------
export const PowerLogTab: React.FC<{ list: PowerLogDetail[] }> = ({ list }) => {
    const sortedList = list.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (sortedList.length === 0) {
        return <Alert severity="info">無開關機記錄。</Alert>;
    }

    return (
        <Paper variant="outlined" sx={{ maxHeight: 500, overflowY: 'auto' }}>
            <List disablePadding>
                {sortedList.map((log, index) => {
                    const isPowerOn = log.action === '開機';
                    return (
                        <ListItem 
                            key={index} 
                            divider
                            sx={{ py: 1.5, bgcolor: 'background.paper' }}
                        >
                            <Chip 
                                label={log.action || 'N/A'} 
                                size="medium" 
                                color={isPowerOn ? 'success' : 'error'}
                                variant="outlined"
                                sx={{ minWidth: '80px', mr: 2 }}
                            />
                            <ListItemText 
                                primary={formatDate(log.timestamp)}
                            />
                        </ListItem>
                    );
                })}
            </List>
        </Paper>
    );
};

// ------------------------------------
// Modal 樣式和定義
// ------------------------------------
interface DeviceDetailsModalProps {
  deviceNo: string | null; // 修正為允許 null (HomePage 傳入的可能是 null)
  open: boolean;
  onClose: () => void;
}

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    
    // 1. 【優化水平壓縮】: 確保在小螢幕上有最小寬度，防止內容擠壓
    width: { 
        xs: '95%', // 在小螢幕上佔 95% 寬度
        sm: 950,   // 在中型螢幕上保持您想要的寬度
    },
    //minWidth: 320, // ★ 關鍵：防止寬度小於 320px，避免在極小螢幕上內容崩潰
    
    // 2. 【優化垂直遮擋】: 確保整個 Modal 本身高度有限制且可滾動
    maxHeight: '90vh', 
    overflowY: 'auto', // 當內容高度超過 90vh 時，整個 Modal 垂直滾動
    
    // 3. 【優化內容水平滾動】: 處理長內容（如軟體名稱）溢出
    minWidth: '650px',
    overflowX: 'auto', // 預設隱藏 Modal 容器的水平滾動條，讓內部內容處理
    flexWrap: 'nowrap',
    
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const DeviceDetailsModal: React.FC<DeviceDetailsModalProps> = ({ deviceNo, open, onClose }) => {
  const [currentTab, setCurrentTab] = useState(0);
  // 【修正 2：使用正確的 DTO 介面】
  const [details, setDetails] = useState<DeviceDetail | null>(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs = ['基本資料', '硬體資料', '軟體資料', '告警資料', '開關機資料'];

  // 彈窗開啟時自動載入資料
  useEffect(() => {
    // 【修正 3：檢查 deviceNo 和 isOpen 狀態】
    if (!open || !deviceNo) {
        setDetails(null);
        setError(null);
        return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // 【修正 4：使用 apiClient 並修正 API 路徑】
        const response = await apiClient.get<DeviceDetail>(`/Devices/${deviceNo}`); 
        setDetails(response.data);
        setCurrentTab(0); 
      } catch (err: any) {
        setError(err.response?.data?.Message || '載入設備詳細資料失敗。');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  
  }, [open, deviceNo]); // 確保依賴項正確
  
  // 【修正 5：使用整合的頁籤內容元件】
  const renderTabContent = (index: number) => {
      if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
      if (error) return <Alert severity="error">{error}</Alert>;
      if (!details) return <Typography>無資料</Typography>;

      switch (index) {
          case 0: return <BaseInfoTab data={details.baseInfo} />; 
          case 1: return <HardwareInfoTab data={details.hardwareDetail} />; // 硬體資料
          case 2: return <SoftwareTab list={details.softwareList} />; // 軟體資料
          case 3: return <AlertTab list={details.alertList} />; // 告警資料
          case 4: return <PowerLogTab list={details.powerLogList} />; // 開關機資料
          default: return null;
      }
  };


  return (
    <Modal open={open} onClose={onClose}>
      <Paper sx={style}>
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            設備詳細資訊: {deviceNo}
        </Typography>

        {/* 頂部頁籤 */}
        <Tabs 
          value={currentTab} 
          onChange={(e, val) => setCurrentTab(val)} 
          aria-label="設備詳細資料頁籤"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((label, index) => (
          <Tab key={index} label={label} />
          ))}
        </Tabs>

        {/* 底部內容區 */}
        <Box sx={{ flexGrow: 1, overflowY: 'hidden' }}>
        {tabs.map((_, index) => (
            <TabPanel value={currentTab} index={index} key={index}>
                {renderTabContent(index)}
            </TabPanel>
            ))}
         </Box>
       </Paper>
    </Modal>
  );
};

export default DeviceDetailsModal;