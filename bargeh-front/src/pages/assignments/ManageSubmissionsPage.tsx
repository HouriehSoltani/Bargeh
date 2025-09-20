import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  GridItem,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Heading,
  Spinner,
} from '@chakra-ui/react';
import { FiUpload, FiChevronDown, FiChevronUp, FiArrowLeft } from 'react-icons/fi';
import { useColorModeValue } from '@/hooks/useColorMode';
import { useAssignment } from '@/hooks/useAssignment';
import { useRoster } from '@/hooks/useRoster';
import DynamicSidebar from '@/components/DynamicSidebar';
import UploadSubmissionModal from '@/components/UploadSubmissionModal';
import { api } from '@/services/api';

interface Submission {
  id: number;
  assignment: number;
  student: number | null;
  student_name: string;
  uploaded_by: number | null;
  uploaded_by_name: string;
  file: string;
  num_pages: number;
  created_at: string;
  mapping_status: 'complete' | 'incomplete';
}


const ManageSubmissionsPage = () => {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>();
  const navigate = useNavigate();

  // Fetch assignment data
  const { assignment, isLoading: assignmentLoading, error: assignmentError } = useAssignment(assignmentId);
  
  // Fetch roster data
  const { roster, isLoading: rosterLoading, error: rosterError } = useRoster(courseId);

  // State
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");
  const subtleText = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.800");
  const tableRowHover = useColorModeValue("gray.50", "gray.800");
  const progressBg = useColorModeValue("gray.200", "gray.600");

  // Load data on mount
  useEffect(() => {
    if (assignmentId) {
      loadData();
    }
  }, [assignmentId]);

  // Transform roster data for the modal
  const students = roster
    .filter(member => member.role === 'student')
    .map(member => ({
      id: member.user.id,
      name: member.user.name || `${member.user.first_name || ''} ${member.user.last_name || ''}`.trim(),
      email: member.user.email
    }));

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('Loading submissions for assignment:', assignmentId);
      const response = await api.get(`/api/assignments/${assignmentId}/submissions/`);
      const submissionsData = (response as any).data;
      console.log('Submissions API response:', response);
      console.log('Submissions data:', submissionsData);
      console.log('Submissions results:', submissionsData?.results);
      console.log('Submissions count:', submissionsData?.count);
      
      // For testing - add a mock submission if none exist
      const results = submissionsData?.results || [];
      if (results.length === 0) {
        console.log('No submissions found, adding mock data for testing');
        const mockSubmission: Submission = {
          id: 1,
          assignment: parseInt(assignmentId || '0'),
          student: null,
          uploaded_by: null,
          uploaded_by_name: 'تست',
          student_name: 'دانشجوی تست',
          created_at: new Date().toISOString(),
          mapping_status: 'incomplete',
          file: '/media/test.pdf',
          num_pages: 5
        };
        setSubmissions([mockSubmission]);
      } else {
        setSubmissions(results);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      console.error('Error details:', error);
      alert(`خطا در بارگذاری اطلاعات: ${error}`);
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalUpload = async (studentId: number | null, file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('files', file);
      if (studentId) {
        formData.append('student_id', studentId.toString());
      }

      console.log('Uploading to:', `/api/assignments/${assignmentId}/submissions/upload/`);
      const response = await api.post(`/api/assignments/${assignmentId}/submissions/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', response);
      alert('فایل با موفقیت آپلود شد');

      // Reload submissions
      await loadData();
      
      // Navigate to question specification page
      navigate(`/courses/${courseId}/assignments/${assignmentId}/questions`);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert("خطا در آپلود فایل");
    } finally {
      setIsUploading(false);
    }
  };


  // Show loading state
  if (assignmentLoading || rosterLoading || isLoading) {
    return (
      <Grid
        templateAreas={{ base: `"main"`, md: `"aside main"` }}
        templateColumns={{ base: "1fr", md: "300px 1fr" }}
        minH="100vh"
        gap={0}
      >
        <GridItem area="aside">
          <DynamicSidebar />
        </GridItem>
        <GridItem area="main" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
          <VStack>
            <Spinner size="xl" />
            <Text color={textColor}>در حال بارگذاری...</Text>
          </VStack>
        </GridItem>
      </Grid>
    );
  }

  // Show error state
  if (assignmentError || rosterError) {
    return (
      <Grid
        templateAreas={{ base: `"main"`, md: `"aside main"` }}
        templateColumns={{ base: "1fr", md: "300px 1fr" }}
        minH="100vh"
        gap={0}
      >
        <GridItem area="aside">
          <DynamicSidebar />
        </GridItem>
        <GridItem area="main" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
          <Box p={4} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md">
            <Text color="red.700" fontWeight="bold">خطا!</Text>
            <Text color="red.600">{assignmentError || rosterError}</Text>
          </Box>
        </GridItem>
      </Grid>
    );
  }

  return (
    <Grid
      templateAreas={{ base: `"main"`, md: `"aside main"` }}
      templateColumns={{ base: "1fr", md: "300px 1fr" }}
      minH="100vh"
      gap={0}
    >
      {/* Left Sidebar */}
      <GridItem area="aside" display={{ base: "none", md: "block" }}>
        <DynamicSidebar />
      </GridItem>

      {/* Main Content */}
      <GridItem area="main">
        <Box bg={bgColor} minH="100vh" p={{ base: 4, md: 6 }}>
          <VStack align="stretch" gap={6}>
            {/* Header */}
            <Box>
              <HStack align='center' gap={3} mb={2}>
                <Heading size="xl" color={textColor} fontWeight="bold">
                  مدیریت ارسال‌ها
                </Heading>
                <Box height="20px" width="1px" bg="gray.400" />
                <Text color="gray.600" fontSize="lg">
                  {assignment?.title}
                </Text>
              </HStack>
            </Box>

            {/* Submissions Table */}
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
                        نام دانشجو
                      </Box>
                      <Box as="th" p={3} textAlign="right" color={textColor} fontWeight="semibold">
                        <HStack gap={1}>
                          <Text>تاریخ ارسال</Text>
                          <Icon as={FiChevronDown} boxSize={3} />
                        </HStack>
                      </Box>
                      <Box as="th" p={3} textAlign="right" color={textColor} fontWeight="semibold">
                        <HStack gap={1}>
                          <Text>درصد نمره‌دهی</Text>
                          <Icon as={FiChevronUp} boxSize={3} />
                        </HStack>
                      </Box>
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {isLoading ? (
                      <Box as="tr">
                        <Box as="td" p={6} textAlign="center" {...{ colSpan: 3 }}>
                          <VStack>
                            <Spinner size="md" color="blue.500" />
                            <Text color={textColor}>در حال بارگذاری ارسال‌ها...</Text>
                          </VStack>
                        </Box>
                      </Box>
                    ) : !submissions || submissions.length === 0 ? (
                      <Box as="tr">
                        <Box as="td" p={6} textAlign="center" {...{ colSpan: 3 }}>
                          <VStack>
                            <Text color={subtleText} fontSize="md">هیچ ارسالی یافت نشد.</Text>
                            <Text fontSize="xs" color="gray.300" mt={2}>
                              Debug: submissions = {JSON.stringify(submissions)}
                            </Text>
                          </VStack>
                        </Box>
                      </Box>
                    ) : (
                      (submissions || []).map((submission) => (
                        <Box 
                          key={submission.id}
                          as="tr" 
                          borderBottom="1px" 
                          borderColor={borderColor}
                          _hover={{ bg: tableRowHover }}
                        >
                          <Box as="td" p={3} color={textColor} fontWeight="medium">
                            {submission.student_name || 'نامشخص'}
                          </Box>
                          <Box as="td" p={3} color={subtleText}>
                            {new Date(submission.created_at).toLocaleDateString('fa-IR')}
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
                                  width={submission.mapping_status === 'complete' ? "100%" : "0%"}
                                  height="100%"
                                  bg={submission.mapping_status === 'complete' ? "green.500" : "gray.500"}
                                  borderRadius="md"
                                />
                              </Box>
                              <Text fontSize="xs" color={subtleText}>
                                {submission.mapping_status === 'complete' ? '۱۰۰٪' : '۰٪'}
                              </Text>
                            </VStack>
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
        <HStack justify="flex-end" mx="auto" px={{ base: 4, md: 6 }} gap={3}>
            <Button
              bg="#2E5BBA"
              color="white"
              size={{ base: "sm", md: "md" }}
              paddingLeft={2}
              _hover={{ bg: "#1E4A9A" }}
              fontSize={{ base: "xs", md: "sm" }}
              onClick={() => setShowUploadModal(true)}
              disabled={isUploading}
            >
              <Icon as={FiUpload} mr={2} />
              آپلود ارسال
            </Button>
          
          <Button
            bg="#2E5BBA"
            color="white"
            size={{ base: "sm", md: "md" }}
            paddingRight={2}
            _hover={{ bg: "#1E4A9A" }}
            fontSize={{ base: "xs", md: "sm" }}
            onClick={() => navigate(`/courses/${courseId}/assignments/${assignmentId}/grade`)}
          >
            نمره‌دهی 
            <Icon as={FiArrowLeft} ml={2} />
          </Button>
        </HStack>
      </Box>

      {/* Upload Submission Modal */}
      <UploadSubmissionModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleModalUpload}
        students={students}
        isUploading={isUploading}
      />
    </Grid>
  );
};

export default ManageSubmissionsPage;
