import DynamicSidebar from "@/components/DynamicSidebar";
import AssignmentTemplatePopup from "@/components/AssignmentTemplatePopup";
import StudentUploadPopup from "@/components/StudentUploadPopup";
import { 
  Box, 
  Grid, 
  GridItem, 
  Heading, 
  Text, 
  VStack, 
  Spinner, 
  HStack,
  Button,
  Icon
} from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { useParams, useNavigate } from "react-router-dom";
import { useCourse } from "@/hooks/useCourse";
import { useAssignments } from "@/hooks/useAssignments";
import { convertEnglishTermToPersian } from "@/utils/persianDate";
import { FiChevronDown, FiUpload, FiFile } from "react-icons/fi";
import { useState, useEffect } from "react";
import { api } from "@/services/api";

const StudentAssignmentsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { course, isLoading, error } = useCourse(courseId);
  const { assignments, isLoading: assignmentsLoading } = useAssignments(courseId);
  
  // State for template popup
  const [isTemplatePopupOpen, setIsTemplatePopupOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<{
    title: string;
    templateUrl?: string;
  } | null>(null);

  // State for submission status
  const [submissionStatus, setSubmissionStatus] = useState<Record<number, 'not_submitted' | 'submitted' | 'graded'>>({});

  // State for upload popup
  const [isUploadPopupOpen, setIsUploadPopupOpen] = useState(false);
  const [selectedAssignmentForUpload, setSelectedAssignmentForUpload] = useState<any>(null);

  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");
  const subtleText = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.800");
  const tableRowHover = useColorModeValue("gray.50", "gray.800");

  // Handler for opening template popup
  const handleAssignmentClick = (assignment: any) => {
    setSelectedAssignment({
      title: assignment.title,
      templateUrl: assignment.template_pdf
    });
    setIsTemplatePopupOpen(true);
  };

  // Handler for closing template popup
  const handleCloseTemplatePopup = () => {
    setIsTemplatePopupOpen(false);
    setSelectedAssignment(null);
  };

  // Load submission status for assignments
  const loadSubmissionStatus = async () => {
    if (!assignments || assignments.length === 0) return;

    // Check if user is authenticated
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('No access token found, skipping submission status loading');
      return;
    }

    const statusMap: Record<number, 'not_submitted' | 'submitted' | 'graded'> = {};
    
    for (const assignment of assignments) {
      try {
        console.log(`Loading submission status for assignment ${assignment.id}...`);
        const submission = await api.get(`/api/assignments/${assignment.id}/submissions/student/`);
        console.log(`Assignment ${assignment.id} submission data:`, submission);
        
        if (submission) {
          // Check if submission is graded (has grades)
          if ((submission as any).grades && (submission as any).grades.length > 0) {
            statusMap[assignment.id] = 'graded';
            console.log(`Assignment ${assignment.id} status: graded`);
          } else {
            statusMap[assignment.id] = 'submitted';
            console.log(`Assignment ${assignment.id} status: submitted`);
          }
        } else {
          statusMap[assignment.id] = 'not_submitted';
          console.log(`Assignment ${assignment.id} status: not_submitted (no submission data)`);
        }
      } catch (error: any) {
        console.warn(`Could not load submission status for assignment ${assignment.id}:`, error);
        console.warn(`Error details:`, error.response?.data);
        statusMap[assignment.id] = 'not_submitted';
        console.log(`Assignment ${assignment.id} status: not_submitted (error)`);
      }
    }
    
    console.log('Final submission status map:', statusMap);
    setSubmissionStatus(statusMap);
  };

  // Load submission status when assignments are loaded
  useEffect(() => {
    if (assignments && assignments.length > 0) {
      loadSubmissionStatus();
    }
  }, [assignments]);

  // Handler for submit/edit button click
  const handleSubmitClick = (assignment: any) => {
    const status = submissionStatus[assignment.id];
    console.log(`Button clicked for assignment ${assignment.id}, status:`, status);
    console.log('Current submission status map:', submissionStatus);
    
    if (status === 'submitted' || status === 'graded') {
      // If already submitted, navigate to edit page
      console.log('Navigating to edit page...');
      navigate(`/courses/${courseId}/assignments/${assignment.id}/submit`, {
        state: { 
          assignment: assignment,
          isEditing: true
        }
      });
    } else {
      // If not submitted yet, open upload popup
      console.log('Opening upload popup...');
      setSelectedAssignmentForUpload(assignment);
      setIsUploadPopupOpen(true);
    }
  };

  // Handler for closing upload popup
  const handleCloseUploadPopup = () => {
    setIsUploadPopupOpen(false);
    setSelectedAssignmentForUpload(null);
  };

  // Handler for successful upload
  const handleUploadSuccess = (file: File) => {
    // Navigate to submission page with assignment data
    navigate(`/courses/${courseId}/assignments/${selectedAssignmentForUpload.id}/submit`, {
      state: { 
        assignment: selectedAssignmentForUpload,
        uploadedFile: file
      }
    });
  };

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
      templateColumns={{
        base: "1fr",
        md: "300px 1fr",
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

      <GridItem area="main">
        <Box bg={bgColor} minH="100vh" p={{ base: 4, md: 6 }}>
          <VStack align="stretch" gap={6}>
          {/* Page Header */}
            <Box>
              <HStack align='center' gap={3} mb={2}>
                <Heading size="xl" color={textColor} fontWeight="bold">
                    تکالیف {course.title}
                </Heading>
                <Box height="20px" width="1px" bg={subtleText} />
                <Text color={subtleText} fontSize="lg">
                  {convertEnglishTermToPersian(course.term)} {course.year}
                </Text>
              </HStack>
              <Text color={subtleText} fontSize="sm">
                شماره درس: {course.courseCode}
              </Text>
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
                         تکالیف
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
                        نمره کل
                      </Box>
                      <Box as="th" p={3} textAlign="center" color={textColor} fontWeight="semibold">وضعیت</Box>
                      <Box as="th" p={3} textAlign="center" color={textColor} fontWeight="semibold">زمان باقی‌مانده</Box>
                      <Box as="th" p={3} textAlign="center" color={textColor} fontWeight="semibold">وضعیت ارسال</Box>
                      <Box as="th" p={3} textAlign="center" color={textColor} fontWeight="semibold">ارسال پاسخ</Box>
                      <Box as="th" p={3} textAlign="center" color={textColor} fontWeight="semibold">نمره دریافتی</Box>
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
                            <Text color={subtleText} fontSize="md">هیچ تکلیفی یافت نشد.</Text>
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
                            <Button
                              variant="ghost"
                              color={textColor}
                              fontWeight="medium"
                              p={0}
                              h="auto"
                              textAlign="left"
                              textDecoration="underline"
                              onClick={() => handleAssignmentClick(assignment)}
                              _hover={{ color: "blue.500", textDecoration: "underline" }}
                            >
                              {assignment.title}
                            </Button>
                          </Box>
                          <Box as="td" p={3} color={subtleText}>
                            {new Date(assignment.created_at).toLocaleDateString('fa-IR')}
                          </Box>
                          <Box as="td" p={3} color={subtleText}>
                            {assignment.due_at ? new Date(assignment.due_at).toLocaleDateString('fa-IR') : 'تعیین نشده'}
                          </Box>
                          <Box as="td" p={3} color={textColor}>
                            {assignment.total_points}
                        </Box>
                          <Box as="td" p={3} textAlign="center">
                            <Box
                              w="24px"
                              h="24px"
                              borderRadius="full"
                              bg={assignment.is_published ? "green.500" : "gray.300"}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              mx="auto"
                            />
                          </Box>
                          <Box as="td" p={3} textAlign="center">
                            {assignment.due_at ? (() => {
                              const now = new Date();
                              const dueDate = new Date(assignment.due_at);
                              const timeDiff = dueDate.getTime() - now.getTime();
                              const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                              
                              if (daysDiff < 0) {
                                return (
                                  <VStack align="center" gap={1}>
                                    <Box
                                      width="200px"
                                      height="12px"
                                      bg="gray.200"
                                      borderRadius="md"
                                      position="relative"
                                      overflow="hidden"
                                    >
                                      <Box
                                        width="100%"
                                        height="100%"
                                        bg="gray.500"
                                        borderRadius="md"
                                      />
                                    </Box>
                                    <Text fontSize="xs" color="gray.600">
                                      منقضی شده
                                    </Text>
                                  </VStack>
                                );
                              } else if (daysDiff <= 3) {
                                const progress = Math.max(0, Math.min(100, (3 - daysDiff) / 3 * 100));
                                return (
                                  <VStack align="center" gap={1}>
                                    <Box
                                      width="200px"
                                      height="12px"
                                      bg="red.100"
                                      borderRadius="md"
                                      position="relative"
                                      overflow="hidden"
                                    >
                                      <Box
                                        width={`${progress}%`}
                                        height="100%"
                                        bg="red.500"
                                        borderRadius="md"
                                      />
                                    </Box>
                                    <Text fontSize="xs" color="red.600">
                                      {daysDiff} روز باقی‌مانده
                                    </Text>
                                  </VStack>
                                );
                              } else if (daysDiff <= 7) {
                                const progress = Math.max(0, Math.min(100, (7 - daysDiff) / 7 * 100));
                                return (
                                  <VStack align="center" gap={1}>
                                    <Box
                                      width="200px"
                                      height="12px"
                                      bg="orange.100"
                                      borderRadius="md"
                                      position="relative"
                                      overflow="hidden"
                                    >
                                      <Box
                                        width={`${progress}%`}
                                        height="100%"
                                        bg="orange.500"
                                        borderRadius="md"
                                      />
                                    </Box>
                                    <Text fontSize="xs" color="orange.600">
                                      {daysDiff} روز باقی‌مانده
                                    </Text>
                                  </VStack>
                                );
                              } else {
                                return (
                                  <VStack align="center" gap={1}>
                                    <Box
                                      width="200px"
                                      height="12px"
                                      bg="blue.100"
                                      borderRadius="md"
                                      position="relative"
                                      overflow="hidden"
                                    >
                                      <Box
                                        width="15%"
                                        height="100%"
                                        bg="blue.500"
                                        borderRadius="md"
                                      />
                                    </Box>
                                    <Text fontSize="xs" color="blue.600">
                                      {daysDiff} روز باقی‌مانده
                                    </Text>
                                  </VStack>
                                );
                              }
                            })() : (
                              <Text fontSize="xs" color="gray.500">
                                بدون مهلت
                            </Text>
                            )}
                        </Box>
                          <Box as="td" p={3} textAlign="center">
                            <Text 
                              fontSize="sm" 
                              fontWeight="medium"
                              color={
                                submissionStatus[assignment.id] === 'graded' ? 'green.600' :
                                submissionStatus[assignment.id] === 'submitted' ? 'blue.600' :
                                'gray.500'
                              }
                            >
                              {submissionStatus[assignment.id] === 'graded' ? 'تصحیح شده' :
                               submissionStatus[assignment.id] === 'submitted' ? 'ارسال شده' :
                               'ارسال نشده'}
                            </Text>
                          </Box>
                          <Box as="td" p={3} textAlign="center">
                            <Button
                              size="sm"
                              paddingX={2}
                bg="blue.500"
                color="white"
                _hover={{ bg: "blue.600" }}
                              variant="outline"
                              onClick={() => handleSubmitClick(assignment)}
                            >
                              <Icon as={FiUpload} mr={1} />
                              {(() => {
                                const status = submissionStatus[assignment.id];
                                const buttonText = status === 'submitted' || status === 'graded' ? 'ویرایش' : 'ارسال';
                                console.log(`Assignment ${assignment.id} button text: ${buttonText} (status: ${status})`);
                                return buttonText;
                              })()}
                            </Button>
                          </Box>
                          <Box as="td" p={3} textAlign="center" color={textColor}>
                            <HStack justify="center" gap={1}>
                              <Icon as={FiFile} color="gray.500" />
                              <Text fontSize="sm">
                                - / {assignment.total_points}
                              </Text>
                          </HStack>
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

      {/* Template Download Popup */}
      <AssignmentTemplatePopup
        isOpen={isTemplatePopupOpen}
        onClose={handleCloseTemplatePopup}
        assignmentTitle={selectedAssignment?.title || ''}
        templateUrl={selectedAssignment?.templateUrl}
      />

      {/* Upload Popup */}
      <StudentUploadPopup
        isOpen={isUploadPopupOpen}
        onClose={handleCloseUploadPopup}
        assignmentTitle={selectedAssignmentForUpload?.title || ''}
        assignmentId={selectedAssignmentForUpload?.id || 0}
        onUploadSuccess={handleUploadSuccess}
      />
    </Grid>
  );
};

export default StudentAssignmentsPage;

