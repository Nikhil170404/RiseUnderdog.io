import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';

const ContentManagement = () => {
  const [contents] = useState([
    { id: 1, title: 'Welcome Post', type: 'News', status: 'Published' },
    { id: 2, title: 'Tournament Rules', type: 'Guide', status: 'Draft' },
    { id: 3, title: 'Gaming Tips', type: 'Article', status: 'Published' },
  ]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Content Management</Typography>
            <Button variant="contained" startIcon={<Add />}>
              Add New Content
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <List>
              {contents.map((content) => (
                <ListItem key={content.id} divider>
                  <ListItemText
                    primary={content.title}
                    secondary={`${content.type} • ${content.status}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="edit" sx={{ mr: 1 }}>
                      <Edit />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete">
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContentManagement;
