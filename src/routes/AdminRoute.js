import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useAdmin from '../hooks/useAdmin';
import { Box, CircularProgress } from '@mui/material';

const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRoute;
