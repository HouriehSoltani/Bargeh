import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RequireRoleProps {
  children: React.ReactNode;
  role: 'instructor' | 'student';
  fallbackPath?: string;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ 
  children, 
  role, 
  fallbackPath = '/' 
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Simple role check
  if (user.role === role) {
    return <>{children}</>;
  }

  return <Navigate to={fallbackPath} replace />;
};
