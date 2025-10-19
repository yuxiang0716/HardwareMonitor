import React, { useState, useEffect } from 'react';
import { 
    Modal, Box, Typography, Paper, TextField, Button, CircularProgress, Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

// 假設您已在 types/Device.ts 中定義 UpdateNotesPayload
import { updateDeviceNotes } from '../services/apiClient'; 
import type { UpdateNotesPayload } from '../types/Device';

interface EditNotesModalProps {
    deviceNo: string | null;
    currentNotes: string | null;
    open: boolean;
    onClose: (didUpdate: boolean) => void;
    onSuccess: (deviceNo: string, newNotes: string) => void;
}

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const EditNotesModal: React.FC<EditNotesModalProps> = ({ deviceNo, currentNotes, open, onClose, onSuccess }) => {
    const [notes, setNotes] = useState(currentNotes || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 當 Modal 開啟時，重設備註內容
    useEffect(() => {
        if (open) {
            setNotes(currentNotes || '');
            setError(null);
        }
    }, [open, currentNotes]);

    const handleSave = async () => {
        if (!deviceNo) return;

        setLoading(true);
        setError(null);
        try {
            const payload: UpdateNotesPayload = { notes: notes.trim() === '' ? null : notes };
            await updateDeviceNotes(deviceNo, payload);

            // 呼叫父元件的 onSuccess，用於更新 HomePage 中的資料
            onSuccess(deviceNo, payload.notes || ''); 
            
            onClose(true); // 關閉並標記已更新
        } catch (err: any) {
            const message = err.response?.data?.Message || '更新備註失敗。';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={() => onClose(false)}>
            <Paper sx={style}>
                <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                    編輯設備備註: {deviceNo}
                </Typography>
                
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <TextField
                    label="備註內容"
                    multiline
                    rows={4}
                    fullWidth
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    margin="normal"
                    disabled={loading}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                    <Button 
                        onClick={() => onClose(false)} 
                        disabled={loading}
                    >
                        取消
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        onClick={handleSave}
                        disabled={loading}
                    >
                        儲存
                    </Button>
                </Box>
            </Paper>
        </Modal>
    );
};

export default EditNotesModal;