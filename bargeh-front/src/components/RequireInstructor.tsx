import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RequireInstructorProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export const RequireInstructor: React.FC<RequireInstructorProps> = ({ 
  children, 
  fallbackPath = '/' 
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only instructors can access
  if (user.role === 'instructor') {
    return <>{children}</>;
  }

  return <Navigate to={fallbackPath} replace />;
};

