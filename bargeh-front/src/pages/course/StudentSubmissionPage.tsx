import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Grid,
  GridItem,
  VStack,
  Text,
  Spinner,
  HStack,
  Button,
  Icon,
} from '@chakra-ui/react';
import { useColorModeValue } from '@/hooks/useColorMode';
import DynamicSidebar from '@/components/DynamicSidebar';
import SubmissionPDFViewer from '@/components/SubmissionPDFViewer';
import { questionService, type Question } from '@/services/questionService';
import { api } from '@/services/api';
import { FiArrowRight, FiUpload } from 'react-icons/fi';
import StudentUploadPopup from '@/components/StudentUploadPopup';

interface Assignment {
  id: number;
  title: string;
  template_pdf?: string;
  total_points: number;
  due_at?: string;
}

interface Submission {
  id: number;
  student_name: string;
  uploaded_by_name: string;
  created_at: string;
  num_pages: number;
  file: string;
}

interface SubmissionOutline {
  question_id: number;
  page_numbers: number[];
}

const StudentSubmissionPage = () => {
  const { courseId, assignmentId } = useParams<{ 
    courseId: string; 
    assignmentId: string; 
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get assignment data and uploaded file from location state
  const assignment = location.state?.assignment as Assignment;
  const uploadedFile = location.state?.uploadedFile as File;
  const isEditing = location.state?.isEditing as boolean;
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissionOutline, setSubmissionOutline] = useState<SubmissionOutline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionFile, setSubmissionFile] = useState<string>('');
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
  const [isChangeFilePopupOpen, setIsChangeFilePopupOpen] = useState(false);

  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");

  // Cleanup uploaded file URL on unmount
  useEffect(() => {
    return () => {
      if (uploadedFile && submissionFile && submissionFile.startsWith('blob:')) {
        URL.revokeObjectURL(submissionFile);
      }
    };
  }, [uploadedFile, submissionFile]);

  // Load questions and existing submission
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load assignment questions
        const questionsResponse = await questionService.getQuestions(parseInt(assignmentId!));
        console.log('Questions response:', questionsResponse);
        
        if (questionsResponse && Array.isArray(questionsResponse)) {
          setQuestions(questionsResponse);

          // Initialize submission outline with default page numbers
          const initialOutline = questionsResponse
            .filter(question => question.id !== undefined)
            .map(question => ({
              question_id: question.id!,
              page_numbers: question.default_page_numbers || []
            }));
          setSubmissionOutline(initialOutline);
        } else {
          console.warn('No questions found for assignment:', assignmentId);
          setQuestions([]);
          setSubmissionOutline([]);
        }

        // Handle uploaded file from navigation state or existing submission
        if (uploadedFile && !isEditing) {
          // New submission with uploaded file
          console.log('Using uploaded file:', uploadedFile);
          const fileUrl = URL.createObjectURL(uploadedFile);
          setSubmissionFile(fileUrl);
          console.log('Uploaded file URL:', fileUrl);
        } else {
          // Check for existing submission (for editing mode or when no uploaded file)
          try {
            const studentSubmission = await api.get(`/api/assignments/${assignmentId}/submissions/student/`) as any;
            console.log('Student submission data:', studentSubmission);
            
            if (studentSubmission) {
              setExistingSubmission(studentSubmission);
              
              // Load existing submission file
              if (studentSubmission.file) {
                const fileUrl = studentSubmission.file.startsWith('http') 
                  ? studentSubmission.file 
                  : `http://localhost:8000${studentSubmission.file}`;
                setSubmissionFile(fileUrl);
                console.log('Existing submission file URL:', fileUrl);
              } else {
                console.warn('No file found in submission:', studentSubmission);
              }

              // Load existing submission outline if it exists
              try {
                const submissionDetailsResponse = await api.get(`/api/assignments/submissions/${studentSubmission.id}/`);
                console.log('Submission details response:', submissionDetailsResponse);
                
                const pageMap = (submissionDetailsResponse as any).page_map || {};
                console.log('Existing page map:', pageMap);
                
                // Convert page map to submission outline format
                const existingOutline = questionsResponse
                  .filter(question => question.id !== undefined)
                  .map(question => ({
                    question_id: question.id!,
                    page_numbers: pageMap[question.id!] || question.default_page_numbers || []
                  }));
                
                console.log('Converted existing outline:', existingOutline);
                setSubmissionOutline(existingOutline);
              } catch (err) {
                console.warn('Could not load existing page map:', err);
                // Continue with default outline if loading fails
              }
            }
          } catch (err) {
            console.warn('No existing submission found:', err);
            // This is normal for new submissions
          }
        }

      } catch (err: any) {
        console.error('Error loading data:', err);
        setError('خطا در بارگذاری اطلاعات');
      } finally {
        setIsLoading(false);
      }
    };

    if (assignmentId) {
      loadData();
    }
  }, [assignmentId]);

  const saveSubmissionOutline = async () => {
    if (!assignmentId) return;

    setIsSaving(true);
    try {
      console.log('Saving submission outline:', submissionOutline);
      
      // Convert submission outline to page map format
      const pageMap = submissionOutline.reduce((acc, item) => {
        acc[item.question_id] = item.page_numbers;
        return acc;
      }, {} as Record<number, number[]>);
      
      console.log('Page map to save:', pageMap);
      
      if (existingSubmission) {
        // Update existing submission
        const response = await api.put(`/api/assignments/submissions/${existingSubmission.id}/page-map/`, {
          page_map: pageMap
        });
        console.log('Update response:', response);
      } else {
        // Create new submission (this would typically be done after file upload)
        console.log('No existing submission to update');
      }

      alert("طرح کلی ارسال با موفقیت ذخیره شد");

      // Navigate back to assignments page
      navigate(`/courses/${courseId}/assignments`);

    } catch (err: any) {
      console.error('Error saving submission outline:', err);
      console.error('Error details:', err.response?.data);
      alert("خطا در ذخیره طرح کلی ارسال: " + (err.response?.data?.error || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const skipOutline = () => {
    navigate(`/courses/${courseId}/assignments`);
  };

  // Handler for changing uploaded file
  const handleChangeFile = () => {
    setIsChangeFilePopupOpen(true);
  };

  const handleCloseChangeFilePopup = () => {
    setIsChangeFilePopupOpen(false);
  };

  const handleFileChangeSuccess = async (file: File) => {
    try {
      // Update the submission file with the new file
      const fileUrl = URL.createObjectURL(file);
      setSubmissionFile(fileUrl);
      console.log('File changed successfully:', fileUrl);
      
      // If we have an existing submission, update it on the server
      if (existingSubmission && assignmentId) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Update the submission file on the server
        await api.put(`/api/assignments/${assignmentId}/submissions/student/upload/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log('File updated on server successfully');
      }
      
      setIsChangeFilePopupOpen(false);
    } catch (error: any) {
      console.error('Error updating file:', error);
      alert('خطا در تغییر فایل: ' + (error.response?.data?.error || error.message));
    }
  };

  if (isLoading) {
    return (
      <Grid
        templateAreas={{ base: `"main"`, md: `"aside main"` }}
        templateColumns={{ base: "1fr", md: "300px 1fr" }}
        minH="100vh"
        gap={0}
      >
        <GridItem area="aside" display={{ base: "none", md: "block" }}>
          <DynamicSidebar />
        </GridItem>
        <GridItem area="main" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
          <VStack>
            <Spinner size="lg" color="blue.500" />
            <Text color={textColor}>در حال بارگذاری...</Text>
          </VStack>
        </GridItem>
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid
        templateAreas={{ base: `"main"`, md: `"aside main"` }}
        templateColumns={{ base: "1fr", md: "300px 1fr" }}
        minH="100vh"
        gap={0}
      >
        <GridItem area="aside" display={{ base: "none", md: "block" }}>
          <DynamicSidebar />
        </GridItem>
        <GridItem area="main" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
          <Text color="red.500">{error}</Text>
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
        <DynamicSidebar
          courseTitle={assignment?.title || 'تکلیف'}
          courseSubtitle={`${assignment?.due_at ? new Date(assignment.due_at).toLocaleDateString('fa-IR') : 'بدون مهلت'}`}
          courseCode={assignment?.id?.toString() || ''}
          instructor="استاد"
          courseId={courseId}
        />
      </GridItem>

      {/* Main Content */}
      <GridItem 
        area="main" 
        bg={useColorModeValue("gray.50", "gray.900")}
        position="relative"
      >
        <VStack align="stretch" h="100vh" p={6} gap={0}>
          {/* Header */}
          <Box 
            bg={useColorModeValue("white", "gray.800")} 
            p={6} 
            borderRadius="lg" 
            boxShadow="sm"
            border="1px solid"
            borderColor={useColorModeValue("gray.200", "gray.600")}
            mb={6}
          >
            <HStack justify="space-between" align="center" mb={3}>
              <VStack align="start" gap={2}>
                <HStack align="center" gap={3}>
                  <Box
                    p={2}
                    borderRadius="md"
                    bg={useColorModeValue("blue.50", "blue.900")}
                    color={useColorModeValue("blue.600", "blue.300")}
                  >
                    <Icon as={FiUpload} boxSize={5} />
                  </Box>
                  <VStack align="start" gap={0}>
                    <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                      {isEditing ? 'ویرایش ارسال' : 'ارسال تکلیف'}
                    </Text>
                    <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")}>
                      {existingSubmission ? 'ویرایش ارسال موجود' : 'ارسال جدید'}
                    </Text>
                  </VStack>
                </HStack>
                <Text fontSize="lg" color={useColorModeValue("gray.700", "gray.300")} fontWeight="medium">
                  {assignment?.title || 'تکلیف'}
                </Text>
              </VStack>
              <HStack gap={3}>
                {isEditing && (
                                  <Button
                                      paddingLeft={2}
                    size="md"
                    bg= 'blue.500'
                    variant="solid"
                    onClick={handleChangeFile}
                    _hover={{
                      transform: "translateY(-1px)",
                      boxShadow: "md"
                    }}
                    transition="all 0.2s"
                  >
                    <Icon as={FiUpload} mr={2} />
                    تغییر فایل
                  </Button>
                )}
                              <Button
                                  paddingLeft={2}
                  size="md"
                  variant="outline"
                  colorScheme="gray"
                  onClick={() => navigate(`/courses/${courseId}/assignments`)}
                  _hover={{
                    transform: "translateY(-1px)",
                    boxShadow: "md"
                  }}
                  transition="all 0.2s"
                >
                  <Icon as={FiArrowRight} mr={2} />
                  بازگشت
                </Button>
              </HStack>
            </HStack>
          </Box>

          {/* PDF Viewer with Page Selection */}
          <Box 
            flex="1" 
            bg={useColorModeValue("white", "gray.800")} 
            borderRadius="lg" 
            boxShadow="sm" 
            border="1px solid"
            borderColor={useColorModeValue("gray.200", "gray.600")}
            overflow="hidden"
          >
            <SubmissionPDFViewer
              pdfUrl={submissionFile}
              questions={questions.filter(q => q.id !== undefined) as Array<Question & { id: number }>}
              submissionOutline={submissionOutline}
              onOutlineChange={setSubmissionOutline}
              onSave={saveSubmissionOutline}
              onCancel={skipOutline}
              isSaving={isSaving}
              numPages={existingSubmission?.num_pages || 0}
              submissionId={existingSubmission?.id}
            />
          </Box>
        </VStack>
      </GridItem>

      {/* Change File Popup */}
      {isChangeFilePopupOpen && (
        <StudentUploadPopup
          isOpen={isChangeFilePopupOpen}
          onClose={handleCloseChangeFilePopup}
          assignmentTitle={assignment?.title || 'تکلیف'}
          assignmentId={parseInt(assignmentId!)}
          onUploadSuccess={handleFileChangeSuccess}
          isUpdating={true}
        />
      )}
    </Grid>
  );
};

export default StudentSubmissionPage;
