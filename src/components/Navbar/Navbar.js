import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  CircularProgress,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  EmojiEvents,
  SportsEsports,
  Group,
  Person,
  AccountBalanceWallet,
  ExitToApp,
  Home,
  Forum,
  LiveTv,
  Analytics,
  Settings,
} from '@mui/icons-material';
import { logout } from '../../redux/actions/authAction';
import useAdmin from '../../hooks/useAdmin';
import NotificationMenu from '../Notifications/NotificationMenu';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useSelector((state) => state.auth);
  const { isAdmin, loading } = useAdmin();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenu = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const menuItems = {
    main: [
      { text: 'Home', icon: <Home />, path: '/' },
      { text: 'Tournaments', icon: <EmojiEvents />, path: '/tournaments' },
      { text: 'Game Center', icon: <SportsEsports />, path: '/game-center' },
      { text: 'Community', icon: <Forum />, path: '/community' },
      { text: 'Live Streams', icon: <LiveTv />, path: '/streams' },
      { text: 'Analytics', icon: <Analytics />, path: '/analytics' },
    ],
  };

  const adminMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Tournament Management', icon: <EmojiEvents />, path: '/admin/tournaments' },
    { text: 'Game Management', icon: <SportsEsports />, path: '/admin/games' },
    { text: 'User Management', icon: <Group />, path: '/admin/users' },
    { text: 'Settings', icon: <Settings />, path: '/admin/settings' },
  ];

  const renderMenuItems = (items) => (
    <List component="div" disablePadding>
      {items.map((item) => (
        <ListItem
          key={item.path}
          button
          onClick={() => handleNavigation(item.path)}
          sx={{
            pl: 2,
            bgcolor: location.pathname === item.path ? 'action.selected' : 'inherit',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
  );

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <Avatar sx={{ mr: 1 }} src={user?.photoURL} />
        <Typography variant="subtitle1" noWrap>
          {user?.displayName || user?.email}
        </Typography>
      </Box>
      <Divider />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : isAdmin ? (
        renderMenuItems(adminMenuItems)
      ) : (
        renderMenuItems(menuItems.main)
      )}
      <Divider />
      <ListItem button onClick={() => handleNavigation('/wallet')}>
        <ListItemIcon><AccountBalanceWallet /></ListItemIcon>
        <ListItemText primary="Wallet" />
      </ListItem>
      <ListItem button onClick={handleLogout}>
        <ListItemIcon><ExitToApp /></ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItem>
    </Box>
  );

  // Don't show navbar on login, register, and landing pages
  if (['/login', '/register', '/'].includes(location.pathname)) {
    return null;
  }

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: { xs: 1, md: 0 }, 
                mr: { md: 4 },
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
              onClick={() => handleNavigation(isAdmin ? '/admin/dashboard' : '/')}
            >
              Containders
            </Typography>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                flexGrow: 1,
                overflow: 'auto',
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none'
              }}>
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : isAdmin ? (
                  <>
                    {adminMenuItems.map((item) => (
                      <Button
                        key={item.path}
                        color="inherit"
                        onClick={() => handleNavigation(item.path)}
                        sx={{
                          textTransform: 'none',
                          minWidth: 'auto',
                          color: location.pathname === item.path ? 'primary.main' : 'inherit'
                        }}
                        startIcon={item.icon}
                      >
                        {item.text}
                      </Button>
                    ))}
                  </>
                ) : (
                  <>
                    {menuItems.main.map((item) => (
                      <Button
                        key={item.path}
                        color="inherit"
                        onClick={() => handleNavigation(item.path)}
                        sx={{
                          textTransform: 'none',
                          minWidth: 'auto',
                          color: location.pathname === item.path ? 'primary.main' : 'inherit'
                        }}
                        startIcon={item.icon}
                      >
                        {item.text}
                      </Button>
                    ))}
                  </>
                )}
              </Box>
            )}

            {/* Right side icons */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {!isAdmin && <NotificationMenu />}
              
              <IconButton
                onClick={handleProfileMenu}
                color="inherit"
                sx={{ ml: 1 }}
              >
                <Avatar
                  src={user?.photoURL}
                  sx={{ width: 32, height: 32 }}
                />
              </IconButton>

              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: { width: 200 }
                }}
              >
                <MenuItem onClick={() => {
                  handleNavigation('/profile');
                  handleClose();
                }}>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={() => {
                  handleNavigation('/wallet');
                  handleClose();
                }}>
                  <ListItemIcon>
                    <AccountBalanceWallet fontSize="small" />
                  </ListItemIcon>
                  Wallet
                </MenuItem>
                <MenuItem onClick={() => {
                  handleNavigation('/settings');
                  handleClose();
                }}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <ExitToApp fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
