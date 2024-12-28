import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { db, doc, updateDoc, onSnapshot, setDoc } from '../../firebase';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    gameIds: {
      bgmi: '',
      freeFire: '',
      codm: '',
      valorant: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    // Set up real-time listener for profile changes
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setProfile({
            name: data.name || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
            gameIds: {
              bgmi: data.gameIds?.bgmi || '',
              freeFire: data.gameIds?.freeFire || '',
              codm: data.gameIds?.codm || '',
              valorant: data.gameIds?.valorant || '',
            },
          });
        } else {
          // Create initial profile if it doesn't exist
          const initialProfile = {
            email: user.email,
            createdAt: new Date(),
            gameIds: {
              bgmi: '',
              freeFire: '',
              codm: '',
              valorant: '',
            },
          };
          setDoc(doc(db, 'users', user.uid), initialProfile);
          setProfile({
            ...initialProfile,
            name: '',
            phone: '',
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching profile:', error);
        setSnackbar({
          open: true,
          message: 'Error loading profile',
          severity: 'error',
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleInputChange = (field) => (event) => {
    setProfile((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleGameIdChange = (game) => (event) => {
    setProfile((prev) => ({
      ...prev,
      gameIds: {
        ...prev.gameIds,
        [game]: event.target.value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      const updates = {
        name: profile.name,
        phone: profile.phone,
        gameIds: {
          bgmi: profile.gameIds.bgmi,
          freeFire: profile.gameIds.freeFire,
          codm: profile.gameIds.codm,
          valorant: profile.gameIds.valorant,
        },
        updatedAt: new Date(),
      };
      
      await updateDoc(userRef, updates);

      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Error updating profile',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profile Settings
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={profile.name}
                onChange={handleInputChange('name')}
                required
                helperText="Enter your full name"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={profile.email}
                disabled
                helperText="Email cannot be changed"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={profile.phone}
                onChange={handleInputChange('phone')}
                helperText="Enter your contact number"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Game IDs
              </Typography>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="BGMI ID"
                        value={profile.gameIds.bgmi}
                        onChange={handleGameIdChange('bgmi')}
                        helperText="Enter your BGMI player ID"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Free Fire ID"
                        value={profile.gameIds.freeFire}
                        onChange={handleGameIdChange('freeFire')}
                        helperText="Enter your Free Fire player ID"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="COD Mobile ID"
                        value={profile.gameIds.codm}
                        onChange={handleGameIdChange('codm')}
                        helperText="Enter your COD Mobile player ID"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Valorant ID"
                        value={profile.gameIds.valorant}
                        onChange={handleGameIdChange('valorant')}
                        helperText="Enter your Valorant player ID"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={saving}
                  fullWidth
                  size="large"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;
