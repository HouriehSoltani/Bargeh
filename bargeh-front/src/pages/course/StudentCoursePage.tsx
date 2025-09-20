import DynamicSidebar from "@/components/DynamicSidebar";
import { 
  Box, 
  Grid, 
  GridItem, 
  Heading, 
  Text, 
  VStack, 
  Spinner, 
  HStack,
  Button
} from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { useNavigate, useParams } from "react-router-dom";
import { useCourse } from "@/hooks/useCourse";
import { useAssignments } from "@/hooks/useAssignments";
import { convertEnglishTermToPersian } from "@/utils/persianDate";

const StudentCoursePage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { course, isLoading, error } = useCourse(courseId);
  const { assignments, isLoading: assignmentsLoading } = useAssignments(courseId);
  const navigate = useNavigate();
  
  // No delete functionality for students

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error || !course) {
    return (
      <Box p={8} textAlign="center">
        <Text color="red.500">خطا در بارگذاری درس: {error}</Text>
      </Box>
    );
  }

  return (
    <Grid
      templateAreas={{ base: `"main"`, md: `"aside main"` }}
      templateColumns={{
        base: "1fr",
        md: "250px 1fr",
      }}
      minH="100vh"
      gap={0}
    >
      {/* Sidebar */}
      <GridItem area="aside" display={{ base: "none", md: "block" }}>
        <DynamicSidebar
          courseTitle={course.title}
          courseSubtitle={`${convertEnglishTermToPersian(course.term)} ${course.year}`}
          courseCode={course.courseCode}
          instructor={course.instructor}
          courseId={courseId}
        />
      </GridItem>

      {/* Main Content Area */}
      <GridItem area="main" bg={useColorModeValue('gray.50', 'gray.900')} p={8}>
        <VStack gap={8} align="stretch">
          {/* Course Header */}
          <Box
            bg={bgColor}
            p={8}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <VStack gap={4} align="stretch">
              <HStack justify="space-between" align="center">
                <VStack align="start" gap={2}>
                  <Heading size="xl" color={textColor}>
                    {course.title}
                  </Heading>
                  <Text fontSize="lg" color="gray.600">
                    {course.courseCode} • {convertEnglishTermToPersian(course.term)} {course.year}
                  </Text>
                  <Text color="gray.600">
                    استاد: {course.instructor}
                  </Text>
                </VStack>
              </HStack>
              
              {course.description && (
                <Text color="gray.600" lineHeight="1.6">
                  {course.description}
                </Text>
              )}
            </VStack>
          </Box>

          {/* Assignments Section */}
          <Box
            bg={bgColor}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
            boxShadow="sm"
            overflow="hidden"
          >
            <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
              <HStack justify="space-between" align="center">
                <Heading size="lg" color={textColor}>
                  تکالیف
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  {assignments?.length || 0} تکلیف
                </Text>
              </HStack>
            </Box>

            <Box>
              {assignmentsLoading ? (
                <Box p={8} textAlign="center">
                  <Spinner size="lg" />
                </Box>
              ) : assignments && assignments.length > 0 ? (
                <VStack gap={0} align="stretch">
                  {assignments.map((assignment, index) => (
                    <Box
                      key={assignment.id}
                      p={6}
                      borderBottom={index < assignments.length - 1 ? "1px solid" : "none"}
                      borderColor={borderColor}
                      _hover={{ bg: hoverBg }}
                      transition="background-color 0.2s"
                    >
                      <HStack justify="space-between" align="center">
                        <VStack align="start" gap={2} flex={1}>
                          <HStack gap={3} align="center">
                            <Heading size="md" color={textColor}>
                              {assignment.title}
                            </Heading>
                            <Box
                              w="12px"
                              h="12px"
                              borderRadius="full"
                              bg={assignment.is_published ? "green.500" : "gray.400"}
                            />
                          </HStack>
                          <Text color="gray.600" fontSize="sm">
                            {assignment.instructions}
                          </Text>
                          <HStack gap={4} fontSize="sm" color="gray.500">
                            <Text>مهلت: {assignment.due_at ? new Date(assignment.due_at).toLocaleDateString() : 'بدون مهلت'}</Text>
                            <Text>امتیاز: {assignment.total_points}</Text>
                          </HStack>
                        </VStack>
                        
                        <HStack gap={2}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/courses/${courseId}/assignments/${assignment.id}`)}
                          >
                            مشاهده
                          </Button>
                        </HStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Box p={8} textAlign="center">
                  <Text color="gray.500" fontSize="lg">
                    هنوز تکلیفی ایجاد نشده است
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        </VStack>
      </GridItem>
    </Grid>
  );
};

export default StudentCoursePage;
