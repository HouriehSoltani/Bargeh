import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import AssignmentsPage from '@/pages/course/AssignmentsPage';
import StudentAssignmentsPage from '@/pages/course/StudentAssignmentsPage';

const AssignmentsRoleBasedRouter: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Show loading while user data is being fetched
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Students get student assignments page, instructors get full access
  if (user?.role === 'student') {
    return <StudentAssignmentsPage />;
  }

  // Instructors get full access to assignments page
  return <AssignmentsPage />;
};

export default AssignmentsRoleBasedRouter;
