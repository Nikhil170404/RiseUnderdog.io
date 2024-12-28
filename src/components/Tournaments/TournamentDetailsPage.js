import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { db, doc, getDoc } from '../../firebase';
import TournamentDetails from './TournamentDetails';

const TournamentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const tournamentRef = doc(db, 'tournaments', id);
        const tournamentDoc = await getDoc(tournamentRef);

        if (!tournamentDoc.exists()) {
          setError('Tournament not found');
          return;
        }

        setTournament({ id: tournamentDoc.id, ...tournamentDoc.data() });
      } catch (error) {
        console.error('Error fetching tournament:', error);
        setError('Error loading tournament details');
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  const handleClose = () => {
    setIsDialogOpen(false);
    navigate('/tournaments');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/tournaments')}>
          Back to Tournaments
        </Button>
      </Box>
    );
  }

  return (
    <TournamentDetails
      open={isDialogOpen}
      onClose={handleClose}
      tournament={tournament}
    />
  );
};

export default TournamentDetailsPage;
