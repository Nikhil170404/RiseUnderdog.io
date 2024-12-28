import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  IconButton,
  Chip,
  useTheme,
  Tab,
  Tabs,
  LinearProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  EmojiEvents as TrophyIcon,
  Timeline,
  Group as TeamIcon,
  Headset as HeadsetIcon,
  Gamepad as GamepadIcon,
  Grade as RankIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { db, doc, updateDoc, getDoc } from '../../firebase';
import { Line } from 'react-chartjs-2';

const PlayerProfile = ({ userId }) => {
  const theme = useTheme();
  const user = useSelector((state) => state.auth.user);
  const isOwnProfile = user?.uid === userId;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [editData, setEditData] = useState({
    username: '',
    gameRole: '',
    mainWeapon: '',
    team: '',
    discord: '',
    about: '',
  });

  // Extended statistics state
  const [stats, setStats] = useState({
    headshots: 0,
    accuracy: 0,
    kd: 0,
    avgDamage: 0,
    clutches: 0,
    playTime: 0,
    matchesPlayed: 0,
    winRate: 0,
    rank: '',
    rankRating: 0,
    peakRank: '',
    achievements: [],
    recentPerformance: [],
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfile(userData);
          setEditData({
            username: userData.username || '',
            gameRole: userData.gameRole || '',
            mainWeapon: userData.mainWeapon || '',
            team: userData.team || '',
            discord: userData.discord || '',
            about: userData.about || '',
          });
          setStats({
            headshots: userData.stats?.headshots || 0,
            accuracy: userData.stats?.accuracy || 0,
            kd: userData.stats?.kd || 0,
            avgDamage: userData.stats?.avgDamage || 0,
            clutches: userData.stats?.clutches || 0,
            playTime: userData.stats?.playTime || 0,
            matchesPlayed: userData.stats?.matchesPlayed || 0,
            winRate: userData.stats?.winRate || 0,
            rank: userData.stats?.rank || 'Unranked',
            rankRating: userData.stats?.rankRating || 0,
            peakRank: userData.stats?.peakRank || 'Unranked',
            achievements: userData.stats?.achievements || [],
            recentPerformance: userData.stats?.recentPerformance || [],
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleSaveProfile = async () => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...editData,
        updatedAt: new Date(),
      });
      setProfile((prev) => ({ ...prev, ...editData }));
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const performanceChartData = {
    labels: stats.recentPerformance.map((_, index) => `Match ${index + 1}`),
    datasets: [
      {
        label: 'K/D Ratio',
        data: stats.recentPerformance.map(match => match.kd),
        borderColor: theme.palette.primary.main,
        tension: 0.4,
      },
      {
        label: 'Headshot %',
        data: stats.recentPerformance.map(match => match.headshotPercentage),
        borderColor: theme.palette.secondary.main,
        tension: 0.4,
      },
    ],
  };

  const renderStatCard = (title, value, icon, color) => (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Box sx={{ color: color, mb: 1 }}>
        {icon}
      </Box>
      <Typography variant="h6" gutterBottom>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </Paper>
  );

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              mr: 3,
              bgcolor: theme.palette.primary.main,
            }}
          >
            {profile?.username?.[0] || 'P'}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h4" sx={{ mr: 2 }}>
                {profile?.username}
              </Typography>
              {isOwnProfile && !editMode && (
                <IconButton onClick={() => setEditMode(true)}>
                  <EditIcon />
                </IconButton>
              )}
            </Box>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {profile?.gameRole || 'Role not set'} • {profile?.mainWeapon || 'Weapon not set'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<RankIcon />}
                label={`Rank: ${stats.rank}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<TeamIcon />}
                label={`Team: ${profile?.team || 'No Team'}`}
                variant="outlined"
              />
              {profile?.discord && (
                <Chip
                  icon={<HeadsetIcon />}
                  label={profile.discord}
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        </Box>

        <Dialog open={editMode} onClose={() => setEditMode(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={editData.username}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Game Role"
                    value={editData.gameRole}
                    onChange={(e) => setEditData({ ...editData, gameRole: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Main Weapon"
                    value={editData.mainWeapon}
                    onChange={(e) => setEditData({ ...editData, mainWeapon: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Team"
                    value={editData.team}
                    onChange={(e) => setEditData({ ...editData, team: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Discord"
                    value={editData.discord}
                    onChange={(e) => setEditData({ ...editData, discord: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="About"
                    value={editData.about}
                    onChange={(e) => setEditData({ ...editData, about: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditMode(false)}>Cancel</Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveProfile}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab label="Overview" />
          <Tab label="Statistics" />
          <Tab label="Performance" />
          <Tab label="Achievements" />
        </Tabs>

        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  About
                </Typography>
                <Typography variant="body1">
                  {profile?.about || 'No description provided.'}
                </Typography>
              </Paper>

              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                {stats.recentPerformance.slice(0, 5).map((match, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">
                      Match {match.date}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Chip label={`K/D: ${match.kd}`} size="small" />
                      <Chip label={`HS%: ${match.headshotPercentage}%`} size="small" />
                      <Chip label={`Score: ${match.score}`} size="small" />
                    </Box>
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))}
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Stats
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Win Rate
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stats.winRate}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {stats.winRate}%
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Headshot Rate
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stats.headshots}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {stats.headshots}%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Accuracy
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stats.accuracy}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {stats.accuracy}%
                  </Typography>
                </Box>
              </Paper>

              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Achievements
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {stats.achievements.map((achievement, index) => (
                    <Chip
                      key={index}
                      label={achievement}
                      icon={<TrophyIcon />}
                      size="small"
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {tabValue === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              {renderStatCard(
                'K/D Ratio',
                stats.kd.toFixed(2),
                <GamepadIcon fontSize="large" />,
                theme.palette.primary.main
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              {renderStatCard(
                'Headshot %',
                `${stats.headshots}%`,
                <TrophyIcon fontSize="large" />,
                theme.palette.secondary.main
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              {renderStatCard(
                'Avg Damage',
                stats.avgDamage.toFixed(0),
                <Timeline fontSize="large" />,
                theme.palette.warning.main
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              {renderStatCard(
                'Clutches',
                stats.clutches,
                <StarIcon fontSize="large" />,
                theme.palette.success.main
              )}
            </Grid>
            {/* Additional detailed statistics */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Detailed Statistics
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Matches
                      </Typography>
                      <Typography variant="h6">
                        {stats.matchesPlayed}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Play Time
                      </Typography>
                      <Typography variant="h6">
                        {Math.floor(stats.playTime / 3600)}h {Math.floor((stats.playTime % 3600) / 60)}m
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Peak Rank
                      </Typography>
                      <Typography variant="h6">
                        {stats.peakRank}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        {tabValue === 2 && (
          <Box sx={{ mt: 3 }}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Performance Trends
              </Typography>
              <Box sx={{ height: 400 }}>
                <Line
                  data={performanceChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Box>
        )}

        {tabValue === 3 && (
          <Grid container spacing={3}>
            {stats.achievements.map((achievement, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <TrophyIcon sx={{ color: theme.palette.warning.main }} />
                  <Box>
                    <Typography variant="subtitle1">{achievement}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Earned on: {new Date().toLocaleDateString()}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default PlayerProfile;
