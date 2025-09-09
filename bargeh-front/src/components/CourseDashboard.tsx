import { Box, Heading, VStack, HStack, Button, Icon, useDisclosure, Spinner, Text } from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import CourseGrid from "./CourseGrid";
import { FiFileText, FiPlus, FiLogOut } from "react-icons/fi";
import EnrollCourseDialog from "./EnrollCourseDialog";
import CreateCourseDialog from "./CreateCourseDialog";
import { useCourses } from "@/hooks/useCourses";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const CourseDashboard = () => {
  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");
  const enrollDialog = useDisclosure();
  const createDialog = useDisclosure();
  
  // API hooks
  const { courses, isLoading, error, createCourse, enrollCourse, clearError } = useCourses();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleEnrollSubmit = async (values: { entryCode: string }) => {
    try {
      await enrollCourse(values);
      enrollDialog.onClose();
    } catch (error) {
      console.error('Failed to enroll in course:', error);
    }
  };

  const handleCreateSubmit = async (values: {
    courseNumber: string;
    courseName: string;
    description?: string;
    term: string;
    year: string;
    department?: string;
    allowEntryCode: boolean;
  }) => {
    try {
      await createCourse(values);
      createDialog.onClose();
    } catch (error) {
      console.error('Failed to create course:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Box bg={bgColor} minH="100vh" p={6} display="flex" alignItems="center" justifyContent="center">
        <VStack>
          <Spinner size="xl" color="blue.500" />
          <Heading size="md" color={textColor}>در حال بارگذاری دوره‌ها...</Heading>
        </VStack>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box bg={bgColor} minH="100vh" p={6}>
        <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md" p={4} mb={4}>
          <Text color="red.600" fontWeight="medium">{error}</Text>
        </Box>
        <Button onClick={clearError}>تلاش مجدد</Button>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Box bg={bgColor} minH="100vh" p={6} display="flex" alignItems="center" justifyContent="center">
        <VStack>
          <Heading size="md" color={textColor}>لطفاً وارد شوید</Heading>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" p={6} position="relative" pb={24} fontFamily="inherit">
      <VStack align="start" mb={8}>
        <HStack justify="space-between" w="full" align="center">
          <Heading 
            size="xl" 
            color={textColor} 
            fontWeight="bold"
            fontFamily="inherit"
            fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
          >
            داشبورد دوره‌ها
          </Heading>
          <Button
            variant="outline"
            size="sm"
            color="#e53e3e"
            borderColor="#e53e3e"
            _hover={{ bg: "#e53e3e", color: "white" }}
            onClick={handleLogout}
          >
            <Icon as={FiLogOut} mr={2} />
            خروج
          </Button>
        </HStack>
      </VStack>

      <CourseGrid courses={courses} />
      
      {/* Bottom Action Bar */}
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg="gray.100"
        borderTop="1px solid"
        borderColor="gray.300"
        p={{ base: 1, md: 2 }}
        zIndex={10}
        w="100%"
      >
        <HStack justify="flex-end" mx="auto" px={{ base: 4, md: 6 }}>
          <Button
            bg={bgColor}
            variant="outline"
            colorScheme="blue"
            size={{ base: "sm", md: "md" }}
            paddingLeft={2}
            borderColor="#4A90E2"
            color="#4A90E2"
            _hover={{ bg: "#4A90E2", color: "white" }}
            fontSize={{ base: "xs", md: "sm" }}
            onClick={enrollDialog.onOpen}
          >
            <Icon as={FiFileText} mr={2} />
            ثبت‌نام در دوره
          </Button>
          <Button
            bg="#2E5BBA"
            color="white"
            size={{ base: "sm", md: "md" }}
            paddingLeft={2}
            _hover={{ bg: "#1E4A9A" }}
            fontSize={{ base: "xs", md: "sm" }}
            onClick={createDialog.onOpen}
          >
            <Icon as={FiPlus} mr={2} />
            ایجاد دوره
          </Button>
        </HStack>
      </Box>

      <EnrollCourseDialog
        open={enrollDialog.open}
        setOpen={enrollDialog.setOpen}
        onClose={enrollDialog.onClose}
        onSubmit={handleEnrollSubmit}
      />
      <CreateCourseDialog
        open={createDialog.open}
        setOpen={createDialog.setOpen}
        onClose={createDialog.onClose}
        onSubmit={handleCreateSubmit}
      />
    </Box>
  );
};

export default CourseDashboard;
