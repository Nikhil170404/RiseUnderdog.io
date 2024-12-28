import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useAdmin from '../hooks/useAdmin';

const UserRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const { isAdmin } = useAdmin();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default UserRoute;
