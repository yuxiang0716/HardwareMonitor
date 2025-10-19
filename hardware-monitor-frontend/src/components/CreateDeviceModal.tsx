import React, { useState, useEffect } from 'react';
import { 
    Modal, Box, Typography, Paper, TextField, Button, CircularProgress, Alert, Grid, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import type{ SelectChangeEvent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { createDevice } from '../services/apiClient';
import type { CreateDevicePayload } from '../types/Device';

interface CreateDeviceModalProps {
    open: boolean;
    onClose: () => void;
    // 新增成功後回調，用於更新列表
    onSuccess: (newDeviceSummary: any) => void; 
    // 當前登入者的公司名稱 (用於預填)
    userCompanyName: string | null;
    // 當前登入者是否為 Admin (用於決定 CompanyName 欄位是否可編輯)
    isAdmin: boolean; 
}

// 設備類別選項
const categoryOptions = [
    { label: '筆記型電腦', value: '筆記型電腦' },
    { label: '桌上型電腦', value: '桌上型電腦' },
    { label: '伺服器', value: '伺服器' },
];

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 600 },
    maxHeight: '90vh',
    overflowY: 'auto',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const initialFormData: CreateDevicePayload = {
    deviceNo: '',
    category: categoryOptions[0].value,
    computerName: '',
    companyName: '',
    operatingSystem: '',
    user: '',
    initializer: '',
    notes: '',
    version: '',
};

const CreateDeviceModal: React.FC<CreateDeviceModalProps> = ({ open, onClose, onSuccess, userCompanyName, isAdmin }) => {
    const [formData, setFormData] = useState<CreateDevicePayload>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 設置初始 CompanyName
    useEffect(() => {
        if (open) {
            setFormData({
                ...initialFormData,
                companyName: userCompanyName || '',
            });
            setError(null);
        }
    }, [open, userCompanyName]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        // 基本驗證
        if (!formData.deviceNo || !formData.category || !formData.computerName || !formData.companyName) {
            setError('請填寫所有標 * 號的必填欄位。');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // 處理空字串為 null
            const payloadToSend: CreateDevicePayload = {
                ...formData,
                user: formData.user?.trim() || null,
                initializer: formData.initializer?.trim() || null,
                notes: formData.notes?.trim() || null,
                version: formData.version?.trim() || null,
                operatingSystem: formData.operatingSystem?.trim() || '',
            };
            
            const newDeviceSummary = await createDevice(payloadToSend);
            
            onSuccess(newDeviceSummary); // 通知父元件更新列表
            onClose(); 
        } catch (err: any) {
            const message = err.response?.data?.Message || '新增設備失敗。';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Paper sx={style}>
                <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
                    新增設備
                </Typography>
                
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Grid container spacing={2}>
                    {/* 第一行：必填項 */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="設備編號 (*)"
                            name="deviceNo"
                            value={formData.deviceNo}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required>
                            <InputLabel id="category-label">類別 (*)</InputLabel>
                            <Select
                                labelId="category-label"
                                name="category"
                                value={formData.category}
                                label="類別 (*)"
                                onChange={handleSelectChange}
                            >
                                {categoryOptions.map(option => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    {/* 第二行 */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="電腦名稱 (*)"
                            name="computerName"
                            value={formData.computerName}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                         <TextField
                            label="所屬公司 (*)"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            fullWidth
                            required
                            // Admin 可編輯，CompanyStaff 不可編輯
                            disabled={!isAdmin && !!userCompanyName} 
                            helperText={!isAdmin && userCompanyName ? `公司人員只能為 ${userCompanyName} 新增設備` : ''}
                        />
                    </Grid>
                    
                    {/* 第三行：可選項 */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="作業系統"
                            name="operatingSystem"
                            value={formData.operatingSystem}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="版本號"
                            name="version"
                            value={formData.version}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    
                    {/* 第四行：人員 */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="使用人員"
                            name="user"
                            value={formData.user}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="開通人員"
                            name="initializer"
                            value={formData.initializer}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>

                    {/* 備註 */}
                    <Grid item xs={12}>
                        <TextField
                            label="備註"
                            name="notes"
                            multiline
                            rows={3}
                            value={formData.notes}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    
                </Grid>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                    <Button 
                        onClick={onClose} 
                        disabled={loading}
                    >
                        取消
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                        onClick={handleSave}
                        disabled={loading}
                    >
                        新增設備
                    </Button>
                </Box>
            </Paper>
        </Modal>
    );
};

export default CreateDeviceModal;