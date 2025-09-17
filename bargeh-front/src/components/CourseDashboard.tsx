import { Box, Heading, VStack, HStack, Button, Icon, useDisclosure, Spinner, Text } from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import CourseGrid from "./CourseGrid";
import { FiFileText, FiPlus } from "react-icons/fi";
import EnrollCoursePopup from "./EnrollCoursePopup";
import CreateCoursePopup from "./CreateCoursePopup";
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
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleEnrollSubmit = async (values: { entryCode: string }) => {
    try {
      const enrolledCourse = await enrollCourse(values);
      enrollDialog.onClose();
      // Navigate to the enrolled course page
      navigate(`/courses/${enrolledCourse.id}`);
    } catch (error) {
      console.error('Failed to enroll in course:', error);
    }
  };

  const handleCreateSubmit = async (values: {
    title: string;
    code: string;
    description?: string;
    term?: string;
    year?: number;
  }) => {
    try {
      const newCourse = await createCourse(values);
      createDialog.onClose();
      // Navigate to the newly created course page
      navigate(`/courses/${newCourse.id}`);
    } catch (error) {
      console.error('Failed to create course:', error);
    }
  };

  // Logout function commented out since authentication is bypassed
  // const handleLogout = async () => {
  //   try {
  //     await logout();
  //     navigate('/login');
  //   } catch (error) {
  //     console.error('Logout failed:', error);
  //   }
  // };

  // Show loading state
  if (isLoading) {
    return (
      <Box bg={bgColor} minH="100vh" p={6} display="flex" alignItems="center" justifyContent="center">
        <VStack>
          <Spinner size="xl" color="blue.500" />
          <Heading size="md" color={textColor}>در حال بارگذاری درس‌ها...</Heading>
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
        <Heading 
          size="xl" 
          color={textColor} 
          fontWeight="bold"
          fontFamily="inherit"
          fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
        >
          داشبورد درس‌ها
        </Heading>
      </VStack>

      {courses.length === 0 ? (
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          minH="60vh"
          textAlign="center"
        >
          <VStack gap={6} maxW="500px">
            <Box
              bg={useColorModeValue("blue.50", "blue.900")}
              borderRadius="full"
              p={8}
              boxShadow="lg"
            >
              <Icon as={FiFileText} boxSize={16} color="blue.500" />
            </Box>
            
            <VStack gap={4}>
              <Heading 
                size="lg" 
                color={textColor}
                fontFamily="inherit"
                fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
              >
                خوش آمدید به برگه
              </Heading>
              
              <Text 
                color={useColorModeValue("gray.600", "gray.300")}
                fontSize={{ base: "sm", md: "md" }}
                lineHeight="1.6"
                maxW="400px"
              >
                برای شروع کار، ابتدا یک درس جدید ایجاد کنید یا در یکی از درس‌های موجود ثبت‌نام کنید.
              </Text>
            </VStack>
            
            <HStack gap={4} pt={4}>
              <Button
                bg="#2E5BBA"
                color="white"
                size="md"
                paddingLeft={4}
                _hover={{ bg: "#1E4A9A" }}
                onClick={createDialog.onOpen}
              >
                <Icon as={FiPlus} mr={2} />
                ایجاد درس جدید
              </Button>
              
              <Button
                bg={bgColor}
                variant="outline"
                colorScheme="blue"
                size="md"
                paddingLeft={4}
                borderColor="#4A90E2"
                color="#4A90E2"
                _hover={{ bg: "#4A90E2", color: "white" }}
                onClick={enrollDialog.onOpen}
              >
                <Icon as={FiFileText} mr={2} />
                ثبت‌نام در درس
              </Button>
            </HStack>
          </VStack>
        </Box>
      ) : (
        <CourseGrid courses={courses} onCreateCourse={createDialog.onOpen} />
      )}
      
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
            ثبت‌نام در درس
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
            ایجاد درس
          </Button>
        </HStack>
      </Box>

      <EnrollCoursePopup
        isOpen={enrollDialog.open}
        onClose={enrollDialog.onClose}
        onSubmit={handleEnrollSubmit}
      />
      <CreateCoursePopup
        isOpen={createDialog.open}
        onClose={createDialog.onClose}
        onSubmit={handleCreateSubmit}
      />
    </Box>
  );
};

export default CourseDashboard;
