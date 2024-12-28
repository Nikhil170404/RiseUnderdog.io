import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
} from '@mui/material';
import {
  EmojiEvents,
  Group,
  SportsEsports,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const UserHome = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const quickActions = [
    {
      title: 'Tournaments',
      description: 'View and register for upcoming tournaments',
      icon: <EmojiEvents fontSize="large" />,
      path: '/tournaments',
      color: '#FF6B6B',
    },
    {
      title: 'Teams',
      description: 'Manage your teams and view team statistics',
      icon: <Group fontSize="large" />,
      path: '/teams',
      color: '#4ECDC4',
    },
    {
      title: 'Players',
      description: 'Connect with other players and view profiles',
      icon: <Person fontSize="large" />,
      path: '/players',
      color: '#45B7D1',
    },
    {
      title: 'Games',
      description: 'Browse available games and your game statistics',
      icon: <SportsEsports fontSize="large" />,
      path: '/games',
      color: '#96CEB4',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.displayName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening in your gaming world
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {quickActions.map((action) => (
          <Grid item xs={12} sm={6} md={3} key={action.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box
                  sx={{
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    '& > svg': {
                      fontSize: 48,
                      color: action.color,
                    },
                  }}
                >
                  {action.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {action.description}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate(action.path)}
                  sx={{
                    bgcolor: action.color,
                    '&:hover': {
                      bgcolor: action.color,
                      filter: 'brightness(0.9)',
                    },
                  }}
                >
                  View {action.title}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default UserHome;
