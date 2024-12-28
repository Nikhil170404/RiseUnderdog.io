import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleGoBack = () => {
    if (!user) {
      navigate('/');
    } else if (user.isAdmin) {
      navigate('/admin');
    } else {
      navigate('/home');
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="80vh"
      textAlign="center"
      px={3}
    >
      <Typography variant="h1" color="primary" gutterBottom>
        404
      </Typography>
      <Typography variant="h4" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button variant="contained" color="primary" onClick={handleGoBack}>
        Go Back Home
      </Button>
    </Box>
  );
};

export default NotFound;
