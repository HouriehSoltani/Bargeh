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
import GradescopePDFViewer from '@/components/GradescopePDFViewer';

interface Question {
  id: string;
  title: string;
  points: number;
  position?: {
    pageNumber: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
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

  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");

  const saveOutline = () => {
    // TODO: Implement API call to save outline
    console.log('Saving outline:', questions);
    navigate(`/courses/${courseId}/assignments/${assignmentId}`);
  };

  // Show loading state
  if (assignmentLoading) {
    return (
      <Grid
        templateAreas={{ base: `"main"`, lg: `"sidebar main"` }}
        templateColumns={{ base: "1fr", lg: "300px 1fr" }}
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
        templateAreas={{ base: `"main"`, lg: `"sidebar main"` }}
        templateColumns={{ base: "1fr", lg: "300px 1fr" }}
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
      templateAreas={{ base: `"main"`, lg: `"sidebar pdf"` }}
      templateColumns={{ base: "1fr", lg: "300px 1fr" }}
      minH="100vh"
      gap={0}
    >
      {/* Left Sidebar - Assignment Navigation */}
      <GridItem area="sidebar">
        <DynamicSidebar />
      </GridItem>

      {/* Main Content - PDF Annotation Viewer */}
      <GridItem area="pdf" colSpan={2} bg={bgColor}>
        <VStack align="stretch" h="100vh" p={4}>
          {/* Header */}
          <Text fontSize="lg" fontWeight="semibold" color={textColor} mb={4}>
            ویرایش طرح کلی
          </Text>

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
            />
          </Box>
        </VStack>
      </GridItem>
    </Grid>
  );
};

export default AssignmentOutlinePage;
