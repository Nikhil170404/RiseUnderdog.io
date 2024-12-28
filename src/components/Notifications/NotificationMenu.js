import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MonetizationOn,
  EmojiEvents,
  SportsEsports,
  Person,
  Campaign,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import NotificationService from '../../services/NotificationService';
import { formatDistanceToNow } from 'date-fns';

const NotificationMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user?.uid) return;

    console.log('Setting up notification listener for user:', user.uid);
    setLoading(true);
    let retryCount = 0;
    const maxRetries = 3;
    let retryTimeout;

    const setupListener = () => {
      // Create a compound query
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      try {
        const unsubscribe = onSnapshot(q, (snapshot) => {
          console.log('Notification snapshot received:', snapshot.size, 'notifications');
          const notificationsList = [];
          let unread = 0;

          snapshot.forEach((doc) => {
            const data = doc.data();
            const notification = {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date()
            };
            notificationsList.push(notification);
            if (!notification.read) {
              unread++;
            }
          });

          console.log('Updated notifications:', notificationsList);
          console.log('Unread count:', unread);

          setNotifications(notificationsList);
          setUnreadCount(unread);
          setLoading(false);
          setError(null);
          retryCount = 0; // Reset retry count on success
        }, (error) => {
          console.error('Error listening to notifications:', error);
          setLoading(false);
          
          if (error.code === 'failed-precondition' && error.message.includes('index')) {
            setError('Notification system is being set up. Retrying in a few seconds...');
            
            // Retry logic
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`Retrying in 5 seconds... (Attempt ${retryCount}/${maxRetries})`);
              retryTimeout = setTimeout(() => {
                console.log('Retrying notification setup...');
                setupListener();
              }, 5000);
            } else {
              setError('Unable to load notifications. Please try again later.');
            }
          } else {
            setError('Failed to load notifications. Please try again later.');
          }
        });

        return () => {
          console.log('Cleaning up notification listener');
          unsubscribe();
          if (retryTimeout) {
            clearTimeout(retryTimeout);
          }
        };
      } catch (error) {
        console.error('Failed to set up notification listener:', error);
        setLoading(false);
        setError('Failed to initialize notifications. Please refresh the page.');
      }
    };

    setupListener();
    return () => {
      console.log('Cleaning up notification listener');
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [user?.uid]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await NotificationService.markAsRead(notification.id);
    }
    handleClose();
    navigate(notification.url || '/');
  };

  const handleMarkAllAsRead = async () => {
    if (user?.uid) {
      await NotificationService.markAllAsRead(user.uid);
    }
    handleClose();
  };

  const getNotificationIcon = (type, senderRole) => {
    switch (type) {
      case 'wallet':
        return <MonetizationOn color="primary" />;
      case 'tournament':
        return <EmojiEvents color="secondary" />;
      case 'game':
        return <SportsEsports color="success" />;
      case 'user':
        return <Person color="info" />;
      case 'admin':
        return senderRole === 'system' ? 
          <Campaign color="primary" /> : 
          <Campaign color="error" />;
      default:
        return <NotificationsIcon color="action" />;
    }
  };

  const getNotificationMessage = (notification) => {
    if (notification.type === 'admin' && notification.senderRole === 'system') {
      return (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: !notification.read ? 700 : 400 }}>
            {notification.title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {notification.message}
          </Typography>
          <Typography variant="caption" color="primary">
            Original message: "{notification.originalMessage}"
          </Typography>
        </>
      );
    }

    return (
      <>
        <Typography variant="subtitle2" sx={{ fontWeight: !notification.read ? 700 : 400 }}>
          {notification.title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {notification.message}
        </Typography>
      </>
    );
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label={`${unreadCount} new notifications`}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: '350px',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />
        {error ? (
          <MenuItem disabled>
            <Typography variant="body2" color="textSecondary">
              {error}
            </Typography>
          </MenuItem>
        ) : notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="textSecondary">
              {loading ? 'Loading notifications...' : 'No notifications'}
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                py: 1.5,
                px: 2,
                borderLeft: !notification.read ? '4px solid #1976d2' : 'none',
                backgroundColor: !notification.read ? 'action.hover' : 'inherit',
              }}
            >
              <Box sx={{ mr: 2, mt: 0.5 }}>
                {getNotificationIcon(notification.type, notification.senderRole)}
              </Box>
              <Box sx={{ flex: 1 }}>
                {getNotificationMessage(notification)}
                <Typography variant="caption" color="textSecondary" display="block">
                  {notification.createdAt ? formatDistanceToNow(notification.createdAt, { addSuffix: true }) : 'Just now'}
                </Typography>
              </Box>
              {!notification.read && (
                <CircleIcon sx={{ fontSize: 8, color: 'primary.main', ml: 1, mt: 1 }} />
              )}
            </MenuItem>
          ))
        )}
        {notifications.length > 0 && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Button
              size="small"
              onClick={() => {
                handleClose();
                navigate('/notifications');
              }}
            >
              View All
            </Button>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationMenu;
