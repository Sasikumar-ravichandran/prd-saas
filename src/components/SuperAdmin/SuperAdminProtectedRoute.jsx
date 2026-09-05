import React from 'react';
import { Navigate } from 'react-router-dom';

export default function SuperAdminProtectedRoute({ children }) {
  const token = localStorage.getItem('saas_token');
  const userStr = localStorage.getItem('saas_user');

  // 1. If missing token or user data, redirect immediately
  if (!token || !userStr) {
    return <Navigate to="/admin-login" replace />;
  }

  let isAuthorized = false;

  // 2. Only use try/catch for JSON parsing
  try {
    const user = JSON.parse(userStr);
    if (user && user.isSuperAdmin) {
      isAuthorized = true;
    }
  } catch (e) {
    // If JSON parsing fails (invalid data in localStorage), it will default to false
    console.error("Failed to parse SaaS admin session data");
  }

  // 3. Construct and return JSX completely outside the try/catch
  if (!isAuthorized) {
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_user');
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}