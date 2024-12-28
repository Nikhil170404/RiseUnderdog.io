import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Badge,
  Divider,
  Chip,
  useTheme,
} from '@mui/material';
import {
  NotificationsOutlined,
  MonetizationOn,
  EmojiEvents,
  SportsEsports,
  Person,
  AccessTime,
  Announcement,
  Campaign,
  Update,
  LocalOffer,
} from '@mui/icons-material';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import NotificationService from '../../services/NotificationService';

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useSelector((state) => state.auth);
  const theme = useTheme();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'wallet':
        return <MonetizationOn color="primary" />;
      case 'tournament':
        return <EmojiEvents color="secondary" />;
      case 'game':
        return <SportsEsports color="success" />;
      case 'user':
        return <Person color="info" />;
      case 'announcement':
        return <Announcement color="primary" />;
      case 'update':
        return <Update color="info" />;
      case 'alert':
        return <Campaign color="error" />;
      case 'promotion':
        return <LocalOffer color="secondary" />;
      default:
        return <NotificationsOutlined />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return theme.palette.error.main;
      case 'normal':
        return theme.palette.primary.main;
      case 'low':
        return theme.palette.text.secondary;
      default:
        return theme.palette.text.primary;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate();
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };

  const loadNotifications = useCallback(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsList = [];
      let unread = 0;

      snapshot.forEach((doc) => {
        const notification = { id: doc.id, ...doc.data() };
        notificationsList.push(notification);
        if (!notification.read) unread++;
      });

      setNotifications(notificationsList);
      setUnreadCount(unread);
    });

    return unsubscribe;
  }, [user?.uid]);

  useEffect(() => {
    const unsubscribe = loadNotifications();
    return () => unsubscribe?.();
  }, [loadNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Badge badgeContent={unreadCount} color="error" sx={{ mr: 2 }}>
            <NotificationsOutlined />
          </Badge>
          <Typography variant="h6">
            Your Notifications
          </Typography>
        </Box>

        {notifications.length === 0 ? (
          <Typography color="textSecondary" align="center" py={3}>
            No notifications yet
          </Typography>
        ) : (
          <List>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" component="span">
                          {notification.title}
                        </Typography>
                        {notification.priority && (
                          <Chip
                            label={notification.priority}
                            size="small"
                            sx={{
                              color: getPriorityColor(notification.priority),
                              borderColor: getPriorityColor(notification.priority),
                              bgcolor: 'transparent',
                            }}
                            variant="outlined"
                          />
                        )}
                        {!notification.read && (
                          <Chip
                            label="New"
                            size="small"
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {notification.message}
                        </Typography>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          mt={1}
                        >
                          <AccessTime fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(notification.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  {!notification.read && (
                    <IconButton
                      edge="end"
                      onClick={() => handleMarkAsRead(notification.id)}
                      sx={{ ml: 1 }}
                    >
                      <NotificationsOutlined />
                    </IconButton>
                  )}
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default UserNotifications;
