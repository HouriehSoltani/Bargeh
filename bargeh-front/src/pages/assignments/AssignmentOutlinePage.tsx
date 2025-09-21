import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  GridItem,
  VStack,
  Text,
} from '@chakra-ui/react';
import { useColorModeValue } from '@/hooks/useColorMode';
import { useAssignment } from '@/hooks/useAssignment';
import DynamicSidebar from '@/components/DynamicSidebar';
import GradescopePDFViewer from '@/components/PDFViewer';
import { questionService } from '@/services/questionService';

interface Question {
  id: string;
  title: string;
  points: number;
  pageNumber?: number;
}

const AssignmentOutlinePage = () => {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>();
  const navigate = useNavigate();
  
  // Fetch assignment data
  const { assignment, isLoading: assignmentLoading, error: assignmentError } = useAssignment(assignmentId);
  
  // Debug: Log assignment data
  React.useEffect(() => {
    if (assignment) {
      console.log('Assignment data:', assignment);
      console.log('PDF URL:', assignment.template_pdf);
    }
  }, [assignment]);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");

  // Load existing questions when component mounts
  React.useEffect(() => {
    const loadQuestions = async () => {
      if (!assignmentId) return;
      
      setIsLoadingQuestions(true);
      try {
        console.log('Loading questions for assignment:', assignmentId);
        const existingQuestions = await questionService.getQuestions(parseInt(assignmentId));
        
        console.log('Loaded questions from backend:', existingQuestions);
        
        if (existingQuestions && Array.isArray(existingQuestions)) {
          // Convert backend questions to frontend format
          const frontendQuestions = existingQuestions.map(q => ({
            id: q.id?.toString() || `question-${Date.now()}-${Math.random()}`,
            title: q.title || '',
            points: Number(q.max_points) || 0, // Backend uses max_points, frontend uses points
            pageNumber: q.default_page_numbers && q.default_page_numbers.length > 0 ? q.default_page_numbers[0] : undefined
          }));
          
          console.log('Converted frontend questions:', frontendQuestions);
          setQuestions(frontendQuestions);
        } else {
          console.log('No questions found, starting with empty array');
          setQuestions([]);
        }
      } catch (error) {
        console.error('Error loading questions:', error);
        console.error('Error details:', error);
        // Don't show error to user, just start with empty questions
        setQuestions([]);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, [assignmentId, reloadTrigger]);

  const saveOutline = async () => {
    if (!assignmentId || questions.length === 0) {
      alert("لطفاً حداقل یک سوال اضافه کنید");
      return;
    }

    // Validate that every question has a page number set
    const questionsWithoutPages = questions.filter(q => !q.pageNumber || q.pageNumber <= 0);
    if (questionsWithoutPages.length > 0) {
      alert("لطفاً برای همه سوالات شماره صفحه تعیین کنید");
      return;
    }

    setIsSaving(true);
    try {
      console.log('Saving questions:', questions);
      
      // Convert questions to the format expected by the backend
      const questionsData = questions.map((question, index) => ({
        title: question.title || '',
        max_points: Number(question.points) || 0, // Backend expects max_points, not points
        order_index: index, // Backend expects order_index, not order
        default_page_numbers: question.pageNumber ? [Number(question.pageNumber)] : [] // Ensure it's a number array
      }));

      console.log('Questions data to save:', questionsData);

      // Save questions to backend using updateQuestions (which deletes and recreates)
      const savedQuestions = await questionService.updateQuestions(parseInt(assignmentId), questionsData);
      
      console.log('Saved questions response:', savedQuestions);

      alert("طرح کلی با موفقیت ذخیره شد");

      // Trigger a reload to test persistence
      setReloadTrigger(prev => prev + 1);

      // Navigate to submissions tab in the unified assignment page
      navigate(`/courses/${courseId}/assignments/${assignmentId}/submissions`);
    } catch (error) {
      console.error('Error saving outline:', error);
      alert("خطا در ذخیره طرح کلی: " + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state
  if (assignmentLoading || isLoadingQuestions) {
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
          <Text color={textColor}>در حال بارگذاری...</Text>
        </GridItem>
      </Grid>
    );
  }

  // Show error state
  if (assignmentError) {
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
          <Text color="red.500">{assignmentError}</Text>
        </GridItem>
      </Grid>
    );
  }

  return (
    <Grid
      templateAreas={{ base: `"main"`, lg: `"sidebar main"` }}
      templateColumns={{ base: "1fr", lg: "300px 1fr" }}
      minH="100vh"
      gap={0}
    >
      {/* Left Sidebar - Assignment Navigation */}
      <GridItem area="sidebar">
        <DynamicSidebar />
      </GridItem>

      {/* Main Content - PDF Annotation Viewer */}
      <GridItem area="main" bg={bgColor}>
        <VStack align="stretch" h="100vh" p={4}>

          {/* PDF Annotation Viewer */}
          <Box flex="1" bg="white" borderRadius="lg" boxShadow="sm" overflow="hidden">
            <GradescopePDFViewer
              pdfUrl={assignment?.template_pdf ? 
                (assignment.template_pdf.startsWith('http') ? 
                  assignment.template_pdf : 
                  `http://localhost:8000${assignment.template_pdf}`) : 
                ''}
              questions={questions}
              onQuestionsChange={setQuestions}
              onSaveOutline={saveOutline}
              onCancel={() => navigate(`/courses/${courseId}/assignments/${assignmentId}`)}
              isSaving={isSaving}
            />
          </Box>
        </VStack>
      </GridItem>
    </Grid>
  );
};

export default AssignmentOutlinePage;
