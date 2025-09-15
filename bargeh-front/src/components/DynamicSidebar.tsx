import { Box, VStack, Button, Icon, Text, Heading, HStack } from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getNavigationConfig, type SidebarConfig } from "@/config/navigation";
import { FiUser, FiLogIn, FiLogOut } from "react-icons/fi";

interface DynamicSidebarProps {
  config?: SidebarConfig;
  courseTitle?: string;
  courseSubtitle?: string;
  instructor?: string;
  courseId?: string;
}

const DynamicSidebar = ({ 
  config, 
  courseTitle, 
  courseSubtitle: _courseSubtitle, 
  instructor,
  courseId
}: DynamicSidebarProps) => {
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const borderColor = useColorModeValue("gray.300", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const activeBgColor = useColorModeValue("blue.100", "blue.900");
  const activeTextColor = useColorModeValue("blue.700", "blue.200");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // Get navigation config based on current path if not provided
  const navigationConfig = config || getNavigationConfig(location.pathname, courseId);

  const isActive = (path: string) => {
    // Handle exact matches
    if (location.pathname === path) return true;
    
    // Handle course-specific routes (e.g., /courses/3/assignments should match /courses/assignments)
    if (path.startsWith('/courses/') && location.pathname.startsWith('/courses/')) {
      const pathParts = path.split('/');
      const locationParts = location.pathname.split('/');
      
      // If the last part of both paths match (e.g., 'assignments')
      if (pathParts.length >= 3 && locationParts.length >= 3) {
        return pathParts[pathParts.length - 1] === locationParts[locationParts.length - 1];
      }
    }
    
    return false;
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigation = (href: string) => {
    if (href === '/courses/unenroll') {
      // Handle unenroll action
      return;
    }
    navigate(href);
  };

  return (
    <Box
      bg={bgColor}
      borderLeft="1px solid"
      borderColor={borderColor}
      h="100vh"
      p={4}
      position="sticky"
      top={0}
    >
      <VStack gap={6} align="stretch">
        {/* User Info (if authenticated and on home page) */}
        {isAuthenticated && user && (
          <Box 
            p={3} 
            bg="white" 
            borderRadius="md" 
            border="1px solid" 
            borderColor={borderColor}
            cursor="pointer"
            _hover={{ 
              bg: "gray.50",
              transform: "translateX(-2px)",
              boxShadow: "sm"
            }}
            transition="all 0.2s"
            onClick={() => navigate('/')}
          >
            <HStack gap={3}>
              <Box 
                w="32px" 
                h="32px" 
                borderRadius="full" 
                bg="blue.500" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                color="white"
                fontSize="sm"
                fontWeight="bold"
              >
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </Box>
              <VStack align="start" gap={0} flex={1}>
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  {user.name || user.email}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {user.email}
                </Text>
              </VStack>
            </HStack>
          </Box>
        )}

        {/* Course Info (if on course page) */}
        {navigationConfig.type === 'course' && (
            <Heading size="lg" color={textColor} fontWeight="bold">
              {courseTitle || navigationConfig.title}
            </Heading>
        )}

        {/* Navigation Sections */}
        {navigationConfig.sections.map((section, sectionIndex) => (
          <VStack key={sectionIndex} gap={2} align="stretch">
            {section.title && (
              <Heading size="sm" color={textColor}>{section.title}</Heading>
            )}
            {section.items.map((item, itemIndex) => (
              <Button
                key={itemIndex}
                variant="ghost"
                justifyContent="flex-start"
                color={item.path && isActive(item.path) ? activeTextColor : textColor}
                bg={item.path && isActive(item.path) ? activeBgColor : "transparent"}
                _hover={{ 
                  bg: item.path && isActive(item.path) ? activeBgColor : "#4A90E2", 
                  color: item.path && isActive(item.path) ? activeTextColor : "white",
                  transform: "translateX(-4px)"
                }}
                fontSize="sm"
                h="30px"
                transition="all 0.3s"
                onClick={() => handleNavigation(item.href)}
              >
                <Icon as={item.icon} mr={2} />
                {item.label}
              </Button>
            ))}
          </VStack>
        ))}

        {/* Instructor Section (for course pages) */}
        {navigationConfig.type === 'course' && instructor && (
          <VStack align="stretch" gap={2}>
            <Heading size="md" color={textColor}>استاد درس</Heading>
            <HStack gap={2}>
              <Icon as={FiUser} color={textColor} />
              <Text fontSize="sm" color={textColor}>{instructor}</Text>
            </HStack>
          </VStack>
        )}

        {/* Course Actions (for course pages) */}
        {navigationConfig.type === 'course' && navigationConfig.courseActions && (
          <VStack align="stretch" gap={2}>
            <Heading size="md" color={textColor}>عملیات درس</Heading>
            {navigationConfig.courseActions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                justifyContent="flex-start"
                color="red.500"
                _hover={{ 
                  bg: "red.100", 
                  color: "red.700",
                  transform: "translateX(-4px)"
                }}
                fontSize="sm"
                h="40px"
                transition="all 0.3s"
                onClick={() => handleNavigation(action.href)}
              >
                <Icon as={action.icon} mr={2} />
                {action.label}
              </Button>
            ))}
          </VStack>
        )}

        {/* Authentication Button (for home page) */}
        {navigationConfig.type === 'home' && (
          isAuthenticated ? (
            <Button
              variant="outline"
              justifyContent="flex-start"
              color="#e53e3e"
              borderColor="#e53e3e"
              _hover={{ 
                bg: "#e53e3e", 
                color: "white",
                transform: "translateX(-4px)"
              }}
              fontSize="sm"
              h="40px"
              transition="all 0.3s"
              onClick={handleLogout}
            >
              <Icon as={FiLogOut} mr={2} />
              خروج
            </Button>
          ) : (
            <Button
              variant="outline"
              justifyContent="flex-start"
              color="#4A90E2"
              borderColor="#4A90E2"
              _hover={{ 
                bg: "#4A90E2", 
                color: "white",
                transform: "translateX(-4px)"
              }}
              fontSize="sm"
              h="40px"
              transition="all 0.3s"
              onClick={handleLogin}
            >
              <Icon as={FiLogIn} mr={2} />
              ورود
            </Button>
          )
        )}
      </VStack>
    </Box>
  );
};

export default DynamicSidebar;
