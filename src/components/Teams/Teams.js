import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme,
  useMediaQuery,
  Skeleton,
} from '@mui/material';
import {
  Star,
  Add as AddIcon,
  Edit as EditIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { db, collection, getDocs, createTeam } from '../../firebase';
import { useSelector } from 'react-redux';

const Teams = () => {
  const theme = useTheme();
  // eslint-disable-next-line no-unused-vars
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsSnapshot = await getDocs(collection(db, 'teams'));
        const teamsData = teamsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTeams(teamsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching teams:', error);
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleCreateTeam = async (teamData) => {
    try {
      await createTeam(teamData);
      setOpenDialog(false);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={300} height={24} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3].map((skeleton) => (
            <Grid item xs={12} sm={6} md={4} key={skeleton}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Teams
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse and join competitive teams
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Create Team
        </Button>
      </Box>

      <Grid container spacing={3}>
        {teams.map((team) => (
          <Grid item xs={12} sm={6} md={4} key={team.id}>
            <Card 
              elevation={3}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: theme.palette.primary.main,
                      mr: 2,
                    }}
                  >
                    {team.name?.[0] || 'T'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {team.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {team.members?.length || 0} Members
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {team.description || 'No description provided'}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {team.achievements?.map((achievement, index) => (
                    <Chip
                      key={index}
                      size="small"
                      icon={<Star />}
                      label={achievement}
                      variant="outlined"
                    />
                  ))}
                </Box>

                <Box sx={{ mt: 'auto' }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setSelectedTeam(team)}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Team</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Team Name"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => handleCreateTeam({
              name: 'New Team',
              description: 'Team description',
              captain: user.uid,
              members: [user.uid],
              createdAt: new Date(),
            })}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(selectedTeam)}
        onClose={() => setSelectedTeam(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedTeam && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: theme.palette.primary.main,
                    mr: 2,
                  }}
                >
                  {selectedTeam.name?.[0]}
                </Avatar>
                {selectedTeam.name}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedTeam.description}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Team Members
              </Typography>
              <List>
                {selectedTeam.members?.map((memberId) => (
                  <ListItem key={memberId}>
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={memberId === selectedTeam.captain ? 'Team Captain' : 'Member'}
                      secondary={`Member since ${new Date().toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedTeam(null)}>Close</Button>
              {user?.uid === selectedTeam.captain && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                >
                  Edit Team
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Teams;
