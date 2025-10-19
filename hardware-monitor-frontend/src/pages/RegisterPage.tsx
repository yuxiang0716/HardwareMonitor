import React from 'react';
import { 
  Box, Typography, TextField, Button, Card, CardContent, 
  Select, MenuItem, FormControl, InputLabel, Grid, Alert
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { registerSchema } from '../types/Auth';
import type { UserRole } from '../types/Auth';
import * as yup from 'yup';

//const API_BASE_URL = 'https://localhost:5036/api'; 
type RegistrationFormInputs = yup.InferType<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // 初始化 useForm，並設定預設值
  const { 
    register, 
    handleSubmit, 
    //watch, 
    formState: { errors } 
  } = useForm<RegistrationFormInputs>({
    // 2. 將 resolver 進行類型斷言，解決類型衝突
    resolver: yupResolver(registerSchema) as any, 
    defaultValues: {
      account: '',
      password: '',
      confirmPassword: '',
      role: 'User', 
      companyName: '', // 保持所有字段都有預設值
    }
  });

  // 監聽 role 欄位的變動
  //const selectedRole = watch('role');

  const onSubmit = async (formData: RegistrationFormInputs) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    // 準備傳給後端的資料：移除 confirmPassword
    const { confirmPassword, ...dataToSend } = formData;
    
    // 清理 companyName (如果不是 CompanyStaff 則傳 null)
    if (dataToSend.role !== 'CompanyStaff') {
        dataToSend.companyName = undefined;
    }

    try {
      // 呼叫後端註冊 API
      await apiClient.post(`/Auth/register`, dataToSend);
      
      setSuccessMessage(`註冊成功！帳號: ${formData.account}。3 秒後將導向登入頁面...`);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err: any) {
      console.error("註冊失敗:", err.response || err);
      // 處理後端返回的錯誤信息（例如：帳號已存在）
      setError(err.response?.data?.Message || '註冊失敗，請檢查資料或聯繫管理員。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        bgcolor: '#f4f6f8' 
      }}
    >
      <Typography variant="h4" component="h1" color="primary" sx={{ mb: 4, fontWeight: 'bold' }}>
        帳號註冊
      </Typography>

      <Card sx={{ minWidth: 400, maxWidth: 500, boxShadow: 6 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            
            {/* 訊息提示 */}
            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={2}>
              {/* 帳號 */}
              <Grid item xs={12}>
                <TextField
                  label="帳號"
                  fullWidth
                  {...register('account')}
                  error={!!errors.account}
                  helperText={errors.account?.message}
                  disabled={loading}
                />
              </Grid>

              {/* 密碼 */}
              <Grid item xs={12}>
                <TextField
                  label="密碼"
                  type="password"
                  fullWidth
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={loading}
                />
              </Grid>

              {/* 確認密碼 */}
              <Grid item xs={12}>
                <TextField
                  label="確認密碼"
                  type="password"
                  fullWidth
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  disabled={loading}
                />
              </Grid>

              {/* 角色選擇 */}
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.role}>
                  <InputLabel id="role-label">身分</InputLabel>
                  <Select
                    labelId="role-label"
                    label="身分"
                    defaultValue="User" // 與 defaultValues 保持一致
                    {...register('role')}
                    disabled={loading}
                  >
                    {/* 這裡的 value 必須是 UserRole 類型 (字串) */}
                    <MenuItem value={'User' as UserRole}>使用者</MenuItem>
                    <MenuItem value={'CompanyStaff' as UserRole}>公司人員</MenuItem>
                    <MenuItem value={'Admin' as UserRole}>管理員</MenuItem>
                  </Select>
                  {errors.role && <Typography color="error" variant="caption">{errors.role.message}</Typography>}
                </FormControl>
              </Grid>

              {/* 公司名稱 */}
              <Grid item xs={12}>
                  <TextField
                    label="公司名稱"
                    fullWidth
                    {...register('companyName')}
                    error={!!errors.companyName}
                    helperText={errors.companyName?.message}
                    disabled={loading}
                  />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 3 }}>
              {/* 註冊按鈕 */}
              <Grid item xs={6}>
                <Button 
                  type="submit" 
                  fullWidth 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  disabled={loading || !!successMessage}
                >
                  {loading ? '註冊中...' : '確認註冊'}
                </Button>
              </Grid>
              
              {/* 返回登入按鈕 */}
              <Grid item xs={6}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  color="secondary" 
                  size="large"
                  onClick={() => navigate('/login')}
                  disabled={loading || !!successMessage}
                >
                  返回登入
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage;