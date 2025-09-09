// Authentication imports commented out for development bypass
// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '@/hooks/useAuth';
// import { Box, Spinner, VStack, Heading } from '@chakra-ui/react';
// import { useColorModeValue } from '@/hooks/useColorMode';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // AUTHENTICATION BYPASSED FOR DEVELOPMENT
  // const { isAuthenticated, isLoading } = useAuth();
  // const location = useLocation();
  // const textColor = useColorModeValue("gray.800", "white");

  // // Show loading spinner while checking authentication
  // if (isLoading) {
  //   return (
  //     <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
  //       <VStack>
  //         <Spinner size="xl" color="blue.500" />
  //         <Heading size="md" color={textColor}>در حال بررسی احراز هویت...</Heading>
  //       </VStack>
  //     </Box>
  //   );
  // }

  // // Redirect to login if not authenticated
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }

  // Always allow access (authentication bypassed)
  return <>{children}</>;
};

export default ProtectedRoute;
