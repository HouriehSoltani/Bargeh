import DynamicSidebar from "@/components/DynamicSidebar";
import { 
  Box, 
  Grid, 
  GridItem, 
  Heading, 
  Text, 
  VStack, 
  Icon, 
  Spinner, 
  HStack,
  Badge,
  IconButton,
  Button
} from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { FiChevronUp, FiChevronDown, FiMoreVertical, FiCircle, FiPlus } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useCourse } from "@/hooks/useCourse";
import { useAssignments } from "@/hooks/useAssignments";
import { convertEnglishTermToPersian } from "@/utils/persianDate";

const CoursePage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { course, isLoading, error } = useCourse(courseId);
  const { assignments, isLoading: assignmentsLoading } = useAssignments(courseId);
  const navigate = useNavigate();
  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");
  const subtleText = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.800");
  const tableRowHover = useColorModeValue("gray.50", "gray.800");
  const progressBg = useColorModeValue("gray.200", "gray.600");

  // Show loading state
  if (isLoading) {
    return (
      <Box bg={bgColor} minH="100vh" p={6} display="flex" alignItems="center" justifyContent="center">
        <VStack>
          <Spinner size="xl" color="blue.500" />
          <Text color={textColor}>در حال بارگذاری درس...</Text>
        </VStack>
      </Box>
    );
  }

  // Show error state
  if (error || !course) {
    return (
      <Box bg={bgColor} minH="100vh" p={6} display="flex" alignItems="center" justifyContent="center">
        <VStack>
          <Text color="red.500" fontSize="lg">خطا در بارگذاری درس</Text>
          <Text color={subtleText}>{error || 'درس یافت نشد'}</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Grid
      templateAreas={{ base: `"main"`, md: `"aside main"` }}
      templateColumns={{ base: "1fr", md: "250px 1fr" }}
      minH="100vh"
      gap={0}
    >
      <GridItem area="aside" display={{ base: "none", md: "block" }}>
        <DynamicSidebar 
          courseTitle={course.title}
          courseSubtitle={`${convertEnglishTermToPersian(course.term)} ${course.year}`}
          instructor={course.instructor}
          courseId={courseId}
        />
      </GridItem>

      <GridItem area="main">
        <Box bg={bgColor} minH="100vh" p={{ base: 4, md: 6 }}>
          <VStack align="stretch" gap={6}>
            {/* Course Header  */}
            <Box>
              <HStack align='center' gap={3} mb={2}>
                <Heading size="xl" color={textColor} fontWeight="bold">
                  {course.title}
                </Heading>
                <Box  height="20px" width="1px" bg={subtleText} />
                <Text color={subtleText} fontSize="lg">
                  {convertEnglishTermToPersian(course.term)} {course.year}
                </Text>
              </HStack>
              <Text color={subtleText} fontSize="sm">
                شماره درس: {course.courseCode}
              </Text>
            </Box>

            {/* Description Section */}
            <Box width="50%">
              <Heading size="md" color={textColor} mb={2}>
                توضیحات
            </Heading>
              <Box height="2px" width="100%" bg='gray.400' mb={3} />
              <Text color={textColor} fontSize="sm">
                {course.description || "توضیحات درس را در صفحه تنظیمات درس ویرایش کنید."}
              </Text>
            </Box>
            
            {/* Active Assignments Table */}
            <VStack align="stretch" gap={4}>
              <Box
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="md"
                overflow="hidden"
              >
                <Box as="table" width="100%" fontSize="sm">
                  <Box as="thead" bg={tableHeaderBg}>
                    <Box as="tr" borderBottom="1px" borderColor={borderColor}>
                      <Box as="th" p={3} textAlign="right" color={textColor} fontWeight="semibold">
                         تکالیف فعال
                      </Box>
                      <Box as="th" p={3} textAlign="right" color={textColor} fontWeight="semibold">
                        <HStack gap={1}>
                          <Text>تاریخ ایجاد</Text>
                          <Icon as={FiChevronDown} boxSize={3} />
                        </HStack>
                      </Box>
                      <Box as="th" p={3} textAlign="right" color={textColor} fontWeight="semibold">
                        <HStack gap={1}>
                          <Text>مهلت </Text>
                          <Icon as={FiChevronDown} boxSize={3} />
                        </HStack>
                      </Box>
                      <Box as="th" p={3} textAlign="right" color={textColor} fontWeight="semibold">
                        <HStack gap={1}>
                          <Text> تحویل داده‌شده</Text>
                          <Icon as={FiChevronUp} boxSize={3} />
                        </HStack>
                      </Box>
                      <Box as="th" p={3} textAlign="right" color={textColor} fontWeight="semibold">
                        <HStack gap={1}>
                          <Text> تصحیح شده</Text>
                          <Icon as={FiChevronUp} boxSize={3} />
                        </HStack>
                      </Box>
                      <Box as="th" p={3} textAlign="center" color={textColor} fontWeight="semibold">انتشار</Box>
                      <Box as="th" p={3} textAlign="center" color={textColor} fontWeight="semibold">بازبینی</Box>
                      <Box as="th" p={3} textAlign="center" width="50px"></Box>
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {assignmentsLoading ? (
                      <Box as="tr">
                        <Box as="td" p={6} textAlign="center" gridColumn="span 8">
                          <VStack>
                            <Spinner size="md" color="blue.500" />
                            <Text color={textColor}>در حال بارگذاری تکالیف...</Text>
                          </VStack>
                        </Box>
                      </Box>
                    ) : assignments.length === 0 ? (
                      <Box as="tr">
                        <Box as="td" p={6} textAlign="center" {...{ colSpan: 8 }}>
                          <VStack>
                            <Text color={subtleText} fontSize="md">هیچ تکلیف فعالی یافت نشد.</Text>
                            <Button
                                bg="#2E5BBA"
                                color="white"
                                size={{ base: "xs", md: "xs" }}
                                paddingLeft={2}
                                _hover={{ bg: "#1E4A9A" }}
                                fontSize={{ base: "xs", md: "sm" }}
                                onClick={() => navigate(`/courses/${courseId}/assignments/new`)}
                              >
                                <Icon as={FiPlus} mr={2} />
                                ایجاد تکلیف
                              </Button>
                          </VStack>
                        </Box>
                      </Box>
                    ) : (
                      assignments.map((assignment) => (
                        <Box 
                          key={assignment.id}
                          as="tr" 
                          borderBottom="1px" 
                          borderColor={borderColor}
                          _hover={{ bg: tableRowHover }}
                        >
                          <Box as="td" p={3} color={textColor} fontWeight="medium">
                            {assignment.title}
                          </Box>
                          <Box as="td" p={3} color={subtleText}>
                            {new Date(assignment.created_at).toLocaleDateString('fa-IR')}
                          </Box>
                          <Box as="td" p={3} color={subtleText}>
                            {assignment.due_at ? new Date(assignment.due_at).toLocaleDateString('fa-IR') : 'تعیین نشده'}
                          </Box>
                          <Box as="td" p={3} color={textColor}>
                            ۰
                          </Box>
                          <Box as="td" p={3}>
                            <VStack align="start" gap={1}>
                              <Box
                                width="100px"
                                height="6px"
                                bg={progressBg}
                                borderRadius="md"
                                position="relative"
                                overflow="hidden"
                              >
                                <Box
                                  width="0%"
                                  height="100%"
                                  bg="gray.500"
                                  borderRadius="md"
                                />
                              </Box>
                              <Text fontSize="xs" color={subtleText}>۰٪</Text>
                            </VStack>
                          </Box>
                          <Box as="td" p={3} textAlign="center">
                            <Icon as={FiCircle} color={assignment.is_published ? "green.500" : "gray.400"} />
                          </Box>
                          <Box as="td" p={3} textAlign="center">
                            <Badge 
                              colorScheme={assignment.is_published ? "green" : "gray"} 
                              variant="subtle" 
                              fontSize="xs"
                            >
                              {assignment.is_published ? "منتشر شده" : "فعال"}
                            </Badge>
                          </Box>
                          <Box as="td" p={3} textAlign="center">
                            <IconButton
                              variant="ghost"
                              size="sm"
                              aria-label="عملیات"
                            >
                              <Icon as={FiMoreVertical} />
                            </IconButton>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>
              </Box>
            </VStack>
          </VStack>
        </Box>
      </GridItem>
    </Grid>
  );
};

export default CoursePage;
