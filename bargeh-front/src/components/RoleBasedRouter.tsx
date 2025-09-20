import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import HomePage from '@/pages/HomePage';
import StudentHomePage from '@/pages/StudentHomePage';

const RoleBasedRouter: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Show loading while user data is being fetched
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Route based on user role
  if (user?.role === 'student') {
    return <StudentHomePage />;
  }

  // Default to instructor homepage (base system)
  return <HomePage />;
};

export default RoleBasedRouter;
