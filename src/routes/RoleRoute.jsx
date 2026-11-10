import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RoleRoute = ({ allowedRoles = [], children }) => {
  const { role, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-slate-500">Đang xác minh phiên đăng nhập...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/403" state={{ from: location }} replace />;
  }

  return children;
};
