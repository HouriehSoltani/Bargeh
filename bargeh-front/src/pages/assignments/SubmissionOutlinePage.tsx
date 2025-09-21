import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Grid,
  GridItem,
  VStack,
  Text,
  Spinner,
} from '@chakra-ui/react';
import { useColorModeValue } from '@/hooks/useColorMode';
import DynamicSidebar from '@/components/DynamicSidebar';
import SubmissionPDFViewer from '@/components/SubmissionPDFViewer';
import { questionService, type Question } from '@/services/questionService';
import { api } from '@/services/api';

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

const SubmissionOutlinePage = () => {
  const { courseId, assignmentId, submissionId } = useParams<{ 
    courseId: string; 
    assignmentId: string; 
    submissionId: string; 
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get submission data from location state
  const submission = location.state?.submission as Submission;
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissionOutline, setSubmissionOutline] = useState<SubmissionOutline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionFile, setSubmissionFile] = useState<string>('');

  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");

  // Load questions and existing submission outline
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

        // Load submission file URL
        if (submission?.file) {
          const fileUrl = submission.file.startsWith('http') 
            ? submission.file 
            : `http://localhost:8000${submission.file}`;
          setSubmissionFile(fileUrl);
          console.log('Submission file URL:', fileUrl);
        }

        // Load existing submission outline if it exists
        if (submissionId) {
          try {
            const submissionDetailsResponse = await api.get(`/api/assignments/submissions/${submissionId}/`);
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
  }, [assignmentId, submissionId, submission]);


  const saveSubmissionOutline = async () => {
    if (!submissionId) return;

    setIsSaving(true);
    try {
      console.log('Saving submission outline:', submissionOutline);
      
      // Convert submission outline to page map format
      const pageMap = submissionOutline.reduce((acc, item) => {
        acc[item.question_id] = item.page_numbers;
        return acc;
      }, {} as Record<number, number[]>);
      
      console.log('Page map to save:', pageMap);
      
      // Save page mapping to backend
      const response = await api.put(`/api/assignments/submissions/${submissionId}/page-map/`, {
        page_map: pageMap
      });
      
      console.log('Save response:', response);

      alert("طرح کلی ارسال با موفقیت ذخیره شد");

      // Navigate back to submissions page
      navigate(`/courses/${courseId}/assignments/${assignmentId}/submissions`);
    } catch (err: any) {
      console.error('Error saving submission outline:', err);
      console.error('Error details:', err.response?.data);
      alert("خطا در ذخیره طرح کلی ارسال: " + (err.response?.data?.error || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const skipOutline = () => {
    navigate(`/courses/${courseId}/assignments/${assignmentId}/submissions`);
  };

  if (isLoading) {
    return (
      <Grid
        templateAreas={{ base: `"main"`, md: `"sidebar main"` }}
        templateColumns={{ base: "1fr", md: "300px 1fr" }}
        minH="100vh"
        gap={0}
      >
        <GridItem area="sidebar">
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
        templateAreas={{ base: `"main"`, md: `"sidebar main"` }}
        templateColumns={{ base: "1fr", md: "300px 1fr" }}
        minH="100vh"
        gap={0}
      >
        <GridItem area="sidebar">
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
      templateAreas={{ base: `"main"`, md: `"sidebar main"` }}
      templateColumns={{ base: "1fr", md: "300px 1fr" }}
      minH="100vh"
      gap={0}
    >
      {/* Left Sidebar */}
      <GridItem area="sidebar">
        <DynamicSidebar />
      </GridItem>

      {/* Main Content */}
      <GridItem area="main" bg={bgColor}>
        <VStack align="stretch" h="100vh" p={4}>
          {/* Header */}
          <VStack align="stretch" gap={2} mb={4}>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              تعیین صفحات سوالات
            </Text>
            <Text fontSize="lg" color="gray.600">
              برای ارسال: {submission?.student_name || 'نامشخص'}
            </Text>
            <Text fontSize="sm" color="gray.500">
              تعداد صفحات: {submission?.num_pages || 0}
            </Text>
          </VStack>

          {/* PDF Viewer with Page Selection */}
          <Box flex="1" bg="white" borderRadius="lg" boxShadow="sm" overflow="hidden">
            <SubmissionPDFViewer
              pdfUrl={submissionFile}
              questions={questions.filter(q => q.id !== undefined) as Array<Question & { id: number }>}
              submissionOutline={submissionOutline}
              onOutlineChange={setSubmissionOutline}
              onSave={saveSubmissionOutline}
              onCancel={skipOutline}
              isSaving={isSaving}
              numPages={submission?.num_pages || 0}
              submissionId={submission?.id}
            />
          </Box>
        </VStack>
      </GridItem>
    </Grid>
  );
};

export default SubmissionOutlinePage;
