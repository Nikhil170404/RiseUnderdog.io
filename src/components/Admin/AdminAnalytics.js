import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import {
  PeopleAlt,
  SportsEsports,
  EmojiEvents,
  AccountBalance,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }) => (
  <Paper sx={{ p: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography color="textSecondary" variant="h6" component="h2">
          {title}
        </Typography>
        <Typography variant="h4" component="h1">
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          backgroundColor: `${color}.light`,
          borderRadius: '50%',
          p: 1,
          display: 'flex',
        }}
      >
        {icon}
      </Box>
    </Box>
  </Paper>
);

const AdminAnalytics = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      icon: <PeopleAlt sx={{ color: 'primary.main' }} />,
      color: 'primary',
    },
    {
      title: 'Active Games',
      value: '56',
      icon: <SportsEsports sx={{ color: 'success.main' }} />,
      color: 'success',
    },
    {
      title: 'Tournaments',
      value: '23',
      icon: <EmojiEvents sx={{ color: 'warning.main' }} />,
      color: 'warning',
    },
    {
      title: 'Revenue',
      value: '$12.4K',
      icon: <AccountBalance sx={{ color: 'info.main' }} />,
      color: 'info',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Analytics Dashboard</Typography>
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Activity Overview
            </Typography>
            {/* Add charts or graphs here */}
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="textSecondary">
                Charts and detailed analytics will be displayed here
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminAnalytics;
