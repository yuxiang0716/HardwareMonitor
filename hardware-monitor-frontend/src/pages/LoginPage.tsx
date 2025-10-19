import React from 'react';
import { 
  Box, Typography, TextField, Button, 
  Card, CardContent, Grid, Alert 
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { loginSchema } from '../types/Auth';
import type { LoginRequest } from '../types/Auth';
import apiClient from '../services/apiClient';

// 假設後端基礎 URL
//const API_BASE_URL = 'http://localhost:5036/api'; 

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(`/Auth/login`, data);
      
      // 登入成功處理
      const { token, account, role, companyName } = response.data;
      
      // 儲存 Token 和使用者資訊
      localStorage.setItem('token', token);
      localStorage.setItem('userAccount', account);
      localStorage.setItem('userRole', role);
      if (companyName) {
         localStorage.setItem('userCompany', companyName);
      }
      
      console.log('登入成功，角色:', role);
      navigate('/'); // 導航到首頁
      
    } catch (err: any) {
      // 處理 API 錯誤
      console.error("登入失敗:", err);
      setError(err.response?.data?.Message || '登入失敗，請檢查帳號密碼。');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigate('/register'); 
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
      {/* 頂部系統名稱 */}
      <Typography 
        variant="h4" 
        component="h1" 
        color="primary" 
        sx={{ mb: 4, fontWeight: 'bold' }}
      >
        鴻盛資訊安全管理系統
      </Typography>

      {/* 登入方框 Card */}
      <Card sx={{ minWidth: 400, maxWidth: 450, boxShadow: 6 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            
            <Typography variant="h5" component="h2" sx={{ mb: 3, textAlign: 'center' }}>
              系統登入
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            {/* 帳號輸入框 */}
            <TextField
              label="帳號"
              fullWidth
              margin="normal"
              {...register('account')}
              error={!!errors.account}
              helperText={errors.account?.message}
              disabled={loading}
              autoFocus
            />

            {/* 密碼輸入框 */}
            <TextField
              label="密碼"
              type="password"
              fullWidth
              margin="normal"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={loading}
            />

            <Grid container spacing={2} sx={{ mt: 3 }}>
              {/* 登入按鈕 */}
              <Grid item xs={6}>
                <Button 
                  type="submit" 
                  fullWidth 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  disabled={loading}
                >
                  {loading ? '登入中...' : '登入'}
                </Button>
              </Grid>
              
              {/* 註冊按鈕 */}
              <Grid item xs={6}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  color="secondary" 
                  size="large"
                  onClick={handleRegister}
                  disabled={loading}
                >
                  註冊
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;