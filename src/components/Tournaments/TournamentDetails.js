import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  TextField,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip
} from '@mui/material';
import {
  ContentCopy,
  WhatsApp,
  Telegram,
  CheckCircle,
  Lock,
  LockOpen,
  Person,
  Groups,
  Groups3,
  EmojiEvents,
  MonetizationOn
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { db, doc, updateDoc, onSnapshot } from '../../firebase';
import { formatDistanceToNow } from 'date-fns';

const TournamentDetails = ({ open = false, onClose, tournament }) => {
  const user = useSelector(state => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roomDetails, setRoomDetails] = useState(null);
  const [registeredTeams, setRegisteredTeams] = useState([]);
  const [isAdmin] = useState(user?.role === 'admin');
  const [currentTab, setCurrentTab] = useState(0);
  const [newRoomDetails, setNewRoomDetails] = useState({
    roomId: '',
    password: '',
    instructions: ''
  });

  const calculatePrizes = () => {
    const totalPrize = tournament.prize;
    const platformFee = 0.02; 
    const prizeAfterFee = totalPrize * (1 - platformFee);
    
    const distribution = {
      first: 0.40,   
      second: 0.25,  
      third: 0.15,   
      fourth: 0.12,  
      fifth: 0.08    
    };

    return {
      platformFee: totalPrize * platformFee,
      prizes: {
        first: prizeAfterFee * distribution.first,
        second: prizeAfterFee * distribution.second,
        third: prizeAfterFee * distribution.third,
        fourth: prizeAfterFee * distribution.fourth,
        fifth: prizeAfterFee * distribution.fifth
      }
    };
  };

  const prizes = calculatePrizes();

  useEffect(() => {
    if (!open || !tournament?.id) return;

    const tournamentRef = doc(db, 'tournaments', tournament.id);
    const unsubscribe = onSnapshot(tournamentRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setRegisteredTeams(data.registeredPlayers || []);
        setRoomDetails(data.roomDetails || null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [open, tournament?.id]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleUpdateRoomDetails = async () => {
    try {
      const tournamentRef = doc(db, 'tournaments', tournament.id);
      await updateDoc(tournamentRef, {
        roomDetails: {
          ...newRoomDetails,
          createdAt: new Date().toISOString()
        },
        status: 'active'
      });
      setError('');
    } catch (error) {
      console.error('Error updating room details:', error);
      setError('Failed to update room details');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const shareOnWhatsApp = (roomId, password, instructions) => {
    const text = `Tournament: ${tournament.title}\\nRoom ID: ${roomId}\\nPassword: ${password}\\n\\nInstructions: ${instructions}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const shareOnTelegram = (roomId, password, instructions) => {
    const text = `Tournament: ${tournament.title}\\nRoom ID: ${roomId}\\nPassword: ${password}\\n\\nInstructions: ${instructions}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(text)}`);
  };

  const getTeamIcon = (teamSize) => {
    switch (teamSize) {
      case 'squad':
        return <Groups3 />;
      case 'duo':
        return <Groups />;
      default:
        return <Person />;
    }
  };

  const getTeamSizeLabel = (teamSize) => {
    switch (teamSize) {
      case 'squad':
        return '4 Players';
      case 'duo':
        return '2 Players';
      default:
        return 'Solo';
    }
  };

  const RoomDetailsSection = () => {
    if (!roomDetails && !isAdmin) {
      return (
        <Alert severity="info" sx={{ mb: 2 }}>
          Room details will be available once the tournament starts
        </Alert>
      );
    }

    if (isAdmin && !roomDetails) {
      return (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Set Room Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Room ID"
                value={newRoomDetails.roomId}
                onChange={(e) => setNewRoomDetails(prev => ({ ...prev, roomId: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                value={newRoomDetails.password}
                onChange={(e) => setNewRoomDetails(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Instructions"
                value={newRoomDetails.instructions}
                onChange={(e) => setNewRoomDetails(prev => ({ ...prev, instructions: e.target.value }))}
                multiline
                rows={3}
                placeholder="Add any special instructions for players..."
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleUpdateRoomDetails}
                disabled={!newRoomDetails.roomId || !newRoomDetails.password}
              >
                Set Room Details
              </Button>
            </Grid>
          </Grid>
        </Box>
      );
    }

    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Room Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Room ID</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography>{roomDetails.roomId}</Typography>
              <IconButton size="small" onClick={() => copyToClipboard(roomDetails.roomId)}>
                <ContentCopy fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Password</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography>{roomDetails.password}</Typography>
              <IconButton size="small" onClick={() => copyToClipboard(roomDetails.password)}>
                <ContentCopy fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
          {roomDetails.instructions && (
            <Grid item xs={12}>
              <Typography variant="subtitle2">Instructions</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {roomDetails.instructions}
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                startIcon={<WhatsApp />}
                onClick={() => shareOnWhatsApp(roomDetails.roomId, roomDetails.password, roomDetails.instructions)}
              >
                Share on WhatsApp
              </Button>
              <Button
                size="small"
                startIcon={<Telegram />}
                onClick={() => shareOnTelegram(roomDetails.roomId, roomDetails.password, roomDetails.instructions)}
              >
                Share on Telegram
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const PrizeDistribution = () => (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <EmojiEvents color="primary" />
        <Typography variant="h6">Prize Distribution</Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">Total Prize Pool</Typography>
          <Typography variant="h4" color="primary">${tournament.prize}</Typography>
          <Typography variant="caption" color="text.secondary">
            Platform Fee (2%): ${prizes.platformFee.toFixed(2)}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <List dense>
            <ListItem>
              <ListItemIcon><MonetizationOn color="primary" /></ListItemIcon>
              <ListItemText 
                primary="1st Place" 
                secondary={`$${prizes.prizes.first.toFixed(2)}`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><MonetizationOn color="primary" /></ListItemIcon>
              <ListItemText 
                primary="2nd Place" 
                secondary={`$${prizes.prizes.second.toFixed(2)}`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><MonetizationOn color="primary" /></ListItemIcon>
              <ListItemText 
                primary="3rd Place" 
                secondary={`$${prizes.prizes.third.toFixed(2)}`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><MonetizationOn color="primary" /></ListItemIcon>
              <ListItemText 
                primary="4th Place" 
                secondary={`$${prizes.prizes.fourth.toFixed(2)}`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><MonetizationOn color="primary" /></ListItemIcon>
              <ListItemText 
                primary="5th Place" 
                secondary={`$${prizes.prizes.fifth.toFixed(2)}`}
              />
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </Paper>
  );

  const TeamsList = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Team</TableCell>
            <TableCell>Players</TableCell>
            {isAdmin && <TableCell>Status</TableCell>}
            <TableCell>Registered</TableCell>
            {isAdmin && roomDetails && <TableCell>Room Access</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {registeredTeams.map((team) => (
            <TableRow key={team.teamId}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getTeamIcon(tournament.teamSize)}
                  <Box>
                    <Typography variant="subtitle2">{team.teamName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getTeamSizeLabel(tournament.teamSize)}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <List dense>
                  {team.players.map((player) => (
                    <ListItem key={player.uid} dense>
                      <ListItemIcon>
                        {player.isLeader ? <CheckCircle color="primary" fontSize="small" /> : <Person fontSize="small" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={player.name}
                        secondary={isAdmin ? `Game ID: ${player.gameId}` : undefined}
                      />
                    </ListItem>
                  ))}
                </List>
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <Chip
                    label={team.status}
                    color={team.status === 'registered' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
              )}
              <TableCell>
                {formatDistanceToNow(new Date(team.registeredAt), { addSuffix: true })}
              </TableCell>
              {isAdmin && roomDetails && (
                <TableCell>
                  <Tooltip title={team.status === 'registered' ? 'Has room access' : 'No room access'}>
                    <IconButton size="small" color={team.status === 'registered' ? 'success' : 'error'}>
                      {team.status === 'registered' ? <LockOpen /> : <Lock />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const TournamentStats = () => (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Total Teams</Typography>
            <Typography variant="h4">{registeredTeams.length}</Typography>
            <Typography variant="caption" color="text.secondary">
              of {tournament.maxParticipants} max
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Total Players</Typography>
            <Typography variant="h4">
              {registeredTeams.reduce((acc, team) => acc + team.players.length, 0)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Tournament Type</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              {getTeamIcon(tournament.teamSize)}
              <Typography variant="h6">{tournament.teamSize.toUpperCase()}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Status</Typography>
            <Chip
              label={tournament.status}
              color={
                tournament.status === 'upcoming' ? 'primary' :
                tournament.status === 'active' ? 'success' :
                tournament.status === 'full' ? 'error' : 'default'
              }
              sx={{ mt: 1 }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{tournament?.title}</Typography>
          <Chip
            icon={getTeamIcon(tournament?.teamSize)}
            label={getTeamSizeLabel(tournament?.teamSize)}
            color="primary"
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <PrizeDistribution />
            <TournamentStats />

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={currentTab} onChange={handleTabChange}>
                <Tab label="Teams" />
                {(isAdmin || roomDetails) && <Tab label="Room Details" />}
              </Tabs>
            </Box>

            <Box hidden={currentTab !== 0}>
              <TeamsList />
            </Box>

            <Box hidden={currentTab !== 1}>
              <RoomDetailsSection />
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

TournamentDetails.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tournament: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    maxParticipants: PropTypes.number.isRequired,
    teamSize: PropTypes.string.isRequired,
    prize: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
};

export default TournamentDetails;
