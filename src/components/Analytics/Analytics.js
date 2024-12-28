import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Timeline,
  TrendingUp,
  EmojiEvents,
  Stars,
  Grade,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import AnalyticsService from '../../services/AnalyticsService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const StatBox = ({ title, value, icon, progress, loading }) => (
  <Paper sx={{ p: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      {icon}
      <Typography variant="h6" sx={{ ml: 1 }}>
        {title}
      </Typography>
    </Box>
    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <CircularProgress size={24} />
      </Box>
    ) : (
      <>
        <Typography variant="h4" gutterBottom>
          {value}
        </Typography>
        <LinearProgress variant="determinate" value={progress} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {progress}% increase from last month
        </Typography>
      </>
    )}
  </Paper>
);

const Analytics = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [skillProgress, setSkillProgress] = useState({});

  useEffect(() => {
    if (!user?.uid) return;

    // Subscribe to real-time updates
    const unsubscribeStats = AnalyticsService.subscribeToUserStats(user.uid, (newStats) => {
      setStats(newStats);
      setLoading(false);
    });

    const unsubscribeMatches = AnalyticsService.subscribeToRecentMatches(user.uid, (matches) => {
      setRecentMatches(matches);
    });

    const unsubscribeAchievements = AnalyticsService.subscribeToAchievements(user.uid, (newAchievements) => {
      setAchievements(newAchievements);
    });

    const unsubscribeSkills = AnalyticsService.subscribeToSkillProgress(user.uid, (progress) => {
      setSkillProgress(progress);
    });

    return () => {
      unsubscribeStats();
      unsubscribeMatches();
      unsubscribeAchievements();
      unsubscribeSkills();
    };
  }, [user?.uid]);

  const statBoxes = [
    {
      title: 'Matches Played',
      value: stats?.matchesPlayed || '0',
      icon: <Timeline color="primary" />,
      progress: 75,
    },
    {
      title: 'Win Rate',
      value: `${stats?.winRate || '0'}%`,
      icon: <TrendingUp color="success" />,
      progress: stats?.winRate || 0,
    },
    {
      title: 'Tournaments Won',
      value: stats?.tournamentsWon || '0',
      icon: <EmojiEvents color="warning" />,
      progress: 85,
    },
    {
      title: 'Current Rank',
      value: stats?.currentRank || 'Rookie',
      icon: <Stars color="info" />,
      progress: 60,
    },
  ];

  const getMatchHistoryData = () => {
    return recentMatches.map(match => ({
      date: new Date(match.timestamp).toLocaleDateString(),
      score: match.score,
      result: match.result === 'win' ? 100 : 0,
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Performance Analytics
      </Typography>
      
      <Grid container spacing={3}>
        {statBoxes.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatBox {...stat} loading={loading} />
          </Grid>
        ))}
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Performance History
            </Typography>
            <Box sx={{ height: 300 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getMatchHistoryData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#8884d8" name="Score" />
                    <Line type="monotone" dataKey="result" stroke="#82ca9d" name="Win/Loss" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Achievements
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress />
              </Box>
            ) : achievements.length > 0 ? (
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {achievements.map((achievement) => (
                  <Box
                    key={achievement.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1,
                      '&:not(:last-child)': { borderBottom: 1, borderColor: 'divider' },
                    }}
                  >
                    <Grade color="warning" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="subtitle1">{achievement.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography color="text.secondary">No achievements yet</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Skill Progress
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress />
              </Box>
            ) : Object.keys(skillProgress).length > 0 ? (
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {Object.entries(skillProgress).map(([skill, level]) => (
                  <Box key={skill} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">{skill}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Level {level}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(level / 100) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography color="text.secondary">No skill data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
