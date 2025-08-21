import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, children, userRole, allowedRoles }) => {
  console.log('ProtectedRoute:', { isAuthenticated, userRole, allowedRoles });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const allowedRolesNormalized = allowedRoles.map(r => r.toLowerCase());
    const userRoleNormalized = (userRole || '').toLowerCase();

    if (!allowedRolesNormalized.includes(userRoleNormalized)) {
      console.log('Redirection vers dashboard car rôle non autorisé');
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;