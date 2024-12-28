import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  Fade,
  Zoom,
  Avatar,
} from '@mui/material';
import {
  AccountBalanceWallet,
  EmojiEvents,
  Edit,
  Save,
  Cancel,
  Celebration,
  Stars,
  LocalAtm,
  Timeline,
  Group,
  PendingActions,
} from '@mui/icons-material';
import { db } from '../../firebase';
import { doc, runTransaction } from 'firebase/firestore';
import { formatIndianCurrency } from '../../utils/formatters';

const PLATFORM_FEE_PERCENTAGE = 2;

const TournamentPrizeDistribution = ({ open, onClose, tournament }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingTeam, setEditingTeam] = useState(null);
  const [position, setPosition] = useState('');
  const [distributionStats, setDistributionStats] = useState({
    totalDistributed: 0,
    remainingPrize: 0,
    teamsAwarded: 0,
  });

  useEffect(() => {
    if (tournament) {
      const distributed = Object.values(tournament.teamStatus || {})
        .reduce((sum, status) => sum + (status.prize || 0), 0);
      
      setDistributionStats({
        totalDistributed: distributed,
        remainingPrize: (tournament.prizePool || 0) - distributed,
        teamsAwarded: Object.values(tournament.teamStatus || {})
          .filter(status => status.position).length,
      });
    }
  }, [tournament]);

  const prizeDistribution = {
    first: tournament?.prizePool ? tournament.prizePool * 0.5 : 0,
    second: tournament?.prizePool ? tournament.prizePool * 0.3 : 0,
    third: tournament?.prizePool ? tournament.prizePool * 0.2 : 0,
    platformFee: tournament?.prizePool ? tournament.prizePool * (PLATFORM_FEE_PERCENTAGE / 100) : 0,
  };

  const handleSetWinner = async (team, position) => {
    if (!team || !position) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await runTransaction(db, async (transaction) => {
        // Update tournament status
        const tournamentRef = doc(db, 'tournaments', tournament.id);
        const tournamentDoc = await transaction.get(tournamentRef);
        
        if (!tournamentDoc.exists()) {
          throw new Error('Tournament not found');
        }

        const tournamentData = tournamentDoc.data();
        const teamStatus = tournamentData.teamStatus || {};
        
        // Check if position is already taken
        const existingWinner = Object.entries(teamStatus).find(([_, status]) => status.position === position);
        if (existingWinner) {
          throw new Error(`Position ${position} is already taken by another team`);
        }

        // Calculate prize money
        let prizeMoney = 0;
        switch (position.toLowerCase()) {
          case 'first':
            prizeMoney = prizeDistribution.first;
            break;
          case 'second':
            prizeMoney = prizeDistribution.second;
            break;
          case 'third':
            prizeMoney = prizeDistribution.third;
            break;
          default:
            break;
        }

        // Update team status
        transaction.update(tournamentRef, {
          [`teamStatus.${team.teamId}`]: {
            ...teamStatus[team.teamId],
            position,
            prize: prizeMoney,
          }
        });

        // Distribute prize money to team members
        const prizePerPlayer = prizeMoney / team.players.length;
        
        for (const player of team.players) {
          const walletRef = doc(db, 'wallets', player.uid);
          const walletDoc = await transaction.get(walletRef);
          
          if (!walletDoc.exists()) {
            // Create wallet if it doesn't exist
            transaction.set(walletRef, {
              balance: prizePerPlayer,
              transactions: [{
                amount: prizePerPlayer,
                type: 'tournament_prize',
                tournamentId: tournament.id,
                teamId: team.teamId,
                position,
                date: new Date(),
                description: `Prize money for ${position} place in ${tournament.title}`,
              }],
            });
          } else {
            // Update existing wallet
            const currentBalance = walletDoc.data().balance || 0;
            const transactions = walletDoc.data().transactions || [];
            
            transaction.update(walletRef, {
              balance: currentBalance + prizePerPlayer,
              transactions: [...transactions, {
                amount: prizePerPlayer,
                type: 'tournament_prize',
                tournamentId: tournament.id,
                teamId: team.teamId,
                position,
                date: new Date(),
                description: `Prize money for ${position} place in ${tournament.title}`,
              }],
            });
          }
        }

        // Check if all positions are filled
        const updatedTeamStatus = {
          ...teamStatus,
          [team.teamId]: {
            ...teamStatus[team.teamId],
            position,
            prize: prizeMoney,
          },
        };

        const allPositionsFilled = Object.values(updatedTeamStatus).filter(
          status => status.position && ['first', 'second', 'third'].includes(status.position.toLowerCase())
        ).length === (tournament.teamSize === 'squad' ? 3 : 2);

        if (allPositionsFilled) {
          transaction.update(tournamentRef, {
            status: 'completed',
            completedAt: new Date(),
          });
        }
      });

      setSuccess(`Successfully set ${team.teamName} as ${position} place winner`);
      setEditingTeam(null);
      setPosition('');
    } catch (error) {
      console.error('Error setting winner:', error);
      setError(error.message || 'Error setting winner');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeTournament = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await runTransaction(db, async (transaction) => {
        const tournamentRef = doc(db, 'tournaments', tournament.id);
        const tournamentDoc = await transaction.get(tournamentRef);
        
        if (!tournamentDoc.exists()) {
          throw new Error('Tournament not found');
        }

        transaction.update(tournamentRef, {
          status: 'completed',
          completedAt: new Date(),
        });
      });

      setSuccess('Tournament finalized successfully');
    } catch (error) {
      console.error('Error finalizing tournament:', error);
      setError(error.message || 'Error finalizing tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(to bottom right, #1a237e, #000051)',
          color: 'white',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        <EmojiEvents sx={{ color: '#ffd700' }} />
        Prize Distribution - {tournament?.title}
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {error && (
          <Fade in>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Fade>
        )}

        {success && (
          <Fade in>
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          </Fade>
        )}

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12}>
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Zoom in timeout={300}>
                    <Card sx={{ 
                      background: 'linear-gradient(45deg, #2196f3, #1976d2)',
                      color: 'white',
                      height: '100%'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <LocalAtm />
                          <Typography variant="h6">Total Prize Pool</Typography>
                        </Box>
                        <Typography variant="h4">
                          {formatIndianCurrency(tournament?.prizePool || 0)}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                          Platform Fee: {formatIndianCurrency(prizeDistribution.platformFee)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Zoom in timeout={400}>
                    <Card sx={{ 
                      background: 'linear-gradient(45deg, #4caf50, #388e3c)',
                      color: 'white',
                      height: '100%'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <AccountBalanceWallet />
                          <Typography variant="h6">Distributed</Typography>
                        </Box>
                        <Typography variant="h4">
                          {formatIndianCurrency(distributionStats.totalDistributed)}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={(distributionStats.totalDistributed / (tournament?.prizePool || 1)) * 100}
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: 'white'
                              }
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Zoom in timeout={500}>
                    <Card sx={{ 
                      background: 'linear-gradient(45deg, #ff9800, #f57c00)',
                      color: 'white',
                      height: '100%'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Timeline />
                          <Typography variant="h6">Remaining</Typography>
                        </Box>
                        <Typography variant="h4">
                          {formatIndianCurrency(distributionStats.remainingPrize)}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                          {((distributionStats.remainingPrize / (tournament?.prizePool || 1)) * 100).toFixed(1)}% of total pool
                        </Typography>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Zoom in timeout={600}>
                    <Card sx={{ 
                      background: 'linear-gradient(45deg, #9c27b0, #7b1fa2)',
                      color: 'white',
                      height: '100%'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Group />
                          <Typography variant="h6">Teams Awarded</Typography>
                        </Box>
                        <Typography variant="h4">
                          {distributionStats.teamsAwarded}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                          of {tournament?.registeredTeams?.length || 0} total teams
                        </Typography>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Prize Distribution Table */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              height: '100%'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Stars sx={{ color: '#ffd700' }} />
                  Prize Structure
                </Typography>
                <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.12)' }} />
                <Stack spacing={2}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #ffd700, #ffa000)',
                    color: 'black'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <EmojiEvents />
                      <Typography variant="h6">1st Place</Typography>
                    </Box>
                    <Typography variant="h5">{formatIndianCurrency(prizeDistribution.first)}</Typography>
                    <Typography variant="body2">
                      Per player: {formatIndianCurrency(prizeDistribution.first / (tournament?.teamSize === 'squad' ? 4 : tournament?.teamSize === 'duo' ? 2 : 1))}
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #C0C0C0, #A0A0A0)',
                    color: 'black'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <EmojiEvents />
                      <Typography variant="h6">2nd Place</Typography>
                    </Box>
                    <Typography variant="h5">{formatIndianCurrency(prizeDistribution.second)}</Typography>
                    <Typography variant="body2">
                      Per player: {formatIndianCurrency(prizeDistribution.second / (tournament?.teamSize === 'squad' ? 4 : tournament?.teamSize === 'duo' ? 2 : 1))}
                    </Typography>
                  </Box>

                  {tournament?.teamSize === 'squad' && (
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #CD7F32, #B87333)',
                      color: 'black'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <EmojiEvents />
                        <Typography variant="h6">3rd Place</Typography>
                      </Box>
                      <Typography variant="h5">{formatIndianCurrency(prizeDistribution.third)}</Typography>
                      <Typography variant="body2">
                        Per player: {formatIndianCurrency(prizeDistribution.third / 4)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Teams Table */}
          <Grid item xs={12} md={8}>
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              height: '100%'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Group />
                  Registered Teams
                </Typography>
                <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.12)' }} />
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'white' }}>Team</TableCell>
                        <TableCell sx={{ color: 'white' }}>Players</TableCell>
                        <TableCell sx={{ color: 'white' }}>Position</TableCell>
                        <TableCell sx={{ color: 'white' }}>Prize</TableCell>
                        <TableCell align="right" sx={{ color: 'white' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tournament?.registeredTeams?.map((team) => (
                        <TableRow key={team.teamId} sx={{ 
                          '&:hover': { 
                            backgroundColor: 'rgba(255, 255, 255, 0.05)'
                          }
                        }}>
                          <TableCell sx={{ color: 'white' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {team.teamName[0].toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2">{team.teamName}</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                  Leader: {team.leader.displayName}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: 'white' }}>
                            <Stack direction="row" spacing={0.5}>
                              {team.players.map((player, index) => (
                                <Tooltip key={player.uid} title={player.displayName}>
                                  <Avatar 
                                    sx={{ 
                                      width: 24, 
                                      height: 24,
                                      fontSize: '0.75rem',
                                      bgcolor: `primary.${index % 2 ? 'light' : 'dark'}`
                                    }}
                                  >
                                    {player.displayName[0]}
                                  </Avatar>
                                </Tooltip>
                              ))}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {editingTeam?.teamId === team.teamId ? (
                              <TextField
                                select
                                size="small"
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                fullWidth
                                SelectProps={{
                                  native: true,
                                }}
                                sx={{
                                  '& .MuiInputBase-input': {
                                    color: 'white',
                                  },
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(255, 255, 255, 0.23)',
                                  },
                                }}
                              >
                                <option value="">Select position</option>
                                <option value="first">1st Place</option>
                                <option value="second">2nd Place</option>
                                {tournament.teamSize === 'squad' && (
                                  <option value="third">3rd Place</option>
                                )}
                              </TextField>
                            ) : (
                              tournament.teamStatus?.[team.teamId]?.position ? (
                                <Chip
                                  icon={<EmojiEvents />}
                                  label={`${tournament.teamStatus[team.teamId].position} Place`}
                                  color="primary"
                                  sx={{ 
                                    background: 
                                      tournament.teamStatus[team.teamId].position === 'first' ? 'linear-gradient(45deg, #ffd700, #ffa000)' :
                                      tournament.teamStatus[team.teamId].position === 'second' ? 'linear-gradient(45deg, #C0C0C0, #A0A0A0)' :
                                      'linear-gradient(45deg, #CD7F32, #B87333)',
                                    color: 'black',
                                    '& .MuiChip-icon': {
                                      color: 'black'
                                    }
                                  }}
                                />
                              ) : (
                                <Chip
                                  icon={<PendingActions />}
                                  label="Pending"
                                  variant="outlined"
                                  sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.23)' }}
                                />
                              )
                            )}
                          </TableCell>
                          <TableCell sx={{ color: 'white' }}>
                            {tournament.teamStatus?.[team.teamId]?.prize ? (
                              <Chip
                                icon={<AccountBalanceWallet />}
                                label={formatIndianCurrency(tournament.teamStatus[team.teamId].prize)}
                                color="success"
                                sx={{ 
                                  background: 'linear-gradient(45deg, #4caf50, #388e3c)',
                                  color: 'white',
                                  '& .MuiChip-icon': {
                                    color: 'white'
                                  }
                                }}
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {editingTeam?.teamId === team.teamId ? (
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <Tooltip title="Save">
                                  <IconButton
                                    onClick={() => handleSetWinner(team, position)}
                                    disabled={loading || !position}
                                    size="small"
                                    sx={{ color: 'success.main' }}
                                  >
                                    <Save />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel">
                                  <IconButton
                                    onClick={() => {
                                      setEditingTeam(null);
                                      setPosition('');
                                    }}
                                    size="small"
                                    sx={{ color: 'error.main' }}
                                  >
                                    <Cancel />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            ) : (
                              !tournament.teamStatus?.[team.teamId]?.position && (
                                <Tooltip title="Set position">
                                  <IconButton
                                    onClick={() => setEditingTeam(team)}
                                    size="small"
                                    sx={{ color: 'primary.main' }}
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                              )
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {loading && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <LinearProgress />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.12)', p: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ 
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.23)',
            '&:hover': {
              borderColor: 'white'
            }
          }}
        >
          Close
        </Button>
        {distributionStats.teamsAwarded > 0 && (
          <Button
            variant="contained"
            color="primary"
            endIcon={<Celebration />}
            onClick={handleFinalizeTournament}
            disabled={loading || distributionStats.teamsAwarded < (tournament?.teamSize === 'squad' ? 3 : 2)}
          >
            Finalize Tournament
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TournamentPrizeDistribution;
