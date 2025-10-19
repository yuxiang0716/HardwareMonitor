import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Container, Paper, Typography, Tab, Tabs, Snackbar,
  TextField, Button, Select, MenuItem, Grid, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Header from '../components/Header';
import DeviceCard from '../components/DeviceCard'; 
import apiClient from '../services/apiClient'; // <-- 使用我們的 API 實例
import type  { DeviceSummary, DeviceFilter } from '../types/Device';
import DeviceDetailModal from '../components/DeviceDetailsModal';
import EditNotesModal from '../components/EditNotesModal';
import CreateDeviceModal from '../components/CreateDeviceModal'; 
import PowerLogPage from '../components/PowerLogPage';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AlertLogPage from '../components/AlertLogPage';
import AccountPage from '../components/AccountPage';
import CompanyPage from '../components/CompanyPage';
import ReportDownloadButton from '../components/ReportDownloadButton';

// Tab 頁籤
const tabs = ['設備管理', '開關機紀錄', '告警紀錄', '帳號管理', '公司管理'];

const HomePage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [devices, setDevices] = useState<DeviceSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeviceNo, setSelectedDeviceNo] = useState<string | null>(null);
  const [isEditNotesModalOpen, setIsEditNotesModalOpen] = useState(false);
  const [notesToEdit, setNotesToEdit] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userCompanyName, setUserCompanyName] = useState<string | null>('您的公司名稱');

  // 篩選狀態 (與 DeviceFilter 類型一致)
  const [filter, setFilter] = useState<DeviceFilter>({
      deviceNo: '',
      companyName: '',
      status: '',
  });

  // 【新增狀態】用於顯示操作結果 (Snackbar)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
      open: false,
      message: '',
      severity: 'success',
  });
  
  // 權限判斷
  const userRole = localStorage.getItem('userRole') ?? '';
  const isAdmin = userRole === 'Admin';
  const isStaff = userRole === 'CompanyStaff';
  
  // =========================================================
  // 數據載入核心邏輯 (使用 useCallback 避免不必要的重複創建)
  // =========================================================
  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // 準備查詢參數
    const params: Record<string, string> = {};
    if (filter.deviceNo) params.deviceNo = filter.deviceNo;
    if (filter.companyName) params.companyName = filter.companyName;
    if (filter.status) params.status = filter.status;
    
    try {
      // 呼叫後端 API：GET /api/Devices?deviceNo=...
      const response = await apiClient.get<DeviceSummary[]>('/Devices', { params });
      
      setDevices(response.data);
      
    } catch (err: any) {
      console.error('載入設備列表失敗:', err);
      
      // 處理 403 錯誤 (如果攔截器沒有處理，或需要更詳細的提示)
      if (err.response && err.response.status === 403) {
          setError('權限不足：您無法查看此資源。');
      } else {
          // 錯誤訊息會由 Response Interceptor 處理 (跳轉登入)，或顯示一般錯誤
          setError(err.response?.data?.Message || '載入設備列表失敗，請檢查網路。');
      }
    } finally {
      setLoading(false);
    }
  }, [filter]); // 依賴於 filter 狀態，當篩選條件變化時，fetcDevices 才會變動

  // 首次載入和篩選條件變動時自動執行
  useEffect(() => {
    // 只有在 '設備管理' 頁籤時才載入數據
    if (currentTab === 0) {
      fetchDevices();
    }
  }, [currentTab, fetchDevices]);

  // =========================================================
  // 篩選與操作函數
  // =========================================================

  // 根據 currentTab 計算當前的 dataType(用於下載按鈕)
  const getCurrentDataType = (tabIndex: number): ExportRequestPayload['dataType'] => {
      switch (tabIndex) {
          case 0:
              return 'device';
          case 1:
              return 'power-logs';
          case 2:
              return 'alert-logs';
          default:
              return 'device'; // 預設或錯誤處理
      }
  };

  // 計算當前頁面的報表類型(用於下載按鈕)
  const currentDataType = getCurrentDataType(currentTab);

  // 處理新增設備 Modal
  const handleOpenCreateModal = useCallback(() => {
      setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
      setIsCreateModalOpen(false);
  }, []);

  const handleCreateSuccess = useCallback((newDeviceSummary: DeviceSummary) => {
      // 1. 將新設備添加到列表的最前面
      setDevices(prev => [newDeviceSummary, ...prev]);
        
      // 2. 顯示成功訊息
      setSnackbar({ open: true, message: `設備 ${newDeviceSummary.deviceNo} 新增成功！`, severity: 'success' });
  }, []);

  // 點擊卡片 "查看詳情" 時觸發
  const handleDetailsClick = (deviceNo: string) => {
    setSelectedDeviceNo(deviceNo);
  };
  
  // 關閉 Modal
  const handleCloseModal = () => {
    setSelectedDeviceNo(null);
  };
  
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFilter({ ...filter, [event.target.name]: event.target.value });
  };
  
  const handleStatusChange = (event: any) => {
      setFilter({ ...filter, status: event.target.value });
  };

  const handleSearch = () => {
      // 點擊搜尋按鈕時，filter 狀態已經更新，只需要重新觸發 fetchDevices
      fetchDevices();
  };

  const handleClear = () => {
      setFilter({ deviceNo: '', companyName: '', status: '' });
      // 清空後，等待 useEffect 偵測到 filter 變動後自動載入，或手動調用
      // 這裡手動調用一次，確保立即刷新
      fetchDevices(); 
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
          return;
      }
      setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleUnregister = useCallback(async (deviceNo: string) => {
      if (!window.confirm(`確定要將設備 ${deviceNo} 註銷嗎？狀態將變更為「反註冊」。`)) {
          return;
      }

      try {
          await unregisterDevice(deviceNo); 
          
          // 1. 顯示成功訊息
          setSnackbar({ open: true, message: `設備 ${deviceNo} 已成功註銷！`, severity: 'success' });
          
          // 2. 本地狀態更新：將該設備的狀態改為「反註冊」
          setDevices(prevDevices => 
              prevDevices.map(d => 
                  d.deviceNo === deviceNo 
                      ? { ...d, registrationStatus: '反註冊' } 
                      : d
              )
          );

      } catch (err: any) {
          console.error('註銷失敗:', err);
          const message = err.response?.data?.Message || '執行註銷操作失敗。請檢查權限或後端日誌。';
          setSnackbar({ open: true, message: message, severity: 'error' });
      }
  }, []);

  // 處理點擊卡片上的「備註」
  const handleOpenEditNotesModal = useCallback((deviceNo: string, currentNotes: string | null) => {
      setSelectedDeviceNo(deviceNo); // 設置當前要編輯的設備
      setNotesToEdit(currentNotes); // 設置當前的備註內容
      setIsEditNotesModalOpen(true); // 開啟備註編輯 Modal
  }, []);

  // 處理關閉備註編輯 Modal
  const handleCloseEditNotesModal = useCallback((didUpdate: boolean) => {
      setIsEditNotesModalOpen(false);
      setSelectedDeviceNo(null); 
      setNotesToEdit(null);
  }, []);

  const handleNotesUpdateSuccess = useCallback((deviceNo: string, newNotes: string) => {
      // 1. 更新 devices 列表中的備註
      setDevices(prevDevices => 
          prevDevices.map(d => 
              d.deviceNo === deviceNo 
                  ? { ...d, notes: newNotes } 
                  : d
          )
      );
        
      // 2. 顯示成功訊息
      setSnackbar({ open: true, message: `設備 ${deviceNo} 的備註已更新！`, severity: 'success' });
  }, []);

  return (
    <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container maxWidth="xl" sx={{ my: 3 }}>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={currentTab} 
              onChange={(e, val) => setCurrentTab(val)} 
              aria-label="功能頁籤"
              centered 
            >
              {/* 根據權限，隱藏 '帳號管理' 和 '公司管理' */}
              {tabs.map((label, index) => {
                 const isManagementTab = index >= 3; // 假設索引 3, 4 是管理頁面
                 if (isManagementTab && !isAdmin) return null;
                 return <Tab key={index} label={label} sx={{ px: 3 }} />
              })}
            </Tabs>
          </Box>

          
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2} alignItems="center">
                
              <Grid item>
                <Typography variant="subtitle1" fontWeight="bold">{tabs[currentTab]}:</Typography>
              </Grid>

              {/* 設備編號輸入框 */}
              <Grid item>
                <TextField 
                  size="small" 
                  label="設備編號" 
                  name="deviceNo"
                  value={filter.deviceNo}
                  onChange={handleFilterChange}
                  sx={{ width: 150 }} 
                />
              </Grid>

              {/* 公司名稱輸入框 (若不是 Admin 則禁用) */}
              <Grid item>
                <TextField 
                  size="small" 
                  label="公司名稱" 
                  name="companyName"
                  value={filter.companyName}
                  onChange={handleFilterChange}
                  sx={{ width: 150 }} 
                  disabled={isStaff} // CompanyStaff 只能看到自己的公司，因此禁用此篩選
                />
              </Grid>

              {/* 註冊狀態下拉選單 */}
              <Grid item>
                <Select
                  size="small"
                  displayEmpty
                  value={filter.status}
                  onChange={handleStatusChange}
                  sx={{ width: 120 }}
                >
                  <MenuItem value="">所有狀態</MenuItem>
                  <MenuItem value="已註冊">已註冊</MenuItem>
                  <MenuItem value="反註冊">反註冊</MenuItem>
                </Select>
              </Grid>

              {/* 搜尋按鈕 */}
              <Grid item>
                <Button 
                  variant="contained" 
                  startIcon={<SearchIcon />}
                  onClick={handleSearch}
                >
                  搜尋
                </Button>
              </Grid>

              {/* 清空按鈕 */}
              <Grid item>
                <Button 
                  variant="outlined" 
                  onClick={handleClear}
                >
                  清空
                </Button>
              </Grid>
                
              {/* 新增按鈕 (僅管理員可見) */}
              {isAdmin && (
                  <Grid item sx={{ ml: 'auto' }}>
                    <Button 
                      variant="contained" 
                      color="success"
                      startIcon={<AddCircleIcon />}
                      onClick={handleOpenCreateModal}
                      disabled={!isAdmin && !userCompanyName} // 只有 Admin 和 CompanyStaff 才能新增
                    >
                      新增
                    </Button>
                  </Grid>
              )}

              {/* 下載報表按鈕 */}
              <Grid item>
                <ReportDownloadButton
                    dataType={currentDataType}
                    filters={filter}
                    buttonText={`下載 ${currentDataType.toUpperCase()} 報表`}
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
      
      {/* 3. 底部區塊：資料呈現區 */}
      <Container maxWidth="xl" sx={{ flexGrow: 1, overflowY: 'auto', pb: 4 }}>
        {currentTab === 0 && (
          <Box>
            {!loading && !error && devices.length > 0 && (
              <Grid container spacing={3}>
                {devices.map((device, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={device.deviceNo}>
                    {/* 傳遞新的點擊事件處理函數 */}
                    <DeviceCard 
                        device={device} 
                        isAdmin={isAdmin} 
                        onDetailsClick={handleDetailsClick}
                        onEditNotes={handleOpenEditNotesModal}
                        onUnregister={handleUnregister}
                    /> 
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
        {currentTab === 1 && (
          <PowerLogPage/>
        )}
        {currentTab === 2 && (
          <AlertLogPage/>
        )}
        {currentTab === 3 && (
          <AccountPage/>
        )}
        {currentTab === 4 && (
          <CompanyPage/>
        )}
      </Container>
      {/* 設備詳情彈出視窗 */}
      <DeviceDetailModal 
        deviceNo={selectedDeviceNo} // 傳遞要查詢的設備編號
        open={!!selectedDeviceNo && !isEditNotesModalOpen}
        onClose={handleCloseModal}
      />
      <EditNotesModal
        deviceNo={selectedDeviceNo}
        currentNotes={notesToEdit}
        open={isEditNotesModalOpen}
        onClose={handleCloseEditNotesModal}
        onSuccess={handleNotesUpdateSuccess}
      />

      {/* 【新增】創建設備 Modal */}
      <CreateDeviceModal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleCreateSuccess}
        userCompanyName={userCompanyName}
        isAdmin={isAdmin}
      />

      {/* 操作結果提示 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HomePage;