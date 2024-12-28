import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  FormControl,
  FormControlLabel,
  Switch,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Collapse,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Groups,
  EmojiEvents,
  ExpandMore,
  ExpandLess,
  AccountBalanceWallet,
  Refresh,
} from '@mui/icons-material';
import {
  db, collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp
} from '../../firebase';
import TournamentPrizeDistribution from './TournamentPrizeDistribution';
import { formatIndianCurrency } from '../../utils/formatters';

const TournamentManagement = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [openPrizeDialog, setOpenPrizeDialog] = useState(false);
  const [expandedTournament, setExpandedTournament] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    prize: 0,
    maxParticipants: 0,
    teamSize: 'solo',
    entryFee: 0,
    status: 'upcoming',
    gameType: '',
    rules: '',
    roomId: '',
    roomPassword: '',
    roomInstructions: '',
    isPrivate: false,
    requiresVerification: false,
    autoApprove: true,
  });

  // Real-time tournament updates
  useEffect(() => {
    const tournamentsRef = collection(db, 'tournaments');
    const q = query(tournamentsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tournamentsData = [];
      snapshot.forEach((doc) => {
        tournamentsData.push({ id: doc.id, ...doc.data() });
      });
      setTournaments(tournamentsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching tournaments:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching tournaments',
        severity: 'error',
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenDialog = (tournament = null) => {
    if (tournament) {
      setEditMode(true);
      setSelectedTournament(tournament);
      setFormData({
        ...tournament,
        date: tournament.date.split('T')[0],
      });
    } else {
      setEditMode(false);
      setSelectedTournament(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        prize: 0,
        maxParticipants: 0,
        teamSize: 'solo',
        entryFee: 0,
        status: 'upcoming',
        gameType: '',
        rules: '',
        roomId: '',
        roomPassword: '',
        roomInstructions: '',
        isPrivate: false,
        requiresVerification: false,
        autoApprove: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setSelectedTournament(null);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['title', 'date', 'prize', 'maxParticipants', 'teamSize', 'gameType'];
    const errors = [];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
      }
    });

    if (formData.prize < 0) errors.push('Prize must be positive');
    if (formData.entryFee < 0) errors.push('Entry fee must be positive');
    if (formData.maxParticipants < 1) errors.push('Maximum participants must be at least 1');

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (errors.length > 0) {
      setSnackbar({
        open: true,
        message: errors.join(', '),
        severity: 'error',
      });
      return;
    }

    try {
      const tournamentData = {
        ...formData,
        prize: Number(formData.prize),
        maxParticipants: Number(formData.maxParticipants),
        entryFee: Number(formData.entryFee),
        updatedAt: serverTimestamp(),
      };

      if (!editMode) {
        tournamentData.createdAt = serverTimestamp();
        tournamentData.currentParticipants = 0;
        tournamentData.registeredPlayers = [];
      }

      if (editMode && selectedTournament) {
        await updateDoc(doc(db, 'tournaments', selectedTournament.id), tournamentData);
        setSnackbar({
          open: true,
          message: 'Tournament updated successfully',
          severity: 'success',
        });
      } else {
        await addDoc(collection(db, 'tournaments'), tournamentData);
        setSnackbar({
          open: true,
          message: 'Tournament created successfully',
          severity: 'success',
        });
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving tournament:', error);
      setSnackbar({
        open: true,
        message: 'Error saving tournament',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'tournaments', id));
      setSnackbar({
        open: true,
        message: 'Tournament deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error deleting tournament:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting tournament',
        severity: 'error',
      });
    }
  };

  const renderTournamentForm = () => (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Tournament Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Game Type"
            name="gameType"
            value={formData.gameType}
            onChange={handleInputChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={3}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label="Tournament Date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Team Size</InputLabel>
            <Select
              name="teamSize"
              value={formData.teamSize}
              onChange={handleInputChange}
              required
            >
              <MenuItem value="solo">Solo</MenuItem>
              <MenuItem value="duo">Duo</MenuItem>
              <MenuItem value="squad">Squad</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Prize Pool"
            name="prize"
            value={formData.prize}
            onChange={handleInputChange}
            InputProps={{ inputProps: { min: 0 } }}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Entry Fee"
            name="entryFee"
            value={formData.entryFee}
            onChange={handleInputChange}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Maximum Participants"
            name="maxParticipants"
            value={formData.maxParticipants}
            onChange={handleInputChange}
            InputProps={{ inputProps: { min: 1 } }}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <MenuItem value="upcoming">Upcoming</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Tournament Rules"
            name="rules"
            value={formData.rules}
            onChange={handleInputChange}
            multiline
            rows={4}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Room Details
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Room ID"
            name="roomId"
            value={formData.roomId}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Room Password"
            name="roomPassword"
            value={formData.roomPassword}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Room Instructions"
            name="roomInstructions"
            value={formData.roomInstructions}
            onChange={handleInputChange}
            multiline
            rows={2}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Tournament Settings
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isPrivate}
                onChange={handleInputChange}
                name="isPrivate"
              />
            }
            label="Private Tournament"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.requiresVerification}
                onChange={handleInputChange}
                name="requiresVerification"
              />
            }
            label="Require Verification"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.autoApprove}
                onChange={handleInputChange}
                name="autoApprove"
              />
            }
            label="Auto Approve Teams"
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderTournamentList = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tournament</TableCell>
            <TableCell>Game</TableCell>
            <TableCell>Team Size</TableCell>
            <TableCell>Entry Fee</TableCell>
            <TableCell>Prize Pool</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Start Time</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tournaments.map((tournament) => (
            <React.Fragment key={tournament.id}>
              <TableRow>
                <TableCell>{tournament.title}</TableCell>
                <TableCell>{tournament.gameType}</TableCell>
                <TableCell>{tournament.teamSize}</TableCell>
                <TableCell>{formatIndianCurrency(tournament.entryFee)}</TableCell>
                <TableCell>{formatIndianCurrency(tournament.prize)}</TableCell>
                <TableCell>
                  <Chip 
                    label={tournament.status} 
                    color={
                      tournament.status === 'upcoming' ? 'primary' :
                      tournament.status === 'active' ? 'warning' :
                      tournament.status === 'completed' ? 'success' : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(tournament.date).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit Tournament">
                      <IconButton 
                        onClick={() => handleOpenDialog(tournament)}
                        disabled={tournament.status === 'completed'}
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete Tournament">
                      <IconButton 
                        onClick={() => handleDelete(tournament.id)}
                        disabled={tournament.status !== 'upcoming'}
                        size="small"
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Set Winners & Distribute Prizes">
                      <IconButton
                        onClick={() => {
                          setSelectedTournament(tournament);
                          setOpenPrizeDialog(true);
                        }}
                        disabled={tournament.status !== 'active'}
                        color="primary"
                        size="small"
                      >
                        <EmojiEvents />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={expandedTournament === tournament.id ? "Hide Participants" : "Show Participants"}>
                      <IconButton
                        onClick={() => setExpandedTournament(expandedTournament === tournament.id ? null : tournament.id)}
                        size="small"
                        color="info"
                      >
                        {expandedTournament === tournament.id ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell colSpan={8} style={{ paddingBottom: 0, paddingTop: 0 }}>
                  <Collapse in={expandedTournament === tournament.id} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 2 }}>
                      <Typography variant="h6" gutterBottom component="div">
                        Registered Teams
                      </Typography>
                      {tournament.registeredPlayers?.length > 0 ? (
                        <List>
                          {tournament.registeredPlayers.map((player) => (
                            <ListItem 
                              key={player.id}
                              sx={{ 
                                bgcolor: 'background.paper',
                                mb: 1,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider'
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar>
                                  <Groups />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="subtitle1">
                                      {player.displayName}
                                    </Typography>
                                    {tournament.teamStatus?.[player.id]?.position && (
                                      <Chip
                                        icon={<EmojiEvents />}
                                        label={`${tournament.teamStatus[player.id].position} Place`}
                                        color="primary"
                                        size="small"
                                      />
                                    )}
                                    {tournament.teamStatus?.[player.id]?.prize && (
                                      <Chip
                                        icon={<AccountBalanceWallet />}
                                        label={formatIndianCurrency(tournament.teamStatus[player.id].prize)}
                                        color="success"
                                        size="small"
                                      />
                                    )}
                                  </Box>
                                }
                                secondary={
                                  <>
                                    <Typography variant="body2" color="textSecondary">
                                      Email: {player.email}
                                    </Typography>
                                  </>
                                }
                              />
                              <ListItemSecondaryAction>
                                <Chip 
                                  label={tournament.teamStatus?.[player.id]?.status || 'registered'} 
                                  size="small"
                                  color={tournament.teamStatus?.[player.id]?.position ? 'success' : 'default'}
                                />
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography color="textSecondary">
                          No teams registered yet
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Tournament Management</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Create Tournament
          </Button>
          <Tooltip title="Refresh">
            <IconButton onClick={() => setLoading(true)}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {renderTournamentList()}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? 'Edit Tournament' : 'Create Tournament'}
        </DialogTitle>
        <DialogContent dividers>
          {renderTournamentForm()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            color="primary"
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <TournamentPrizeDistribution
        open={openPrizeDialog}
        onClose={() => setOpenPrizeDialog(false)}
        tournament={selectedTournament}
      />

      {snackbar.open && (
        <Alert
          severity={snackbar.severity}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: (theme) => theme.zIndex.modal + 1,
          }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      )}
    </Box>
  );
};

export default TournamentManagement;
