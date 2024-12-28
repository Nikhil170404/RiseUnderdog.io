import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  db, 
  collection, 
  query, 
  onSnapshot, 
  where,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  Timestamp 
} from '../../firebase';

const PlayerRankings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [openTeamDialog, setOpenTeamDialog] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculate player statistics and ranking
  const calculatePlayerStats = (playerData) => {
    const totalGames = playerData.gamesWon + playerData.gamesLost;
    const winRate = totalGames > 0 ? (playerData.gamesWon / totalGames) * 100 : 0;
    const avgScore = playerData.totalScore / (totalGames || 1);
    
    return {
      ...playerData,
      winRate: winRate.toFixed(2),
      avgScore: avgScore.toFixed(2),
      totalGames,
      rank: 0 // Will be set later
    };
  };

  // Real-time player data subscription
  useEffect(() => {
    const playersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'player'),
      orderBy('gamesWon', 'desc')
    );

    const unsubscribe = onSnapshot(playersQuery, (snapshot) => {
      const playersList = snapshot.docs.map((doc, index) => {
        const playerData = calculatePlayerStats({ id: doc.id, ...doc.data() });
        return { ...playerData, rank: index + 1 };
      });

      setPlayers(playersList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time teams subscription
  useEffect(() => {
    const teamsQuery = query(collection(db, 'teams'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(teamsQuery, (snapshot) => {
      const teamsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeams(teamsList);
    });

    return () => unsubscribe();
  }, []);

  // Create balanced teams based on player stats
  const createBalancedTeams = async () => {
    if (selectedPlayers.length < 2) return;

    const sortedPlayers = [...selectedPlayers].sort((a, b) => 
      parseFloat(b.winRate) - parseFloat(a.winRate)
    );

    const teamA = [];
    const teamB = [];
    let totalSkillA = 0;
    let totalSkillB = 0;

    sortedPlayers.forEach((player) => {
      const playerSkill = parseFloat(player.winRate) * parseFloat(player.avgScore);
      
      if (totalSkillA <= totalSkillB) {
        teamA.push(player);
        totalSkillA += playerSkill;
      } else {
        teamB.push(player);
        totalSkillB += playerSkill;
      }
    });

    try {
      const teamRef = await collection(db, 'teams');
      await addDoc(teamRef, {
        teamA: teamA.map(p => p.id),
        teamB: teamB.map(p => p.id),
        createdAt: Timestamp.now(),
        status: 'pending',
        totalSkillA,
        totalSkillB
      });

      setOpenTeamDialog(false);
      setSelectedPlayers([]);
    } catch (error) {
      console.error('Error creating teams:', error);
    }
  };

  const togglePlayerSelection = (player) => {
    setSelectedPlayers(prev => 
      prev.find(p => p.id === player.id)
        ? prev.filter(p => p.id !== player.id)
        : [...prev, player]
    );
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return theme.palette.text.primary;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Player Rankings
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Player</TableCell>
                    <TableCell align="right">Win Rate</TableCell>
                    <TableCell align="right">Games Played</TableCell>
                    <TableCell align="right">Avg Score</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {players.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell>
                        <Typography
                          sx={{
                            color: getRankColor(player.rank),
                            fontWeight: player.rank <= 3 ? 'bold' : 'normal'
                          }}
                        >
                          #{player.rank}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 1 }}>{player.username?.[0]}</Avatar>
                          {player.username}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={`${player.winRate}%`}
                          color={player.winRate > 50 ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">{player.totalGames}</TableCell>
                      <TableCell align="right">{player.avgScore}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => togglePlayerSelection(player)}
                          color={selectedPlayers.find(p => p.id === player.id) ? 'secondary' : 'primary'}
                        >
                          {selectedPlayers.find(p => p.id === player.id) ? 'Selected' : 'Select'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Team Formation
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Selected Players: {selectedPlayers.length}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={selectedPlayers.length < 2}
                  onClick={() => setOpenTeamDialog(true)}
                >
                  Create Teams
                </Button>
              </CardContent>
            </Card>

            {teams.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Teams
                </Typography>
                {teams.slice(0, 3).map((team, index) => (
                  <Card key={team.id} sx={{ mb: 1 }}>
                    <CardContent>
                      <Typography variant="subtitle2">
                        Team Match #{index + 1}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="body2">
                          Team A: {team.totalSkillA.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">
                          Team B: {team.totalSkillB.toFixed(2)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>

      <Dialog open={openTeamDialog} onClose={() => setOpenTeamDialog(false)}>
        <DialogTitle>Confirm Team Creation</DialogTitle>
        <DialogContent>
          <Typography>
            Create balanced teams with the following players:
          </Typography>
          <Box sx={{ mt: 2 }}>
            {selectedPlayers.map((player) => (
              <Chip
                key={player.id}
                label={player.username}
                sx={{ m: 0.5 }}
                onDelete={() => togglePlayerSelection(player)}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTeamDialog(false)}>Cancel</Button>
          <Button onClick={createBalancedTeams} variant="contained" color="primary">
            Create Teams
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PlayerRankings;
