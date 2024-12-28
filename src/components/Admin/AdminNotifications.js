import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { 
  collection, 
  query, 
  getDocs, 
  where,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import NotificationService from '../../services/NotificationService';

const AdminNotifications = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');
  const [sentNotifications, setSentNotifications] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  const loadSentNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('type', '==', 'admin')
      );
      
      const querySnapshot = await getDocs(q);
      const notifications = [];
      querySnapshot.forEach((doc) => {
        notifications.push({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() 
        });
      });

      // Sort notifications by createdAt in memory
      notifications.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt - a.createdAt;
      });

      setSentNotifications(notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      showSnackbar('Error loading notifications. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSentNotifications();
  }, [loadSentNotifications]);

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      showSnackbar('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending admin notification:', {
        title: title.trim(),
        message: message.trim(),
        priority
      });

      await NotificationService.sendAdminNotification(
        title.trim(),
        message.trim(),
        'announcement',
        priority
      );

      console.log('Admin notification sent successfully');
      showSnackbar('Notifications sent successfully to all users', 'success');
      clearForm();
      loadSentNotifications();
    } catch (error) {
      console.error('Error sending notifications:', error);
      showSnackbar('Failed to send notifications. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditNotification = async () => {
    if (!selectedNotification) return;
    
    setLoading(true);
    try {
      const notificationRef = doc(db, 'notifications', selectedNotification.id);
      await updateDoc(notificationRef, {
        title: title.trim(),
        message: message.trim(),
        priority,
        updatedAt: serverTimestamp()
      });

      showSnackbar('Notification updated successfully', 'success');
      handleCloseDialog();
      loadSentNotifications();
    } catch (error) {
      console.error('Error updating notification:', error);
      showSnackbar('Failed to update notification. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, 'notifications', id));
      showSnackbar('Notification deleted successfully', 'success');
      loadSentNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      showSnackbar('Failed to delete notification. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (notification) => {
    setSelectedNotification(notification);
    setTitle(notification.title);
    setMessage(notification.message);
    setPriority(notification.priority || 'normal');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedNotification(null);
    clearForm();
  };

  const clearForm = () => {
    setTitle('');
    setMessage('');
    setPriority('normal');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Send New Notification
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                label="Priority"
                onChange={(e) => setPriority(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              onClick={handleSendNotification}
              disabled={loading || !title.trim() || !message.trim()}
              fullWidth
            >
              Send to All Users
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Sent Notifications
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : sentNotifications.length > 0 ? (
          <Grid container spacing={2}>
            {sentNotifications.map((notification) => (
              <Grid item xs={12} key={notification.id}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 2,
                    borderLeft: 6,
                    borderColor: notification.priority === 'high' ? 'error.main' : 
                               notification.priority === 'normal' ? 'primary.main' : 
                               'info.main'
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs>
                      <Typography variant="h6">{notification.title}</Typography>
                      <Typography variant="body2" sx={{ my: 1 }}>
                        {notification.message}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary' }}>
                        <Typography variant="caption">
                          Priority: {notification.priority || 'normal'}
                        </Typography>
                        <Typography variant="caption">
                          Sent: {formatDate(notification.createdAt)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item>
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => handleOpenDialog(notification)}
                          disabled={loading}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDeleteNotification(notification.id)}
                          disabled={loading}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" color="text.secondary" align="center">
            No notifications sent yet
          </Typography>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Notification</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priority}
                  label="Priority"
                  onChange={(e) => setPriority(e.target.value)}
                  disabled={loading}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleEditNotification}
            variant="contained"
            disabled={loading || !title.trim() || !message.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminNotifications;
