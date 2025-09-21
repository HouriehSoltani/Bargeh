import { Box, VStack, Button, Icon, Text, Heading, HStack } from "@chakra-ui/react";
import { Menu } from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCourse } from "@/hooks/useCourse";
import { useAssignment } from "@/hooks/useAssignment";
import { getNavigationConfig, type SidebarConfig } from "@/config/navigation";
import { FiUser, FiLogIn, FiLogOut, FiChevronDown, FiSettings } from "react-icons/fi";
import { useEffect, useState } from "react";
import UnenrollCoursePopup from "./UnenrollCoursePopup";

interface DynamicSidebarProps {
  config?: SidebarConfig;
  courseTitle?: string;
  courseSubtitle?: string;
  courseCode?: string;
  instructor?: string;
  courseId?: string;
}

const DynamicSidebar = ({ 
  config, 
  courseTitle, 
  courseSubtitle: _courseSubtitle, 
  courseCode,
  instructor,
  courseId
}: DynamicSidebarProps) => {
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const borderColor = useColorModeValue("gray.300", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const activeBgColor = useColorModeValue("blue.100", "blue.900");
  const activeTextColor = useColorModeValue("blue.700", "blue.200");
  
  // User menu colors
  const userMenuBg = useColorModeValue("white", "gray.700");
  const userMenuBorder = useColorModeValue("gray.200", "gray.600");
  const userMenuHover = useColorModeValue("gray.50", "gray.600");
  const userMenuActive = useColorModeValue("gray.100", "gray.500");
  
  // Get course data to extract user's role in the course
  const { course } = useCourse(courseId);
  const userMenuBorderHover = useColorModeValue("blue.300", "blue.500");
  const userMenuIcon = useColorModeValue("gray.400", "gray.300");
  const userMenuText = useColorModeValue("gray.800", "gray.100");
  const userMenuSubtext = useColorModeValue("gray.500", "gray.400");
  const userMenuContentBg = useColorModeValue("white", "gray.700");
  const userMenuContentBorder = useColorModeValue("gray.200", "gray.600");
  const userMenuItemHover = useColorModeValue("blue.50", "blue.900");
  const userMenuItemText = useColorModeValue("blue.700", "blue.200");
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get assignment data if we're on an assignment page
  const assignmentMatch = location.pathname.match(/^\/courses\/(\d+)\/assignments\/(\d+)\/(outline|submissions|grade|questions)/);
  const assignmentId = assignmentMatch ? assignmentMatch[2] : undefined;
  const { assignment } = useAssignment(assignmentId);
  const { user, isAuthenticated, logout } = useAuth();
  const [sidebarHeight, setSidebarHeight] = useState("100vh");
  const [isUnenrollPopupOpen, setIsUnenrollPopupOpen] = useState(false);

  useEffect(() => {
    const updateHeight = () => {
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      setSidebarHeight(`${documentHeight}px`);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    window.addEventListener('scroll', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('scroll', updateHeight);
    };
  }, []);

  // Get navigation config based on current path and global user role (simplified)
  const navigationConfig = config || getNavigationConfig(location.pathname, courseId, user?.role, course?.title, assignment?.title);

  const isActive = (path: string) => {
    // Handle exact matches
    if (location.pathname === path) {
      return true;
    }
    
    // Handle home page - both '/' and '/courses' should be active on home page
    if (path === '/' && (location.pathname === '/' || location.pathname === '/courses')) {
      return true;
    }
    
    // Check if the navigation path ends with 'assignments' and current path starts with that path
    if (path.endsWith('/assignments') && location.pathname.startsWith(path)) {
      return true;
    }
    
    // Handle course-specific routes (e.g., /courses/3/assignments should match /courses/assignments)
    if (path.startsWith('/courses/') && location.pathname.startsWith('/courses/')) {
      const pathParts = path.split('/');
      const locationParts = location.pathname.split('/');
      
      // Special case: highlight grading tab when on question submissions page
      if (path.endsWith('/grade') && location.pathname.includes('/questions/')) {
        return true;
      }
      
      // Don't highlight submissions tab when on question pages
      if (path.endsWith('/submissions') && location.pathname.includes('/questions/')) {
        return false;
      }
      
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
    if (href.includes('/unenroll')) {
      // Open unenroll popup instead of navigating
      setIsUnenrollPopupOpen(true);
    } else {
      navigate(href);
    }
  };

  return (
    <Box
      bg={bgColor}
      borderLeft="1px solid"
      borderColor={borderColor}
      p={4}
      position="sticky"
      top={0}
      h={sidebarHeight}
      overflowY="auto"
    >
      <VStack gap={6} align="stretch">
        {/* User Info (if authenticated and on home page) */}
        {isAuthenticated && user && (
          <Menu.Root>
            <Menu.Trigger asChild>
              <Box
                p={4} 
                bg={userMenuBg} 
                borderRadius="lg" 
                border="1px solid" 
                borderColor={userMenuBorder}
                cursor="pointer"
                _hover={{ 
                  bg: userMenuHover,
                  transform: "translateX(-3px)",
                  boxShadow: "md",
                  borderColor: userMenuBorderHover
                }}
                _active={{
                  bg: userMenuActive
                }}
                transition="all 0.3s ease"
                dir="rtl"
              >
                <HStack gap={3} justify="space-between" dir="rtl">
                  <HStack gap={2}>
                    <Icon as={FiChevronDown} color={userMenuIcon} />
                    <Box 
                      w="36px" 
                      h="36px" 
                      borderRadius="full" 
                      bg="blue.500" 
                      display="flex" 
                      alignItems="center" 
                      justifyContent="center"
                      color="white"
                      fontSize="sm"
                      fontWeight="bold"
                      boxShadow="sm"
                    >
                      {(user.name || user.email || "U").charAt(0).toUpperCase()}
                    </Box>
                  </HStack>
                  <VStack align="start" gap={0} flex={1}>
                    <Text fontSize="xs" fontWeight="bold" color={userMenuText}>
                      {user.name || user.email}
                    </Text>
                    <Text fontSize="xs" color={userMenuSubtext}>
                      {user.email}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </Menu.Trigger>
            <Menu.Content 
              dir="rtl"
              bg={userMenuContentBg}
              border="1px solid"
              borderColor={userMenuContentBorder}
              borderRadius="lg"
              boxShadow="xl"
              minW="200px"
              py={2}
            >
              <Menu.Item 
                value="dashboard" 
                onClick={() => navigate('/')}
                bg="transparent"
                cursor="pointer"
                _hover={{ 
                  bg: userMenuItemHover,
                  color: userMenuItemText
                }}
                _focus={{ 
                  bg: userMenuItemHover,
                  color: userMenuItemText
                }}
                py={3}
                px={4}
                fontSize="sm"
                fontWeight="medium"
              >
                <HStack gap={3} justify="space-between" w="full">
                  <Text>داشبورد درس‌ها</Text>
                  <Icon as={FiUser} />
                </HStack>
              </Menu.Item>
              <Menu.Item 
                value="profile" 
                onClick={() => navigate('/profile')}
                bg="transparent"
                cursor="pointer"
                _hover={{ 
                  bg: userMenuItemHover,
                  color: userMenuItemText
                }}
                _focus={{ 
                  bg: userMenuItemHover,
                  color: userMenuItemText
                }}
                py={3}
                px={4}
                fontSize="sm"
                fontWeight="medium"
              >
                <HStack gap={3} justify="space-between" w="full">
                  <Text>تنظیمات پروفایل</Text>
                  <Icon as={FiSettings} />
                </HStack>
              </Menu.Item>
            </Menu.Content>
          </Menu.Root>
        )}

        {/* Course Info (if on course page) */}
        {navigationConfig.type === 'course' && (
            <Heading size="lg" color={textColor} fontWeight="bold">
              {courseTitle || navigationConfig.title}
            </Heading>
        )}

        {/* Assignment Info (if on assignment page) */}
        {navigationConfig.type === 'assignment' && (
            <Heading size="lg" color={textColor} fontWeight="bold">
              {navigationConfig.title}
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
            {/* Add separator after first section (Back to Course) */}
            {sectionIndex === 0 && (
              <Box h="1px" bg={borderColor} mx={2} my={2} />
            )}
            {/* Add separator after second section (Review Grades) for assignment pages */}
            {navigationConfig.type === 'assignment' && sectionIndex === 1 && (
              <Box h="1px" bg={borderColor} mx={2} my={2} />
            )}
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

      {/* Unenroll Popup */}
      {isUnenrollPopupOpen && courseId && courseTitle && instructor && (
        <UnenrollCoursePopup
          isOpen={isUnenrollPopupOpen}
          onClose={() => setIsUnenrollPopupOpen(false)}
          courseId={parseInt(courseId)}
          courseTitle={courseTitle}
          courseCode={courseCode || ''}
          instructor={instructor}
        />
      )}
    </Box>
  );
};

export default DynamicSidebar;

