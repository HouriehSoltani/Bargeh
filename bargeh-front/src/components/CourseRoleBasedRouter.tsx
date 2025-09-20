import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import CoursePage from '@/pages/course/CoursePage';
import StudentCoursePage from '@/pages/course/StudentCoursePage';

const CourseRoleBasedRouter: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Show loading while user data is being fetched
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Students get student course page, instructors get full access
  if (user?.role === 'student') {
    return <StudentCoursePage />;
  }

  // Instructors get full access to course page
  return <CoursePage />;
};

export default CourseRoleBasedRouter;
