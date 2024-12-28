import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import {
  NotificationsActive,
  NotificationsOff,
  Close as CloseIcon,
} from '@mui/icons-material';
import NotificationService from '../../services/NotificationService';

const NotificationPermission = () => {
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    // Check if we should show the permission dialog
    const shouldShowDialog = () => {
      const lastPrompt = localStorage.getItem('notificationPromptTime');
      if (!lastPrompt) return true;

      const now = new Date().getTime();
      const lastPromptTime = parseInt(lastPrompt);
      const threeDays = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

      return now - lastPromptTime > threeDays;
    };

    if (Notification.permission === 'default' && shouldShowDialog()) {
      setOpen(true);
    }
  }, []);

  const handleRequestPermission = async () => {
    try {
      const result = await NotificationService.requestPermission();
      setPermission(result ? 'granted' : 'denied');
      if (result) {
        // Send a test notification
        NotificationService.createNotification(
          'system',
          '🎉 Notifications Enabled!',
          'You will now receive important updates about your account, games, and tournaments.',
          'system',
          'success'
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
    handleClose();
  };

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem('notificationPromptTime', new Date().getTime().toString());
  };

  const handleMaybeLater = () => {
    handleClose();
    // Set a shorter reminder time for "Maybe Later" (1 day)
    const oneDayFromNow = new Date().getTime() - (2 * 24 * 60 * 60 * 1000);
    localStorage.setItem('notificationPromptTime', oneDayFromNow.toString());
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div">
          Enable Notifications
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
          {permission === 'granted' ? (
            <NotificationsActive color="primary" sx={{ fontSize: 64 }} />
          ) : (
            <NotificationsOff color="action" sx={{ fontSize: 64 }} />
          )}
          <Typography variant="body1" align="center">
            Stay updated with real-time notifications about:
          </Typography>
          <Box sx={{ width: '100%', pl: 2 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Wallet transactions and updates 💰
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Tournament announcements and results 🏆
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Game invitations and updates 🎮
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Account security alerts 🔒
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" align="center">
            You can change this setting anytime in your browser preferences.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={handleMaybeLater} color="inherit">
          Maybe Later
        </Button>
        <Box>
          <Button onClick={handleClose} color="inherit" sx={{ mr: 1 }}>
            Don't Allow
          </Button>
          <Button
            onClick={handleRequestPermission}
            variant="contained"
            color="primary"
            startIcon={<NotificationsActive />}
          >
            Enable Notifications
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationPermission;
