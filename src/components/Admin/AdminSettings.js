import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button,
  Box,
} from '@mui/material';
import { Save } from '@mui/icons-material';

const AdminSettings = () => {
  const settings = [
    {
      title: 'Enable User Registration',
      description: 'Allow new users to register on the platform',
      enabled: true,
    },
    {
      title: 'Tournament Creation',
      description: 'Allow users to create custom tournaments',
      enabled: false,
    },
    {
      title: 'Maintenance Mode',
      description: 'Put the site in maintenance mode',
      enabled: false,
    },
    {
      title: 'Email Notifications',
      description: 'Send email notifications for important updates',
      enabled: true,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              System Settings
            </Typography>
            <List>
              {settings.map((setting, index) => (
                <React.Fragment key={setting.title}>
                  <ListItem>
                    <ListItemText
                      primary={setting.title}
                      secondary={setting.description}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={setting.enabled}
                        onChange={() => {}}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < settings.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save />}
              >
                Save Changes
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminSettings;
