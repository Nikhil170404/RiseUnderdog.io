import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Badge,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Person as UserIcon,
  SportsEsports as GameIcon,
  EmojiEvents as TournamentIcon,
} from '@mui/icons-material';
import { db, collection, query, where, onSnapshot } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import NotificationComponent from '../Notifications/NotificationComponent';
import AdminLayout from './AdminLayout';
import AdminNotifications from './AdminNotifications';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    totalUsers: 0,
    activeGames: 0,
    activeTournaments: 0,
  });
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('wallet');

  useEffect(() => {
    // Listen to deposit requests
    const depositQuery = query(
      collection(db, 'depositRequests'),
      where('status', '==', 'pending')
    );
    const unsubscribeDeposits = onSnapshot(depositQuery, (snapshot) => {
      setStats(prev => ({ ...prev, pendingDeposits: snapshot.size }));
    });

    // Listen to withdrawal requests
    const withdrawalQuery = query(
      collection(db, 'withdrawalRequests'),
      where('status', '==', 'pending')
    );
    const unsubscribeWithdrawals = onSnapshot(withdrawalQuery, (snapshot) => {
      setStats(prev => ({ ...prev, pendingWithdrawals: snapshot.size }));
    });

    // Listen to users
    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      setStats(prev => ({ ...prev, totalUsers: snapshot.size }));
    });

    // Listen to active games
    const gamesQuery = query(
      collection(db, 'games'),
      where('status', '==', 'active')
    );
    const unsubscribeGames = onSnapshot(gamesQuery, (snapshot) => {
      setStats(prev => ({ ...prev, activeGames: snapshot.size }));
    });

    // Listen to active tournaments
    const tournamentsQuery = query(
      collection(db, 'tournaments'),
      where('status', '==', 'active')
    );
    const unsubscribeTournaments = onSnapshot(tournamentsQuery, (snapshot) => {
      setStats(prev => ({ ...prev, activeTournaments: snapshot.size }));
    });

    return () => {
      unsubscribeDeposits();
      unsubscribeWithdrawals();
      unsubscribeUsers();
      unsubscribeGames();
      unsubscribeTournaments();
    };
  }, []);

  const StatCard = ({ title, value, icon: Icon, onClick, badge }) => (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { bgcolor: 'action.hover' } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">
              {value}
            </Typography>
          </Box>
          <Badge badgeContent={badge} color="error">
            <Icon sx={{ fontSize: 40, color: 'primary.main' }} />
          </Badge>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4">Admin Dashboard</Typography>
          <NotificationComponent />
        </Box>
        
        <Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)}>
          <Tab label="Wallet Requests" value="wallet" />
          <Tab label="Tournaments" value="tournaments" />
          <Tab label="Users" value="users" />
          <Tab label="Games" value="games" />
          <Tab label="Notifications" value="notifications" />
        </Tabs>
        
        {activeTab === 'wallet' && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Pending Wallet Requests"
                value={stats.pendingDeposits + stats.pendingWithdrawals}
                icon={WalletIcon}
                onClick={() => navigate('/admin/wallet-requests')}
                badge={stats.pendingDeposits + stats.pendingWithdrawals}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon={UserIcon}
                onClick={() => navigate('/admin/users')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Active Games"
                value={stats.activeGames}
                icon={GameIcon}
                onClick={() => navigate('/admin/games')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Active Tournaments"
                value={stats.activeTournaments}
                icon={TournamentIcon}
                onClick={() => navigate('/admin/tournaments')}
              />
            </Grid>
          </Grid>
        )}
        {activeTab === 'tournaments' && <div>TournamentManagement</div>}
        {activeTab === 'users' && <div>UserManagement</div>}
        {activeTab === 'games' && <div>GameManagement</div>}
        {activeTab === 'notifications' && <AdminNotifications />}
      </Container>
    </AdminLayout>
  );
};

export default AdminDashboard;
