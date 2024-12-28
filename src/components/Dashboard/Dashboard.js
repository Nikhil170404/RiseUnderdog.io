import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
} from '@mui/material';
import {
  SportsEsports,
  EmojiEvents,
  People,
  Person,
  ArrowForward,
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  // Mock data - replace with real API calls later
  const upcomingTournaments = [
    { id: 1, name: 'Warzone Championship', date: '2024-01-15', prize: '$5,000' },
    { id: 2, name: 'CSGO Masters', date: '2024-01-20', prize: '$3,000' },
    { id: 3, name: 'Valorant Cup', date: '2024-01-25', prize: '$4,000' },
  ];

  const stats = [
    { icon: <SportsEsports />, label: 'Tournaments Played', value: '12' },
    { icon: <EmojiEvents />, label: 'Tournaments Won', value: '3' },
    { icon: <People />, label: 'Team Members', value: '5' },
    { icon: <Person />, label: 'Ranking', value: '#120' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #1a237e 0%, #4a148c 100%)', color: 'white' }}>
            <Typography variant="h4" gutterBottom>
              Welcome Back, {user.name || 'Player'}!
            </Typography>
            <Typography variant="subtitle1">
              Your next tournament starts in 2 days. Get ready!
            </Typography>
          </Paper>
        </Grid>

        {/* Stats Cards */}
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <IconButton color="primary" sx={{ mb: 1 }}>
                  {stat.icon}
                </IconButton>
                <Typography variant="h4" component="div">
                  {stat.value}
                </Typography>
                <Typography color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Upcoming Tournaments */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Upcoming Tournaments"
              action={
                <Button
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/tournaments')}
                >
                  View All
                </Button>
              }
            />
            <CardContent>
              <List>
                {upcomingTournaments.map((tournament) => (
                  <ListItem key={tournament.id} divider>
                    <ListItemText
                      primary={tournament.name}
                      secondary={`Date: ${tournament.date}`}
                    />
                    <ListItemSecondaryAction>
                      <Typography color="primary" variant="subtitle2">
                        {tournament.prize}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Team Activity */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Team Activity"
              action={
                <Button
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/teams')}
                >
                  View Team
                </Button>
              }
            />
            <CardContent>
              <List>
                <ListItem divider>
                  <ListItemText
                    primary="Team Practice"
                    secondary="Today at 8:00 PM"
                  />
                </ListItem>
                <ListItem divider>
                  <ListItemText
                    primary="Strategy Meeting"
                    secondary="Tomorrow at 6:00 PM"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Tournament Preparation"
                    secondary="Friday at 7:00 PM"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
