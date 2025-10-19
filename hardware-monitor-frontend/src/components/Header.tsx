import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const account = localStorage.getItem('userAccount') || 'Guest';

  const handleLogout = () => {
    localStorage.clear(); // 清除所有儲存的登入資訊
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
      <Toolbar>
        {/* 系統名稱 (置中) */}
        <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ fontWeight: 'bold' }}
          >
            鴻盛資訊安全管理系統
          </Typography>
        </Box>
        
        {/* 使用者帳號與登出按鈕 (最右側) */}
        <Button 
          color="inherit" 
          onClick={handleLogout}
          sx={{ textTransform: 'none' }} // 讓按鈕文字不全大寫
        >
          {account} (登出)
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;