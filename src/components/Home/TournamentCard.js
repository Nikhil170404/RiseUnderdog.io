import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Card, CardContent, CardMedia, Typography, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Checkbox, FormControlLabel
} from '@mui/material';
import { collection, onSnapshot, doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWallet, updateWallet } from '../../redux/actions/walletAction';
import { firestore } from '../../firebase';
import './TournamentCard.css';

const TournamentCard = ({ onJoin }) => {
  const [tournaments, setTournaments] = useState([]);
  const [joinedTournaments, setJoinedTournaments] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({});
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [gameUsername, setGameUsername] = useState('');
  const [gameUID, setGameUID] = useState('');
  const [mapDownloaded, setMapDownloaded] = useState(false);
  const [currentTournament, setCurrentTournament] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const wallet = useSelector((state) => state.wallet);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      dispatch(fetchWallet());
    }

    const unsubscribe = onSnapshot(collection(firestore, 'tournaments'), (snapshot) => {
      const tournamentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Remove duplicate tournaments by ID
      const uniqueTournaments = tournamentsData.reduce((acc, tournament) => {
        if (!acc.some((t) => t.id === tournament.id)) {
          acc.push(tournament);
        }
        return acc;
      }, []);

      setTournaments(uniqueTournaments);
    });

    return () => unsubscribe();
  }, [user, dispatch]);

  useEffect(() => {
    const fetchJoinedTournaments = async () => {
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          setJoinedTournaments(userDoc.data().joinedTournaments || {});
        }
      }
    };
    fetchJoinedTournaments();
  }, [user]);

  const handleJoinClick = async (tournament) => {
    if (!user) {
      alert('Please log in to join a tournament.');
      return;
    }

    if (joinedTournaments[tournament.id]) {
      showRoomDetails(tournament);
      return;
    }

    if (tournament.isPaid && wallet.balance < tournament.entryFee) {
      alert('Insufficient funds in your wallet.');
      return;
    }

    setCurrentTournament(tournament);
    setFormDialogOpen(true);
  };

  const handleSubmitForm = async () => {
    if (!gameUsername || !gameUID || !mapDownloaded) {
      alert('Please fill out all fields and confirm you have downloaded the map.');
      return;
    }

    try {
      const tournamentRef = doc(firestore, 'tournaments', currentTournament.id);
      const tournamentDoc = await getDoc(tournamentRef);

      if (tournamentDoc.exists()) {
        const tournamentData = tournamentDoc.data();

        if (tournamentData.participants > 0) {
          // Update participant count and add participant data
          await updateDoc(tournamentRef, {
            participants: tournamentData.participants - 1,
            participantsData: arrayUnion({
              userId: user.uid,
              gameUsername,
              gameUID,
              mapDownloaded,
            }),
          });

          if (currentTournament.isPaid) {
            // Deduct entry fee from wallet and update wallet balance
            const newBalance = wallet.balance - currentTournament.entryFee;
            const walletRef = doc(firestore, 'wallets', user.uid);
            await updateDoc(walletRef, {
              balance: newBalance,
              transactions: arrayUnion({
                amount: currentTournament.entryFee,
                type: 'debit',
                date: new Date(),
                details: `Entry Fee for ${currentTournament.title}`,
              }),
            });
            dispatch(updateWallet(newBalance));
          }

          // Update user's joined tournaments
          const userRef = doc(firestore, 'users', user.uid);
          await updateDoc(userRef, {
            joinedTournaments: {
              ...joinedTournaments,
              [currentTournament.id]: true,
            },
          });
          setJoinedTournaments((prevState) => ({
            ...prevState,
            [currentTournament.id]: true,
          }));

          showRoomDetails(currentTournament);
        } else {
          alert('This tournament is now full.');
        }
      }
    } catch (error) {
      console.error('Error joining tournament:', error);
      alert('An error occurred while trying to join the tournament.');
    } finally {
      setFormDialogOpen(false);
    }
  };

  const showRoomDetails = (tournament) => {
    setDialogContent({
      roomId: tournament.roomId,
      roomPassword: tournament.roomPassword,
      whatsappGroupLink: tournament.whatsappGroupLink,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogContent({});
  };

  return (
    <div className="tournament-card-container">
      {tournaments.map((tournament) => (
        <Card key={tournament.id} className="tournament-card">
          {tournament.imageUrl && (
            <CardMedia
              component="img"
              height="140"
              image={tournament.imageUrl}
              alt={tournament.title}
              className="tournament-card-image"
            />
          )}
          <CardContent>
            <Typography variant="h5" component="div">
              {tournament.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tournament.description}
            </Typography>
            <Typography variant="body2" color="text.primary">
              Entry Fee: {tournament.isPaid ? `₹${tournament.entryFee}` : 'Free'}
            </Typography>
            <Typography variant="body2" color="text.primary">
              Participants: {tournament.participants}
            </Typography>
            <Typography variant="body2" color="text.primary">
              Prize Pool: ₹{tournament.prizePool}
            </Typography>
            <Typography variant="body2" color="text.primary">
              Map: {tournament.mapName}
            </Typography>
            <Typography variant="body2" color="text.primary">
              Type: {tournament.tournamentType}
            </Typography>
            <div className="button-container">
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleJoinClick(tournament)}
                className="join-button"
                disabled={tournament.participants === 0 || joinedTournaments[tournament.id]}
              >
                {joinedTournaments[tournament.id] ? 'Joined Already' : tournament.participants === 0 ? 'Tournament Full' : 'Join Tournament'}
              </Button>
              {joinedTournaments[tournament.id] && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => showRoomDetails(tournament)}
                  className="view-credentials-button"
                >
                  View Credentials
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Room Details</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Room ID: {dialogContent.roomId}</Typography>
          <Typography variant="body1">Room Password: {dialogContent.roomPassword}</Typography>
          {dialogContent.whatsappGroupLink && (
            <div className="whatsapp-group">
              <Typography variant="body1" color="text.primary">
                For further details and notifications, please join the WhatsApp group:
              </Typography>
              <Button
                variant="contained"
                color="primary"
                href={dialogContent.whatsappGroupLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Join WhatsApp Group
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={formDialogOpen} onClose={() => setFormDialogOpen(false)}>
        <DialogTitle>Join Tournament</DialogTitle>
        <DialogContent>
          <TextField
            label="Game Username"
            value={gameUsername}
            onChange={(e) => setGameUsername(e.target.value)}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Game UID"
            value={gameUID}
            onChange={(e) => setGameUID(e.target.value)}
            fullWidth
            margin="dense"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={mapDownloaded}
                onChange={(e) => setMapDownloaded(e.target.checked)}
              />
            }
            label="I have downloaded the required map."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmitForm} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

TournamentCard.propTypes = {
  onJoin: PropTypes.func.isRequired,
};

export default TournamentCard;