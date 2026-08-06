import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectUserRole } from '../../redux/slices/authSlice';


export default function RoleGuard({ allowedRoles, children }) {
  const userRole = useSelector(selectUserRole);

  // 1. If no role is found, redirect to login
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check if the user's role is in the allowed list
  const isAuthorized = Array.isArray(allowedRoles)
    ? allowedRoles.includes(userRole)
    : userRole === allowedRoles;

  // 3. If unauthorized, bounce them back to the Dashboard (or show a 403 page)
  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return children;
}