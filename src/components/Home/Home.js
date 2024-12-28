import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  SportsEsports,
  EmojiEvents,
  Group,
  TrendingUp,
} from '@mui/icons-material';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { firestore } from '../../firebase';

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const [games, setGames] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch games
        const gamesQuery = query(
          collection(firestore, 'games'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const gamesSnapshot = await getDocs(gamesQuery);
        const gamesData = gamesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGames(gamesData);

        // Fetch tournaments
        const tournamentsQuery = query(
          collection(firestore, 'tournaments'),
          where('status', '==', 'upcoming'),
          limit(3)
        );
        const tournamentsSnapshot = await getDocs(tournamentsQuery);
        const tournamentsData = tournamentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTournaments(tournamentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user.displayName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Stay updated with the latest games and tournaments.
        </Typography>
      </Box>

      {/* Stats Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'primary.light',
              color: 'white',
            }}
          >
            <SportsEsports sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Available Games</Typography>
            <Typography variant="h4">{games.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'secondary.light',
              color: 'white',
            }}
          >
            <EmojiEvents sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Active Tournaments</Typography>
            <Typography variant="h4">{tournaments.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'success.light',
              color: 'white',
            }}
          >
            <Group sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Your Teams</Typography>
            <Typography variant="h4">0</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'warning.light',
              color: 'white',
            }}
          >
            <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Your Rank</Typography>
            <Typography variant="h4">N/A</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Featured Games */}
      <Typography variant="h5" gutterBottom mb={2}>
        Featured Games
      </Typography>
      <Grid container spacing={3} mb={4}>
        {games.map((game) => (
          <Grid item xs={12} sm={6} md={4} key={game.id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={game.imageUrl || '/game-placeholder.jpg'}
                alt={game.title}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {game.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {game.description}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    size="small"
                    label={game.category}
                    color="primary"
                  />
                  <Box sx={{ flexGrow: 1 }} />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {/* TODO: Implement game details/join */}}
                  >
                    Play Now
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Upcoming Tournaments */}
      <Typography variant="h5" gutterBottom mb={2}>
        Upcoming Tournaments
      </Typography>
      <Grid container spacing={3}>
        {tournaments.map((tournament) => (
          <Grid item xs={12} sm={6} md={4} key={tournament.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {tournament.name}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Game: {tournament.game}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Prize Pool: ${tournament.prizePool}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start Date: {new Date(tournament.startDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => {/* TODO: Implement tournament registration */}}
                >
                  Register Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;
