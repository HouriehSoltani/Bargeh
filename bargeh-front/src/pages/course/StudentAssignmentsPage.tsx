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
import { useParams, useNavigate } from "react-router-dom";
import { useCourse } from "@/hooks/useCourse";
import { useAssignments } from "@/hooks/useAssignments";
import { convertEnglishTermToPersian } from "@/utils/persianDate";

const StudentAssignmentsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { course, isLoading, error } = useCourse(courseId);
  const { assignments, assignmentCount, isLoading: assignmentsLoading } = useAssignments(courseId);
  
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
          {/* Page Header */}
          <Box
            bg={bgColor}
            p={6}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <VStack gap={4} align="stretch">
              <HStack justify="space-between" align="center">
                <VStack align="start" gap={2}>
                  <Heading size="xl" color={textColor}>
                    تکالیف {course.title}
                  </Heading>
                  <Text fontSize="lg" color="gray.600">
                    {course.courseCode} • {convertEnglishTermToPersian(course.term)} {course.year}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Box>

          {/* Assignments Table */}
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
                  لیست تکالیف
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  {assignmentCount || 0} تکلیف
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
                  {/* Table Header */}
                  <Box
                    p={4}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    borderBottom="1px solid"
                    borderColor={borderColor}
                  >
                    <HStack gap={4} fontSize="sm" fontWeight="semibold" color="gray.600">
                      <Box flex={2}>عنوان</Box>
                      <Box flex={1}>نوع</Box>
                      <Box flex={1}>مهلت</Box>
                      <Box flex={1}>امتیاز</Box>
                      <Box flex={1}>وضعیت</Box>
                      <Box flex={1}>عملیات</Box>
                    </HStack>
                  </Box>

                  {/* Table Rows */}
                  {assignments.map((assignment, index) => (
                    <Box
                      key={assignment.id}
                      p={4}
                      borderBottom={index < assignments.length - 1 ? "1px solid" : "none"}
                      borderColor={borderColor}
                      _hover={{ bg: hoverBg }}
                      transition="background-color 0.2s"
                    >
                      <HStack gap={4} align="center">
                        <Box flex={2}>
                          <VStack align="start" gap={1}>
                            <Text fontWeight="medium" color={textColor}>
                              {assignment.title}
                            </Text>
                            {assignment.instructions && (
                              <Text fontSize="sm" color="gray.600">
                                {assignment.instructions.length > 50 ? assignment.instructions.substring(0, 50) + '...' : assignment.instructions}
                              </Text>
                            )}
                          </VStack>
                        </Box>
                        
                        <Box flex={1}>
                          <Text fontSize="sm" color="gray.600">
                            {assignment.due_at ? new Date(assignment.due_at).toLocaleDateString() : 'بدون مهلت'}
                          </Text>
                        </Box>
                        
                        <Box flex={1}>
                          <Text fontSize="sm" color="gray.600">
                            {assignment.total_points}
                          </Text>
                        </Box>
                        
                        <Box flex={1}>
                          <HStack gap={2}>
                            <Box
                              w="12px"
                              h="12px"
                              borderRadius="full"
                              bg={assignment.is_published ? "green.500" : "gray.400"}
                            />
                            <Text fontSize="sm" color="gray.600">
                              {assignment.is_published ? "منتشر شده" : "پیش‌نویس"}
                            </Text>
                          </HStack>
                        </Box>
                        
                        <Box flex={1}>
                          <HStack gap={2}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/courses/${courseId}/assignments/${assignment.id}`)}
                            >
                              مشاهده
                            </Button>
                          </HStack>
                        </Box>
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

export default StudentAssignmentsPage;
