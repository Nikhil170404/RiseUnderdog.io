import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useAdmin from '../hooks/useAdmin';

const PublicRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const { isAdmin } = useAdmin();

  if (user) {
    return <Navigate to={isAdmin ? '/admin' : '/home'} replace />;
  }

  return children;
};

export default PublicRoute;
