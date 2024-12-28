import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  CircularProgress,
  Typography,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Search,
  Add,
  Delete,
  Person,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  increment, 
  runTransaction,
  where,
  query
} from 'firebase/firestore';
import { db } from '../../firebase';
import NotificationService from '../../services/NotificationService';
import { formatIndianCurrency } from '../../utils/formatters';

const PLATFORM_FEE_PERCENTAGE = 2;

const TournamentRegistration = ({ open, onClose, tournament }) => {
  const user = useSelector(state => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);

  const fetchWalletBalance = useCallback(async () => {
    try {
      const walletRef = doc(db, 'wallets', user.uid);
      const walletDoc = await getDoc(walletRef);
      if (walletDoc.exists()) {
        setWalletBalance(walletDoc.data().balance || 0);
      } else {
        setWalletBalance(0);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setWalletBalance(0);
    }
  }, [user.uid]);

  useEffect(() => {
    if (user && open) {
      fetchWalletBalance();
      // Initialize team leader
      setSelectedPlayers([{
        uid: user.uid,
        displayName: user.displayName || user.email,
        email: user.email,
        isLeader: true,
        gameId: '',
      }]);
      setTeamName(`Team ${user.displayName || 'Anonymous'}`);
    }
  }, [user, open, fetchWalletBalance]);

  useEffect(() => {
    if (user) {
      fetchWalletBalance();
    }
  }, [user, fetchWalletBalance]);

  const getRequiredPlayers = () => {
    switch (tournament.teamSize) {
      case 'squad': return 4;
      case 'duo': return 2;
      default: return 1;
    }
  };

  const searchUsers = async (searchTerm) => {
    if (!searchTerm) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const usersRef = collection(db, 'users');
      const searchTermLower = searchTerm.toLowerCase();
      
      const nameQueryRef = query(usersRef, 
        where('displayName', '>=', searchTermLower), 
        where('displayName', '<=', searchTermLower + '\uf8ff')
      );
      
      const emailQueryRef = query(usersRef, 
        where('email', '==', searchTermLower)
      );

      const [nameSnapshot, emailSnapshot] = await Promise.all([
        getDocs(nameQueryRef),
        getDocs(emailQueryRef)
      ]);

      const results = new Set();
      nameSnapshot.forEach(doc => {
        const userData = doc.data();
        if (doc.id !== user.uid) {
          results.add({ id: doc.id, ...userData });
        }
      });
      
      emailSnapshot.forEach(doc => {
        const userData = doc.data();
        if (doc.id !== user.uid) {
          results.add({ id: doc.id, ...userData });
        }
      });

      setSearchResults(Array.from(results));
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddPlayer = (selectedUser) => {
    if (selectedPlayers.length >= getRequiredPlayers()) {
      setError(`Maximum ${getRequiredPlayers()} players allowed for ${tournament.teamSize} tournament`);
      return;
    }

    setSelectedPlayers([...selectedPlayers, {
      uid: selectedUser.id,
      displayName: selectedUser.displayName || selectedUser.email,
      email: selectedUser.email,
      isLeader: false,
      gameId: '',
    }]);
    setSearchResults([]);
    setSearchInput('');
  };

  const handleRemovePlayer = (index) => {
    if (selectedPlayers[index].isLeader) {
      setError("Can't remove team leader");
      return;
    }
    setSelectedPlayers(selectedPlayers.filter((_, i) => i !== index));
  };

  const updateGameId = (index, gameId) => {
    const updatedPlayers = [...selectedPlayers];
    updatedPlayers[index] = { ...updatedPlayers[index], gameId };
    setSelectedPlayers(updatedPlayers);
  };

  const handleRegistration = async () => {
    if (selectedPlayers.length !== getRequiredPlayers()) {
      setError(`Please add ${getRequiredPlayers()} players for ${tournament.teamSize} tournament`);
      return;
    }

    if (selectedPlayers.some(player => !player.gameId)) {
      setError('All players must provide their game IDs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await runTransaction(db, async (transaction) => {
        // Check wallet balance
        const walletRef = doc(db, 'wallets', user.uid);
        const walletDoc = await transaction.get(walletRef);
        
        if (!walletDoc.exists()) {
          throw new Error('Wallet not found');
        }

        const currentBalance = walletDoc.data().balance || 0;
        const entryFee = tournament.entryFee || 0;

        if (currentBalance < entryFee) {
          throw new Error(`Insufficient balance. Required: ₹${entryFee}`);
        }

        // Generate team ID
        const teamId = `${tournament.id}_${user.uid}_${Date.now()}`;

        // Register team
        const tournamentRef = doc(db, 'tournaments', tournament.id);
        const tournamentDoc = await transaction.get(tournamentRef);
        
        if (!tournamentDoc.exists()) {
          throw new Error('Tournament not found');
        }

        const tournamentData = tournamentDoc.data();
        if (tournamentData.currentParticipants >= tournamentData.maxParticipants) {
          throw new Error('Tournament is full');
        }

        // Deduct entry fee
        if (entryFee > 0) {
          transaction.update(walletRef, {
            balance: increment(-entryFee),
            transactions: [...(walletDoc.data().transactions || []), {
              amount: -entryFee,
              type: 'tournament_entry',
              tournamentId: tournament.id,
              date: new Date(),
              description: `Entry fee for ${tournament.title}`,
            }],
          });
        }

        // Register team
        const registrationData = {
          teamId,
          teamName,
          leader: {
            uid: user.uid,
            displayName: user.displayName || user.email,
            email: user.email,
          },
          players: selectedPlayers.map(player => ({
            uid: player.uid,
            displayName: player.displayName,
            email: player.email,
            gameId: player.gameId,
            isLeader: player.isLeader,
          })),
          registeredAt: new Date(),
          status: 'registered',
        };

        transaction.update(tournamentRef, {
          registeredTeams: [...(tournamentData.registeredTeams || []), registrationData],
          currentParticipants: increment(1),
          [[`teamStatus.${teamId}`]]: {
            status: 'registered',
            position: null,
            prize: null,
          },
        });

        // Notify team members
        selectedPlayers.forEach(player => {
          if (!player.isLeader) {
            NotificationService.sendNotification(player.uid, {
              type: 'tournament_invitation',
              title: 'Tournament Team Invitation',
              message: `You have been added to team "${teamName}" for tournament "${tournament.title}"`,
              tournamentId: tournament.id,
              teamId,
              date: new Date(),
            });
          }
        });
      });

      setSuccess('Successfully registered for tournament');
      onClose();
    } catch (error) {
      console.error('Error registering for tournament:', error);
      setError(error.message || 'Error registering for tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Tournament Registration
        <Typography variant="subtitle2" color="textSecondary">
          {tournament.title}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Tournament Details
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="body1">
              Entry Fee: {formatIndianCurrency(tournament?.entryFee || 0)}
            </Typography>
            <Typography variant="body1">
              Prize Pool: {formatIndianCurrency(tournament?.prizePool || 0)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalanceWallet color="primary" />
            <Typography>
              Your Wallet Balance: {formatIndianCurrency(walletBalance)}
            </Typography>
          </Box>
          {walletBalance < (tournament?.entryFee || 0) && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Insufficient balance. You need {formatIndianCurrency(tournament?.entryFee || 0)} to register.
            </Alert>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Team Members ({selectedPlayers.length}/{getRequiredPlayers()})
        </Typography>

        <List>
          {selectedPlayers.map((player, index) => (
            <ListItem key={player.uid} divider>
              <ListItemAvatar>
                <Avatar>
                  <Person />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {player.displayName}
                    {player.isLeader && (
                      <Chip size="small" label="Leader" color="primary" />
                    )}
                  </Box>
                }
                secondary={player.email}
              />
              <Box sx={{ ml: 2, flexGrow: 1 }}>
                <TextField
                  size="small"
                  label="Game ID"
                  value={player.gameId}
                  onChange={(e) => updateGameId(index, e.target.value)}
                  required
                  fullWidth
                />
              </Box>
              {!player.isLeader && (
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleRemovePlayer(index)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </List>

        {selectedPlayers.length < getRequiredPlayers() && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              placeholder="Search by name or email"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                searchUsers(e.target.value);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: isSearching && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ),
              }}
            />

            {isSearching && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}

            <List>
              {searchResults.map((result) => (
                <ListItem
                  key={result.id}
                  button
                  onClick={() => handleAddPlayer(result)}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <Person />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={result.displayName || result.email}
                    secondary={result.email}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleAddPlayer(result)}>
                      <Add />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {tournament.entryFee > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Platform fee ({PLATFORM_FEE_PERCENTAGE}%) will be deducted from prize money.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleRegistration}
          variant="contained"
          color="primary"
          disabled={loading || selectedPlayers.length !== getRequiredPlayers()}
        >
          {loading ? 'Registering...' : 'Register Team'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TournamentRegistration;
