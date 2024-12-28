import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import gameTheme from './theme/gameTheme';
import { NotificationProvider } from './context/NotificationContext';
import NotificationPermission from './components/Notifications/NotificationPermission';

// Components
import Navbar from './components/Navbar/Navbar';
import LandingPage from './components/LandingPage/LandingPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/Profile/Profile';

// Admin Components
import AdminDashboard from './components/Admin/AdminDashboard';
import TournamentManagement from './components/Admin/TournamentManagement';
import GameManagement from './components/Admin/GameManagement';
import UserManagement from './components/Admin/UserManagement';
import ContentManagement from './components/Admin/ContentManagement';
import AdminAnalytics from './components/Admin/AdminAnalytics';
import AdminSettings from './components/Admin/AdminSettings';
import AdminWalletRequests from './components/Admin/AdminWalletRequests';
import AdminTransaction from './components/Admin/AdminTransaction';

// User Components
import UserHome from './components/User/UserHome';
import Teams from './components/Teams/Teams';
import Community from './components/Community/Community';
import LiveStreams from './components/Streams/LiveStreams';
import Analytics from './components/Analytics/Analytics';
import Settings from './components/Settings/Settings';
import Wallet from './components/Wallet/Wallet';
import NotFound from './components/NotFound/NotFound';
import Tournaments from './components/Tournaments/Tournaments';
import TournamentDetailsPage from './components/Tournaments/TournamentDetailsPage';
import UserNotifications from './components/User/UserNotifications';

// Custom Hooks
import useAdmin from './hooks/useAdmin';

import { setUserFromLocalStorage } from './redux/actions/authAction';

// Protected Route for authenticated users
const UserRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const { isAdmin } = useAdmin();
  
  if (!user) return <Navigate to="/login" />;
  if (isAdmin) return <Navigate to="/admin" />;
  return children;
};

// Admin Route - only accessible by admins
const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/home" />;
  return children;
};

// Public Route - redirects authenticated users based on their role
const PublicRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const { isAdmin } = useAdmin();

  if (user) {
    return <Navigate to={isAdmin ? '/admin' : '/home'} />;
  }
  return children;
};

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isAdmin } = useAdmin();

  useEffect(() => {
    dispatch(setUserFromLocalStorage());
  }, [dispatch]);

  return (
    <ThemeProvider theme={gameTheme}>
      <CssBaseline />
      <NotificationProvider>
        <Router>
          <NotificationPermission />
          <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1, pt: '64px' }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                {/* User Routes */}
                <Route path="/home" element={<UserRoute><UserHome /></UserRoute>} />
                <Route path="/teams" element={<UserRoute><Teams /></UserRoute>} />
                <Route path="/community" element={<UserRoute><Community /></UserRoute>} />
                <Route path="/streams" element={<UserRoute><LiveStreams /></UserRoute>} />
                <Route path="/analytics" element={<UserRoute><Analytics /></UserRoute>} />
                <Route path="/profile" element={<UserRoute><Profile /></UserRoute>} />
                <Route path="/settings" element={<UserRoute><Settings /></UserRoute>} />
                <Route path="/wallet" element={<UserRoute><Wallet /></UserRoute>} />
                <Route path="/tournaments" element={<UserRoute><Tournaments /></UserRoute>} />
                <Route path="/tournament/:id" element={<UserRoute><TournamentDetailsPage /></UserRoute>} />
                <Route path="/notifications" element={<UserRoute><UserNotifications /></UserRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/wallet-requests" element={<AdminRoute><AdminWalletRequests /></AdminRoute>} />
                <Route path="/admin/tournaments" element={<AdminRoute><TournamentManagement /></AdminRoute>} />
                <Route path="/admin/games" element={<AdminRoute><GameManagement /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
                <Route path="/admin/content" element={<AdminRoute><ContentManagement /></AdminRoute>} />
                <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
                <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
                <Route path="/admin/transactions" element={<AdminRoute><AdminTransaction /></AdminRoute>} />

                {/* Default Route - Redirect based on auth status */}
                <Route path="*" element={
                  user ? (
                    <Navigate to={isAdmin ? '/admin' : '/home'} replace />
                  ) : (
                    <NotFound />
                  )
                } />
              </Routes>
            </Box>
          </Box>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
