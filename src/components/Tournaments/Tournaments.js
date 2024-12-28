import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  InputAdornment,
  TextField,
  IconButton,
  Badge,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Refresh,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { db, collection, query, orderBy, onSnapshot } from '../../firebase';
import TournamentCard from './TournamentCard';
import TournamentRegistration from './TournamentRegistration';
import TournamentDetails from './TournamentDetails';

const Tournaments = () => {
  const user = useSelector(state => state.auth.user);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [openRegistration, setOpenRegistration] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [registeredTournaments, setRegisteredTournaments] = useState([]);

  // Real-time tournament updates
  useEffect(() => {
    const tournamentsRef = collection(db, 'tournaments');
    // Simplified query that doesn't require composite index
    const q = query(tournamentsRef, orderBy('date', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tournamentsData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Filter status client-side instead
        if (data.status === 'upcoming' || data.status === 'active') {
          const isRegistered = data.registeredPlayers?.some(
            player => player.uid === user?.uid
          );
          tournamentsData.push({
            id: doc.id,
            ...data,
            isRegistered,
          });
        }
      });
      setTournaments(tournamentsData);
      setRegisteredTournaments(tournamentsData.filter(t => t.isRegistered));
      setLoading(false);
    }, (error) => {
      console.error('Error fetching tournaments:', error);
      setError('Error loading tournaments');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleJoin = (tournament) => {
    setSelectedTournament(tournament);
    setOpenRegistration(true);
  };

  const handleViewDetails = (tournament) => {
    setSelectedTournament(tournament);
    setOpenDetails(true);
  };

  const filterTournaments = (tournaments) => {
    return tournaments.filter(tournament =>
      tournament.title.toLowerCase().includes(searchQuery) ||
      tournament.gameType.toLowerCase().includes(searchQuery)
    );
  };

  const TournamentsList = ({ tournaments }) => (
    <Grid container spacing={3}>
      {tournaments.length === 0 ? (
        <Grid item xs={12}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No tournaments found
            </Typography>
          </Paper>
        </Grid>
      ) : (
        filterTournaments(tournaments).map((tournament) => (
          <Grid item xs={12} sm={6} md={4} key={tournament.id}>
            <TournamentCard
              tournament={tournament}
              onJoin={handleJoin}
              onView={handleViewDetails}
              isJoined={tournament.isRegistered}
            />
          </Grid>
        ))
      )}
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Tournaments
          {registeredTournaments.length > 0 && (
            <Badge
              badgeContent={registeredTournaments.length}
              color="primary"
              sx={{ ml: 2 }}
            />
          )}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search tournaments..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Refresh">
            <IconButton onClick={() => setLoading(true)}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="All Tournaments" />
          <Tab
            label="My Tournaments"
            icon={registeredTournaments.length > 0 ? <Badge badgeContent={registeredTournaments.length} color="primary" /> : null}
          />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box hidden={currentTab !== 0}>
          <TournamentsList tournaments={tournaments} />
        </Box>
      )}

      <Box hidden={currentTab !== 1}>
        <TournamentsList tournaments={registeredTournaments} />
      </Box>

      {selectedTournament && (
        <>
          <TournamentRegistration
            open={openRegistration}
            onClose={() => setOpenRegistration(false)}
            tournament={selectedTournament}
          />
          <TournamentDetails
            open={openDetails}
            onClose={() => setOpenDetails(false)}
            tournament={selectedTournament}
          />
        </>
      )}
    </Container>
  );
};

export default Tournaments;
