import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import {
  Groups,
  Groups3,
} from '@mui/icons-material';
import TournamentRegistration from './TournamentRegistration';
import TournamentDetails from './TournamentDetails';

const TournamentCard = ({
  tournament,
  onJoin,
  isJoined,
  onView,
}) => {
  const [openRegistration, setOpenRegistration] = React.useState(false);
  const [openDetails, setOpenDetails] = React.useState(false);

  const handleRegistrationComplete = (success) => {
    setOpenRegistration(false);
    if (success) {
      // Refresh tournament data if needed
      if (onView) {
        onView(tournament);
      }
    }
  };

  const handleViewDetails = () => {
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    // Refresh tournament data if needed
    if (onView) {
      onView(tournament);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return '#2196F3'; // Using a default color since theme is not defined
      case 'active':
        return '#4CAF50';
      case 'completed':
        return '#FF9800';
      case 'full':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getTeamSizeLabel = (teamSize) => {
    switch (teamSize) {
      case 'duo':
        return '2 Players';
      case 'squad':
        return '4 Players';
      default:
        return 'Solo';
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {tournament.title}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<Groups />}
            label={new Date(tournament.date).toLocaleDateString()}
            size="small"
          />
          <Chip
            icon={<Groups3 />}
            label={`${tournament.participants}/${tournament.maxParticipants}`}
            size="small"
          />
          <Chip
            icon={<Groups />}
            label={getTeamSizeLabel(tournament.teamSize)}
            size="small"
          />
          <Chip
            label={tournament.status}
            size="small"
            sx={{
              backgroundColor: getStatusColor(tournament.status),
              color: 'white'
            }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {tournament.description}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="primary">
            Prize Pool: ${tournament.prize}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Entry Fee: ${tournament.entryFee}
          </Typography>
        </Box>
      </CardContent>

      <CardActions>
        <Button
          size="small"
          onClick={handleViewDetails}
        >
          View Details
        </Button>
        {!isJoined && tournament.status !== 'full' && tournament.status !== 'completed' && (
          <Button
            size="small"
            color="primary"
            onClick={() => setOpenRegistration(true)}
          >
            Register
          </Button>
        )}
      </CardActions>

      <TournamentRegistration
        open={openRegistration}
        onClose={handleRegistrationComplete}
        tournament={tournament}
      />

      <TournamentDetails
        open={openDetails}
        onClose={handleCloseDetails}
        tournament={tournament}
      />
    </Card>
  );
};

TournamentCard.propTypes = {
  tournament: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    date: PropTypes.any.isRequired,
    gameType: PropTypes.string.isRequired,
    teamSize: PropTypes.string.isRequired,
    maxParticipants: PropTypes.number.isRequired,
    participants: PropTypes.number.isRequired,
    prize: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onJoin: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  isJoined: PropTypes.bool,
};

export default TournamentCard;
