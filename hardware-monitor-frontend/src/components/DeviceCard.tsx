import React from 'react';
import { 
  Card, CardContent, Typography, Button, Box, Divider
} from '@mui/material';
//import { 
//  Card, CardContent, Typography, Button, Box, Divider, 
//  Modal, Tabs, Tab, CircularProgress, Chip
//} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import { red, green } from '@mui/material/colors';
//import DeviceDetailsModal from './DeviceDetailsModal';
import type { DeviceSummary } from '../types/Device'; 
//import SettingsIcon from '@mui/icons-material/Settings';

interface DeviceCardProps {
    device: DeviceSummary;
    isAdmin: boolean;
    onDetailsClick: (deviceNo: string) => void;
    onEditNotes: (deviceNo: string, currentNotes: string | null) => void;
    onUnregister: (deviceNo: string) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, isAdmin, onDetailsClick, onEditNotes, onUnregister}) => {
  // 處理點擊「備註」
  const handleEditNotes = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    // 傳遞設備編號和當前備註內容給父元件
    onEditNotes(device.deviceNo, device.notes); 
  };

 // 處理點擊「註銷」
  const handleUnregister = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (window.confirm(`確定要將 ${device.deviceNo} 註銷嗎？這將會永久改變其狀態為「反註冊」。`)) {
    // 傳遞設備編號給父元件
    onUnregister(device.deviceNo);
    }
  };

  return (
    <>
      <Card 
        variant="outlined"
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          cursor: 'pointer', 
          border: `2px solid ${device.registrationStatus === '反註冊' ? red[500] : green[500]}`,
          transition: '0.3s',
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-2px)',
            borderColor: 'primary.main'
          }
        }}
        onClick={() => onDetailsClick(device.deviceNo)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <ComputerIcon color="primary" sx={{ fontSize: 40 }} />
             <Typography 
               variant="caption" 
               sx={{ 
                   p: 0.5, 
                   borderRadius: 1, 
                   bgcolor: device.registrationStatus === '已註冊' ? green[100] : red[100],
                   color: device.registrationStatus === '已註冊' ? green[800] : red[800],
                   fontWeight: 'bold'
               }}
             >
               {device.registrationStatus}
             </Typography>
          </Box>
          
          <Divider sx={{ my: 1.5 }} />

          <Typography variant="h6" component="div" gutterBottom>
            {device.deviceNo}
          </Typography>
          
          <Typography color="text.secondary" variant="body2">
            類別: {device.category}
          </Typography>
          
          <Typography color="text.secondary" variant="body2">
            公司: {device.companyName}
          </Typography>
          
          {/* 按鈕區 */}
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button 
              size="small" 
              variant="outlined" 
              startIcon={<EditIcon />}
              onClick={handleEditNotes}
              fullWidth
            >
              備註
            </Button>
            {/* 註銷按鈕 (只有管理員可見) */}
            {isAdmin && (
              <Button 
                size="small" 
                variant="contained" 
                color="error"
                startIcon={<BlockIcon />}
                onClick={handleUnregister}
                fullWidth
              >
                註銷
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

export default DeviceCard;