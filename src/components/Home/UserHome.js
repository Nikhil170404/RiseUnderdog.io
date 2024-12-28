import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Chip,
  Paper,
  Button,
  Divider,
} from '@mui/material';
import {
  EmojiEvents,
  TrendingUp,
  Star,
  Group,
  SportsEsports,
  Timeline,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { db } from '../../firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  doc,
} from 'firebase/firestore';

const UserHome = () => {
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [recentHighlights, setRecentHighlights] = useState([]);

  useEffect(() => {
    const fetchUserStats = () => {
      const userRef = doc(db, 'users', user.uid);
      return onSnapshot(userRef, (doc) => {
        setUserStats(doc.data());
      });
    };

    const fetchChallenges = () => {
      const challengesRef = collection(db, 'challenges');
      const q = query(
        challengesRef,
        where('status', '==', 'active'),
        orderBy('endDate', 'asc'),
        limit(3)
      );
      return onSnapshot(q, (snapshot) => {
        const challenges = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setActiveChallenges(challenges);
      });
    };

    const fetchTopPlayers = () => {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        orderBy('points', 'desc'),
        limit(5)
      );
      return onSnapshot(q, (snapshot) => {
        const players = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTopPlayers(players);
      });
    };

    const fetchTournaments = () => {
      const tournamentsRef = collection(db, 'tournaments');
      const q = query(
        tournamentsRef,
        where('startDate', '>', new Date()),
        orderBy('startDate', 'asc'),
        limit(3)
      );
      return onSnapshot(q, (snapshot) => {
        const tournaments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUpcomingTournaments(tournaments);
      });
    };

    const fetchHighlights = () => {
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        where('isHighlight', '==', true),
        orderBy('timestamp', 'desc'),
        limit(3)
      );
      return onSnapshot(q, (snapshot) => {
        const highlights = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentHighlights(highlights);
      });
    };

    const unsubscribe = [
      fetchUserStats(),
      fetchChallenges(),
      fetchTopPlayers(),
      fetchTournaments(),
      fetchHighlights(),
    ];

    setLoading(false);

    return () => unsubscribe.forEach(unsub => unsub && unsub());
  }, [user.uid]);

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  const calculateLevelProgress = () => {
    const currentPoints = userStats?.points || 0;
    const level = Math.floor(currentPoints / 100);
    const progress = (currentPoints % 100) / 100 * 100;
    return { level, progress };
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* User Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={user.photoURL}
                  sx={{ width: 64, height: 64, mr: 2 }}
                />
                <Box>
                  <Typography variant="h6">
                    {user.displayName || user.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Level {calculateLevelProgress().level}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Level Progress
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={calculateLevelProgress().progress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {userStats?.achievements && Object.keys(userStats.achievements).map((achievement) => (
                  <Chip
                    key={achievement}
                    label={achievement.replace('_', ' ')}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Challenges */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Challenges
            </Typography>
            <Grid container spacing={2}>
              {activeChallenges.map((challenge) => (
                <Grid item xs={12} sm={6} md={4} key={challenge.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1">
                        {challenge.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {challenge.description}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          size="small"
                          icon={<Star />}
                          label={`${challenge.points} Points`}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Leaderboard */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Players
            </Typography>
            {topPlayers.map((player, index) => (
              <Box
                key={player.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: index === 0 ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                }}
              >
                <Typography variant="h6" sx={{ width: 30 }}>
                  #{index + 1}
                </Typography>
                <Avatar src={player.photoURL} sx={{ mx: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2">
                    {player.displayName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Level {Math.floor(player.points / 100)}
                  </Typography>
                </Box>
                <Typography variant="subtitle1" color="primary">
                  {player.points} pts
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Upcoming Tournaments */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Tournaments
            </Typography>
            <Grid container spacing={2}>
              {upcomingTournaments.map((tournament) => (
                <Grid item xs={12} sm={6} key={tournament.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EmojiEvents color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">
                          {tournament.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {tournament.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          size="small"
                          icon={<Group />}
                          label={`${tournament.participants || 0} Players`}
                        />
                        <Button
                          variant="contained"
                          size="small"
                        >
                          Join
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Highlights */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Highlights
            </Typography>
            <Grid container spacing={2}>
              {recentHighlights.map((highlight) => (
                <Grid item xs={12} sm={6} md={4} key={highlight.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          src={highlight.author.avatar}
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="subtitle2">
                          {highlight.author.name}
                        </Typography>
                      </Box>
                      {highlight.imageUrl && (
                        <Box sx={{ mb: 2, borderRadius: 1, overflow: 'hidden' }}>
                          <img
                            src={highlight.imageUrl}
                            alt="Highlight"
                            style={{ width: '100%', height: 200, objectFit: 'cover' }}
                          />
                        </Box>
                      )}
                      <Typography variant="body2" noWrap>
                        {highlight.content}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserHome;
