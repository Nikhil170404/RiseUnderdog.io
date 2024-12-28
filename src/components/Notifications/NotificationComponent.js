import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider,
  Button,
  Tooltip,
} from '@mui/material';
import {
  NotificationsOutlined,
  MonetizationOn,
  EmojiEvents,
  SportsEsports,
  Person,
  AccessTime,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import useAdmin from '../../hooks/useAdmin';

const NotificationComponent = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
      default:
        return <NotificationsOutlined />;
    }
  };

  const getNotificationAction = (notification) => {
    switch (notification.type) {
      case 'wallet':
        return isAdmin ? '/admin/wallet-requests' : '/wallet';
      case 'tournament':
        return isAdmin ? '/admin/tournaments' : '/tournaments';
      case 'game':
        return isAdmin ? '/admin/games' : '/game-center';
      case 'user':
        return isAdmin ? '/admin/users' : '/profile';
      default:
        return '/';
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    navigate(getNotificationAction(notification));
    handleClose();
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate();
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) {
        return 'just now';
      }

      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
      }

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      }

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      }

      const diffInWeeks = Math.floor(diffInDays / 7);
      if (diffInWeeks < 4) {
        return `${diffInWeeks}w ago`;
      }

      const diffInMonths = Math.floor(diffInDays / 30);
      if (diffInMonths < 12) {
        return `${diffInMonths}mo ago`;
      }

      const diffInYears = Math.floor(diffInDays / 365);
      return `${diffInYears}y ago`;
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success.main';
      case 'rejected':
        return 'error.main';
      case 'pending':
        return 'warning.main';
      default:
        return 'text.primary';
    }
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{ mr: 2 }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsOutlined />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: '80vh',
            width: '360px',
            overflowX: 'hidden',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </Typography>
          <Box>
            {unreadCount > 0 && (
              <Button size="small" onClick={markAllAsRead} sx={{ mr: 1 }}>
                Mark all as read
              </Button>
            )}
            <Button
              size="small"
              color="primary"
              onClick={() => {
                navigate('/notifications');
                handleClose();
              }}
            >
              View All
            </Button>
          </Box>
        </Box>
        <Divider />
        
        {notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" component="div">
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mt: 0.5,
                            gap: 1,
                          }}
                        >
                          <AccessTime sx={{ fontSize: 14 }} />
                          <Typography variant="caption" color="text.secondary">
                            {getTimeAgo(notification.createdAt)}
                          </Typography>
                          {notification.status && (
                            <>
                              <Box
                                component="span"
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  backgroundColor: getStatusColor(notification.status),
                                  display: 'inline-block',
                                  ml: 1,
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{ color: getStatusColor(notification.status) }}
                              >
                                {notification.status}
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  {!notification.read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        ml: 1,
                      }}
                    />
                  )}
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
};

export default NotificationComponent;
