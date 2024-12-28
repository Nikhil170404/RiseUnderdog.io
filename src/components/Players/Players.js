import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  LinearProgress,
  Dialog,
  useTheme,
} from '@mui/material';
import {
  Star,
  Group as TeamIcon,
} from '@mui/icons-material';
import { db, collection, query, orderBy, onSnapshot } from '../../firebase';
import PlayerProfile from './PlayerProfile';

const Players = () => {
  const theme = useTheme();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('stats.rank', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlayers(playersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenProfile = (player) => {
    setSelectedPlayer(player);
    setProfileOpen(true);
  };

  const getRankColor = (rank) => {
    const ranks = {
      'Global Elite': '#FFD700',
      'Supreme': '#C0C0C0',
      'Distinguished': '#CD7F32',
      'Master': '#9370DB',
    };
    return ranks[rank] || theme.palette.primary.main;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Top Players
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View detailed statistics and rankings of all players
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {players.map((player) => (
          <Grid item xs={12} sm={6} md={4} key={player.id}>
            <Card 
              elevation={3}
              sx={{
                cursor: 'pointer',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
              onClick={() => handleOpenProfile(player)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: getRankColor(player.stats?.rank),
                      mr: 2,
                    }}
                  >
                    {player.username?.[0] || 'P'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {player.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {player.gameRole || 'Role not set'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        K/D Ratio
                      </Typography>
                      <Typography variant="h6">
                        {player.stats?.kd?.toFixed(2) || '0.00'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Headshot %
                      </Typography>
                      <Typography variant="h6">
                        {player.stats?.headshots || '0'}%
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    size="small"
                    icon={<Star />}
                    label={player.stats?.rank || 'Unranked'}
                    sx={{
                      bgcolor: getRankColor(player.stats?.rank),
                      color: '#fff',
                    }}
                  />
                  {player.team && (
                    <Chip
                      size="small"
                      icon={<TeamIcon />}
                      label={player.team}
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        {selectedPlayer && (
          <PlayerProfile userId={selectedPlayer.id} />
        )}
      </Dialog>
    </Container>
  );
};

export default Players;
