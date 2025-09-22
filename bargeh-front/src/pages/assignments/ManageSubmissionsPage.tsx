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
  Input,
} from '@chakra-ui/react';
import { FiUpload, FiChevronDown, FiChevronUp, FiArrowLeft, FiTrash2, FiEdit3 } from 'react-icons/fi';
import { useColorModeValue } from '@/hooks/useColorMode';
import { useAssignment } from '@/hooks/useAssignment';
import { useRoster } from '@/hooks/useRoster';
import DynamicSidebar from '@/components/DynamicSidebar';
import UploadSubmissionModal from '@/components/UploadSubmissionPopup';
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
  grading_progress: number;
  total_questions: number;
  graded_questions: number;
}

interface UpdateFileModalProps {
  onSubmit: (file: File) => void;
  onCancel: () => void;
  isUploading: boolean;
}

const UpdateFileModal: React.FC<UpdateFileModalProps> = ({ onSubmit, onCancel, isUploading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('لطفاً فقط فایل‌های PDF انتخاب کنید');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onSubmit(selectedFile);
    }
  };

  return (
    <VStack align="stretch" gap={4}>
      <Box
        border="2px dashed"
        borderColor={dragActive ? "blue.400" : "gray.300"}
        borderRadius="md"
        p={6}
        textAlign="center"
        bg={dragActive ? "blue.50" : "gray.50"}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        cursor="pointer"
        _hover={{ borderColor: "blue.400", bg: "blue.50" }}
      >
        <VStack gap={2}>
          <Icon as={FiUpload} boxSize={8} color="gray.500" />
          <Text fontSize="sm" color="gray.600">
            فایل PDF را اینجا بکشید یا کلیک کنید
          </Text>
          <Input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            display="none"
            id="file-upload"
          />
          <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
            <Button
              size="sm"
              variant="outline"
              pointerEvents="none"
            >
              انتخاب فایل
            </Button>
          </label>
        </VStack>
      </Box>

      {selectedFile && (
        <Box p={3} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
          <Text fontSize="sm" color="green.700">
            فایل انتخاب شده: {selectedFile.name}
          </Text>
          <Text fontSize="xs" color="green.600">
            حجم: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </Text>
        </Box>
      )}

      <HStack justify="center" gap={3} mt={4}>
        <Button
          paddingX={4}
          variant="outline"
          onClick={onCancel}
          disabled={isUploading}
        >
          انصراف
        </Button>
        <Button
          paddingX={4}
          colorScheme="blue"
          onClick={handleSubmit}
          loading={isUploading}
          loadingText="در حال آپلود..."
          disabled={!selectedFile}
        >
          به‌روزرسانی فایل
        </Button>
      </HStack>
    </VStack>
  );
};


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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<{ id: number; student_name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [submissionToUpdate, setSubmissionToUpdate] = useState<{ id: number; student_name: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

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
      console.log('Full API response:', response);
      console.log('Response data:', (response as any).data);
      
      // The response structure is directly {results: Array, count: number}
      // Not nested under a 'data' property
      const submissionsData = (response as any).data || response;
      const results = submissionsData?.results || [];
      
      console.log('Submissions results:', results);
      console.log('Submissions count:', submissionsData?.count);
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
          num_pages: 5,
          grading_progress: 0,
          total_questions: 0,
          graded_questions: 0
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

  const handleDeleteSubmission = (submission: Submission) => {
    setSubmissionToDelete({
      id: submission.id,
      student_name: submission.student_name || 'نامشخص'
    });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!submissionToDelete) return;

    setIsDeleting(true);
    try {
      console.log('Deleting submission:', submissionToDelete.id);
      
      await api.delete(`/api/assignments/submissions/${submissionToDelete.id}/delete/`);
      
      console.log('Submission deleted successfully');
      alert('ارسال با موفقیت حذف شد');
      
      // Reload submissions
      await loadData();
      
      // Close modal
      setShowDeleteModal(false);
      setSubmissionToDelete(null);
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('خطا در حذف ارسال: ' + (error as any).response?.data?.error || (error as any).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateSubmission = (submission: Submission) => {
    setSubmissionToUpdate({
      id: submission.id,
      student_name: submission.student_name || 'نامشخص'
    });
    setShowUpdateModal(true);
  };

  const handleConfirmUpdate = async (file: File) => {
    if (!submissionToUpdate) return;

    setIsUpdating(true);
    try {
      console.log('Updating submission:', submissionToUpdate.id);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.put(`/api/assignments/submissions/${submissionToUpdate.id}/update-file/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Update response:', response);
      console.log('Submission updated successfully');
      alert('فایل ارسال با موفقیت به‌روزرسانی شد');
      
      // Reload submissions
      await loadData();
      
      // Close modal
      setShowUpdateModal(false);
      setSubmissionToUpdate(null);
    } catch (error) {
      console.error('Error updating submission:', error);
      alert('خطا در به‌روزرسانی فایل ارسال: ' + (error as any).response?.data?.error || (error as any).message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleModalUpload = async (studentId: number | null, file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('files', file);
      if (studentId) {
        formData.append('student_ids', studentId.toString()); // Backend expects 'student_ids' (plural)
        console.log('Uploading for student ID:', studentId);
      } else {
        console.log('No student ID provided - uploading as unassigned');
      }

      console.log('Uploading to:', `/api/assignments/${assignmentId}/submissions/upload/`);
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
      const response = await api.post(`/api/assignments/${assignmentId}/submissions/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', response);
      
      // Get the uploaded submission data - response structure is {message, submissions: [submission]}
      const responseData = (response as any).data || response;
      console.log('Response data:', responseData);
      const uploadedSubmission = responseData.submissions?.[0];
      console.log('Uploaded submission:', uploadedSubmission);
      
      if (uploadedSubmission) {
        console.log('Navigating to submission outline page...');
        // Navigate to submission outline page
        navigate(`/courses/${courseId}/assignments/${assignmentId}/submissions/${uploadedSubmission.id}/outline`, {
          state: { submission: uploadedSubmission }
        });
      } else {
        console.log('No submission data found, reloading submissions...');
        alert('فایل با موفقیت آپلود شد');
        // Reload submissions
        await loadData();
      }
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
                      <Box as="th" p={3} textAlign="center" color={textColor} fontWeight="semibold">
                        عملیات
                      </Box>
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {isLoading ? (
                      <Box as="tr">
                        <Box as="td" p={6} textAlign="center" {...{ colSpan: 4 }}>
                          <VStack>
                            <Spinner size="md" color="blue.500" />
                            <Text color={textColor}>در حال بارگذاری ارسال‌ها...</Text>
                          </VStack>
                        </Box>
                      </Box>
                    ) : !submissions || submissions.length === 0 ? (
                      <Box as="tr">
                        <Box as="td" p={6} textAlign="center" {...{ colSpan: 4 }}>
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
                          <Box as="td" p={3}>
                            <Text
                              as="button"
                              color="blue.500"
                              fontWeight="medium"
                              textAlign="right"
                              cursor="pointer"
                              textDecoration="underline"
                              _hover={{ 
                                color: "blue.700",
                                textDecoration: "underline"
                              }}
                              onClick={() => {
                                navigate(`/courses/${courseId}/assignments/${assignmentId}/submissions/${submission.id}/outline`, {
                                  state: { submission }
                                });
                              }}
                            >
                              {submission.student_name || 'نامشخص'}
                            </Text>
                          </Box>
                          <Box as="td" p={3} color={subtleText}>
                            {new Date(submission.created_at).toLocaleDateString('fa-IR')}
                          </Box>
                          <Box as="td" p={3}>
                            <VStack align="start" gap={1}>
                              <Box
                                width="150px"
                                height="10px"
                                bg={progressBg}
                                borderRadius="md"
                                position="relative"
                                overflow="hidden"
                              >
                                <Box
                                  width={`${submission.grading_progress}%`}
                                  height="100%"
                                  bg={submission.grading_progress === 100 ? "green.500" : submission.grading_progress > 0 ? "blue.500" : "gray.500"}
                                  borderRadius="md"
                                />
                              </Box>
                              <Text fontSize="xs" color={subtleText}>
                                {submission.graded_questions}/{submission.total_questions} ({submission.grading_progress}%)
                              </Text>
                            </VStack>
                          </Box>
                          <Box as="td" p={3} textAlign="center">
                            <HStack gap={2} justify="center">
                              <Button
                                size="sm"
                                variant="outline"
                                colorScheme="blue"
                                onClick={() => handleUpdateSubmission(submission)}
                                title="به‌روزرسانی فایل"
                              >
                                <Icon as={FiEdit3} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                colorScheme="red"
                                onClick={() => handleDeleteSubmission(submission)}
                                title="حذف ارسال"
                              >
                                <Icon as={FiTrash2} />
                              </Button>
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
              آپلود تکلیف
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && submissionToDelete && (
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
            bg={bgColor}
            borderRadius="lg"
            p={6}
            maxW="400px"
            w="90%"
            boxShadow="xl"
          >
            <VStack align="stretch" gap={4}>
              <Text fontSize="lg" fontWeight="bold" color={textColor} textAlign="center">
                حذف ارسال
              </Text>
              <Text fontSize="sm" color="red.500" textAlign="center">
                آیا مطمئن هستید که می‌خواهید ارسال "{submissionToDelete.student_name}" را حذف کنید؟
              </Text>
              <Text fontSize="xs" color={subtleText} textAlign="center">
                این عمل قابل بازگشت نیست.
              </Text>
              <HStack justify="center" gap={3} mt={4}>
                <Button
                  paddingX={2}
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSubmissionToDelete(null);
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

      {/* Update File Modal */}
      {showUpdateModal && submissionToUpdate && (
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
            bg={bgColor}
            borderRadius="lg"
            p={6}
            maxW="500px"
            w="90%"
            boxShadow="xl"
          >
            <VStack align="stretch" gap={4}>
              <Text fontSize="lg" fontWeight="bold" color={textColor} textAlign="center">
                به‌روزرسانی فایل ارسال
              </Text>
              <Text fontSize="sm" color={textColor} textAlign="center">
                فایل جدید برای ارسال "{submissionToUpdate.student_name}" را انتخاب کنید
              </Text>
              
              <UpdateFileModal
                onSubmit={handleConfirmUpdate}
                onCancel={() => {
                  setShowUpdateModal(false);
                  setSubmissionToUpdate(null);
                }}
                isUploading={isUpdating}
              />
            </VStack>
          </Box>
        </Box>
      )}
    </Grid>
  );
};

export default ManageSubmissionsPage;
