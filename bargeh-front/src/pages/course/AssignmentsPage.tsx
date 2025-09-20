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
  IconButton,
  Button,
  Menu
} from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { FiChevronUp, FiChevronDown, FiMoreVertical, FiPlus, FiCheck, FiSettings, FiTrash2 } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import { useCourse } from "@/hooks/useCourse";
import { useAssignments } from "@/hooks/useAssignments";
import { convertEnglishTermToPersian } from "@/utils/persianDate";
import { useState } from "react";
import { assignmentService } from "@/services/assignmentService";

const AssignmentsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { course, isLoading, error } = useCourse(courseId);
  const { assignments, assignmentCount, isLoading: assignmentsLoading } = useAssignments(courseId);
  
  // State for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Handler functions
  const handleAssignmentSettings = (assignmentId: number) => {
    navigate(`/courses/${courseId}/assignments/${assignmentId}/settings`);
  };

  const handleDeleteAssignment = (assignmentId: number) => {
    setAssignmentToDelete(assignmentId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!assignmentToDelete) return;
    
    setIsDeleting(true);
    try {
      await assignmentService.deleteAssignment(assignmentToDelete);
      // Refresh assignments list by reloading the page
      window.location.reload();
    } catch (error) {
      console.error('Error deleting assignment:', error);
    } finally {
      setIsDeleting(false);
    }
  };

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
          <Text color={textColor}>در حال بارگذاری ...</Text>
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
          courseCode={course.courseCode}
          instructor={course.instructor}
          courseId={courseId}
        />
      </GridItem>

      <GridItem area="main">
        <Box bg={bgColor} minH="100vh" p={{ base: 4, md: 6 }} pb={24}>
          <VStack align="stretch" gap={6}>
            {/* Assignments Header */}
            <Box>
              <Heading 
                margin={5}
                size="xl" 
                color={textColor} 
                fontWeight="bold"
                fontFamily="inherit"
                fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
              >
                {assignmentsLoading ? (
                  <HStack>
                    <Spinner size="sm" />
                    <Text>در حال بارگذاری...</Text>
                  </HStack>
                ) : (
                  `${assignmentCount} تکلیف`
                )}
              </Heading>
            </Box>
            
            {/* Assignments Table */}
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
                        نام تکلیف
                      </Box>
                      <Box as="th" p={3} textAlign="right" color={textColor} fontWeight="semibold">
                       نمره کل
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
                      <Box as="th" p={3} textAlign="center" color={textColor} fontWeight="semibold">درخواست بازبینی</Box>
                      <Box as="th" p={3} textAlign="center" width="50px"></Box>
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {assignmentsLoading ? (
                      <Box as="tr">
                        <Box as="td" p={6} textAlign="center" gridColumn="span 9">
                          <VStack>
                            <Spinner size="md" color="blue.500" />
                            <Text color={textColor}>در حال بارگذاری تکالیف...</Text>
                          </VStack>
                        </Box>
                      </Box>
                    ) : assignments.length === 0 ? (
                      <Box as="tr">
                        <Box as="td" p={6} textAlign="center" {...{ colSpan: 9 }}>
                          <VStack>
                            <Text color={subtleText} fontSize="lg">هیچ تکلیفی یافت نشد.</Text>
                            <Text color={subtleText} fontSize="sm">برای شروع، اولین تکلیف را ایجاد کنید.</Text>
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
                          <Box as="td" p={3} color={textColor} fontWeight="medium">
                            {assignment.total_points}
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
                            <Box
                              w="24px"
                              h="24px"
                              borderRadius="full"
                              bg={assignment.is_published ? "blue.500" : "gray.300"}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              mx="auto"
                            >
                              {assignment.is_published && (
                                <Icon as={FiCheck} color="white" boxSize={3} />
                              )}
                            </Box>
                          </Box>
                          <Box as="td" p={3} textAlign="center">
                            <Text 
                              color={assignment.regrade_enabled ? "blue.500" : "red.500"}
                              fontWeight="medium"
                              fontSize="sm"
                            >
                              {assignment.regrade_enabled ? "ON" : "OFF"}
                            </Text>
                          </Box>
                          <Box as="td" p={3} textAlign="center" position="absolute" >
                            <Menu.Root>
                              <Menu.Trigger asChild>
                                <IconButton
                                  variant="ghost"
                                  size="sm"
                                  aria-label="عملیات"
                                  _hover={{ bg: "gray.100" }}
                                >
                                  <Icon as={FiMoreVertical} />
                                </IconButton>
                              </Menu.Trigger>
                              <Menu.Content 
                                bg={useColorModeValue("white", "gray.700")}
                                border="1px solid"
                                borderColor={useColorModeValue("gray.200", "gray.600")}
                                borderRadius="md"
                                boxShadow="lg"
                                minW="180px"
                                py={1}
                                zIndex={1000}
                                dir="rtl"
                                position="absolute"
                                left={0}
                              >
                                <Menu.Item 
                                  value="settings"
                                  onClick={() => handleAssignmentSettings(assignment.id)}
                                  bg="transparent"
                                  cursor="pointer"
                                  _hover={{ bg: useColorModeValue("blue.50", "blue.900") }}
                                  _focus={{ bg: useColorModeValue("blue.50", "blue.900") }}
                                  py={2}
                                  px={3}
                                  fontSize="sm"
                                >
                                  <HStack w="full">
                                    <Icon as={FiSettings} color="blue.500" />
                                    <Text color="blue.500">تنظیمات تکلیف</Text>
                                  </HStack>
                                </Menu.Item>
                                <Menu.Item 
                                  value="delete"
                                  onClick={() => handleDeleteAssignment(assignment.id)}
                                  bg="transparent"
                                  cursor="pointer"
                                  _hover={{ bg: useColorModeValue("red.50", "red.900") }}
                                  _focus={{ bg: useColorModeValue("red.50", "red.900") }}
                                  py={2}
                                  px={3}
                                  fontSize="sm"
                                >
                                  <HStack w="full">
                                    <Icon as={FiTrash2} color="red.500" />
                                    <Text color="red.500">حذف تکلیف</Text>
                                  </HStack>
                                </Menu.Item>
                              </Menu.Content>
                            </Menu.Root>
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
      
      {/* Bottom Action Bar */}
      <Box
        position='fixed'
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
            bg="#2E5BBA"
            color="white"
            size={{ base: "sm", md: "md" }}
            paddingLeft={2}
            _hover={{ bg: "#1E4A9A" }}
            fontSize={{ base: "xs", md: "sm" }}
            onClick={() => navigate(`/courses/${courseId}/assignments/new`)}
          >
            <Icon as={FiPlus} mr={2} />
            ایجاد تکلیف
          </Button>
        </HStack>
      </Box>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          zIndex={1000}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            bg={useColorModeValue("white", "gray.800")}
            borderRadius="lg"
            p={6}
            maxW="400px"
            w="90%"
            boxShadow="xl"
          >
            <VStack align="stretch" gap={4}>
              <Text fontSize="lg" fontWeight="bold" color={textColor} textAlign="center">
                حذف تکلیف
              </Text>
              <Text fontSize="sm" color="red.500" textAlign="center">
                آیا مطمئن هستید که می‌خواهید این تکلیف را حذف کنید؟
              </Text>
              <HStack justify="center" gap={3} mt={4}>
                <Button
                  paddingX={2}
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setAssignmentToDelete(null);
                  }}
                  disabled={isDeleting}
                >
                  انصراف
                </Button>
                <Button
                  paddingX={2}
                  colorScheme="red"
                  onClick={handleConfirmDelete}
                  loading={isDeleting}
                  loadingText="در حال حذف..."
                >
                  حذف
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}
    </Grid>
  );
};

export default AssignmentsPage;
