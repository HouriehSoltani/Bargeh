import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  GridItem,
  VStack,
  HStack,
  Text,
  Button,
  Spinner,
  Input,
  IconButton,
  Icon,
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut, FiRotateCw, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { Document, Page, pdfjs } from 'react-pdf';
import DynamicSidebar from '../../components/DynamicSidebar';
import { api } from '../../services/api';
import { useColorModeValue } from '../../hooks/useColorMode';
import { rubricService, type RubricItem, type SubmissionGrade } from '../../services/rubricService';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface SubmissionGradingData {
  submission_id: number;
  student_name: string;
  question_id: number;
  question_title: string;
  question_points: number;
  total_submissions: number;
  graded_submissions: number;
  progress_percentage: number;
  current_submission_index: number;
  total_submissions_for_question: number;
  page_number: number;
  file_url: string;
  previous_submission_id: number | null;
  next_submission_id: number | null;
}


const SubmissionGradingPage: React.FC = () => {
  const { courseId, assignmentId, questionId, submissionId } = useParams<{
    courseId: string;
    assignmentId: string;
    questionId: string;
    submissionId: string;
  }>();
  const navigate = useNavigate();

  const [gradingData, setGradingData] = useState<SubmissionGradingData | null>(null);
  const [rubricItems, setRubricItems] = useState<RubricItem[]>([]);
  const [submissionGrade, setSubmissionGrade] = useState<SubmissionGrade | null>(null);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemData, setNewItemData] = useState<Partial<RubricItem>>({
    label: '',
    delta_points: 0,
    is_positive: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtleText = useColorModeValue('gray.600', 'gray.300');
  const progressBg = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    loadGradingData();
  }, [courseId, assignmentId, questionId, submissionId]);

  // Fetch PDF with proper credentials
  useEffect(() => {
    console.log('PDF useEffect triggered, gradingData:', gradingData);
    if (!gradingData?.file_url) {
      console.log('No PDF URL provided');
      setPdfError('No PDF URL provided');
      return;
    }

    // Set the current page to the page number from backend
    if (gradingData.page_number) {
      console.log('Setting current page to:', gradingData.page_number);
      setCurrentPage(gradingData.page_number);
    } else {
      console.log('No page number in grading data, using default page 1');
    }

    // Clean up previous blob URL when PDF URL changes
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }

    let aborted = false;
    const fetchPdf = async () => {
      try {
        setPdfError(null);
        
        const pdfUrl = gradingData.file_url.startsWith('http') ? 
          gradingData.file_url : 
          `http://localhost:8000${gradingData.file_url}`;
        
        console.log('Fetching PDF from:', pdfUrl);
        
        const response = await fetch(pdfUrl, {
          credentials: 'include', // Send cookies/session
          headers: {
            'Accept': 'application/pdf',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/pdf')) {
          throw new Error(`Invalid content type: ${contentType}. Expected application/pdf`);
        }

        const arrayBuffer = await response.arrayBuffer();
        if (aborted) return;

        // Create a Blob URL to avoid ArrayBuffer transfer issues
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        
        setPdfBlobUrl(blobUrl);
      } catch (err: any) {
        if (!aborted) {
          console.error('Error fetching PDF:', err);
          setPdfError(err.message || 'Failed to load PDF');
        }
      }
    };

    fetchPdf();

    return () => {
      aborted = true;
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [gradingData?.file_url]);

  const loadGradingData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load grading data
      const response = await api.get(
        `/api/assignments/${assignmentId}/questions/${questionId}/submissions/${submissionId}/grade/`
      );
      
      const gradingData = response as SubmissionGradingData;
      console.log('Loaded grading data:', gradingData);
      console.log('PDF file URL:', gradingData.file_url);
      setGradingData(gradingData);
      
      // Load rubric items from the backend
      try {
        console.log('Loading rubric items for assignment:', assignmentId, 'question:', questionId);
        const rubricItems = await rubricService.getRubricItems(parseInt(assignmentId!), parseInt(questionId!));
        console.log('Loaded rubric items from backend:', rubricItems);
        console.log('Rubric items type:', typeof rubricItems, 'Array?', Array.isArray(rubricItems));
        setRubricItems(rubricItems || []);
      } catch (err) {
        console.error('Error loading rubric items:', err);
        console.error('Error details:', err);
        // Fallback to empty array if rubric items can't be loaded
        setRubricItems([]);
      }
      
      // Load submission grade from the backend
      try {
        console.log('Loading submission grade for assignment:', assignmentId, 'submission:', submissionId, 'question:', questionId);
        const submissionGrade = await rubricService.getSubmissionGrade(parseInt(assignmentId!), parseInt(submissionId!), parseInt(questionId!));
        console.log('Loaded submission grade from backend:', submissionGrade);
        setSubmissionGrade(submissionGrade);
      } catch (err) {
        console.error('Error loading submission grade:', err);
        // Create a default submission grade if none exists
        const defaultSubmissionGrade = {
          id: 1,
          submission: parseInt(submissionId!),
          question: parseInt(questionId!),
          selected_item_ids: [],
          total_points: gradingData.question_points,
          updated_at: new Date().toISOString()
        };
        console.log('Using default submission grade:', defaultSubmissionGrade);
        setSubmissionGrade(defaultSubmissionGrade);
      }

    } catch (err: any) {
      console.error('Error loading grading data:', err);
      setError('خطا در بارگذاری اطلاعات نمره‌دهی');
    } finally {
      setIsLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully, numPages:', numPages);
    console.log('Current page before validation:', currentPage);
    console.log('Grading data page number:', gradingData?.page_number);
    setNumPages(numPages);
    
    // Ensure current page is within valid range
    if (gradingData?.page_number && gradingData.page_number <= numPages) {
      console.log('Setting page to backend page number:', gradingData.page_number);
      setCurrentPage(gradingData.page_number);
    } else if (currentPage > numPages) {
      console.log('Current page exceeds numPages, setting to 1');
      setCurrentPage(1);
    } else {
      console.log('Keeping current page:', currentPage);
    }
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setPdfError('Failed to load PDF document');
  };

  const goToPreviousSubmission = () => {
    if (gradingData && gradingData.previous_submission_id) {
      // Navigate to previous submission using the correct submission ID
      navigate(`/courses/${courseId}/assignments/${assignmentId}/questions/${questionId}/submissions/${gradingData.previous_submission_id}/grade`);
    }
  };

  const goToNextSubmission = () => {
    if (gradingData && gradingData.next_submission_id) {
      // Navigate to next submission using the correct submission ID
      navigate(`/courses/${courseId}/assignments/${assignmentId}/questions/${questionId}/submissions/${gradingData.next_submission_id}/grade`);
    }
  };

  const handleRubricItemToggle = async (itemId: number) => {
    if (!submissionGrade || !gradingData) return;
    
    const currentSelectedIds = submissionGrade.selected_item_ids;
    const isSelected = currentSelectedIds.includes(itemId);
    
    // Optimistically update UI
    const newSelectedIds = isSelected 
      ? currentSelectedIds.filter(id => id !== itemId)
      : [...currentSelectedIds, itemId];
    
    // Calculate new total points based on selected rubric items
    const selectedItems = rubricItems.filter(item => newSelectedIds.includes(item.id));
    const deltaSum = selectedItems.reduce((sum, item) => {
      // delta_points can be positive or negative
      return sum + (item.delta_points || 0);
    }, 0);
    
    // Calculate new total: base points + delta sum, clamped between 0 and max points
    const basePoints = gradingData.question_points || 0;
    const newTotalPoints = Math.max(0, Math.min(basePoints + deltaSum, basePoints));
    
    const optimisticGrade = {
      ...submissionGrade,
      selected_item_ids: newSelectedIds,
      total_points: newTotalPoints
    };
    setSubmissionGrade(optimisticGrade);
    
    try {
      // Send the full current selection to the backend
      const updatedGrade = await rubricService.updateSubmissionGrade(
        parseInt(assignmentId!),
        parseInt(submissionId!), 
        parseInt(questionId!), 
        newSelectedIds
      );
      
      // Update with the server response
      setSubmissionGrade(updatedGrade);
      console.log('Rubric item toggled successfully:', itemId, 'New selection:', newSelectedIds, 'New total:', updatedGrade.total_points);
    } catch (error) {
      console.error('Error updating submission grade:', error);
      // Revert optimistic update on error
      setSubmissionGrade(submissionGrade);
      setError('خطا در به‌روزرسانی نمره');
    }
  };

  const handleAddRubricItem = async () => {
    if (!assignmentId || !questionId || !newItemData.label) return;
    
    const rubricData = {
      label: newItemData.label,
      delta_points: newItemData.delta_points || 0,
      order_index: (rubricItems?.length || 0) + 1,
      is_positive: newItemData.is_positive || true
    };
    
    console.log('Creating rubric item with data:', rubricData);
    console.log('Assignment ID:', assignmentId, 'Question ID:', questionId);
    
    try {
      const rubricItem = await rubricService.createRubricItem(parseInt(assignmentId), parseInt(questionId), rubricData);
      
      setRubricItems([...(rubricItems || []), rubricItem]);
      setIsAddingNew(false);
      setNewItemData({ label: '', delta_points: 0, is_positive: true });
    } catch (error) {
      console.error('Error creating rubric item:', error);
      setError('خطا در ایجاد معیار جدید');
    }
  };

  const handleUpdateRubricItem = async (itemId: number, updates: Partial<RubricItem>) => {
    if (!assignmentId) return;
    
    try {
      const updatedItem = await rubricService.updateRubricItem(parseInt(assignmentId), itemId, updates);
      setRubricItems(rubricItems.map(item => 
        item.id === itemId ? updatedItem : item
      ));
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating rubric item:', error);
      setError('خطا در به‌روزرسانی معیار');
    }
  };

  const handleDeleteRubricItem = async (itemId: number) => {
    if (!assignmentId) return;
    
    try {
      await rubricService.deleteRubricItem(parseInt(assignmentId), itemId);
      setRubricItems(rubricItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting rubric item:', error);
      setError('خطا در حذف معیار');
    }
  };

  // Show loading state
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
          <Spinner size="xl" />
        </GridItem>
      </Grid>
    );
  }

  // Show error state
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
          <Box p={4} bg="red.50" border="1px" borderColor="red.200" borderRadius="md" maxW="md">
            <Text color="red.600" fontWeight="medium">
              {error}
            </Text>
          </Box>
        </GridItem>
      </Grid>
    );
  }

  if (!gradingData) {
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
          <Text>No grading data found</Text>
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

      {/* Main Content - PDF Viewer with Rubric Panel */}
      <GridItem area="main" bg={bgColor}>
        <VStack align="stretch" h="100vh" p={4} pb={{ base: 20, md: 24 }}>
          {/* Header */}
          <Box p={4} borderBottom="1px" borderColor={borderColor} bg={bgColor}>
            <VStack align="start" gap={2}>
              <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                نمره‌دهی
              </Text>
              <Text color={textColor}>
                دانشجو: {gradingData.student_name} | سوال: {gradingData.question_title}
              </Text>
            </VStack>
          </Box>

          {/* Content Area */}
          <Box flex="1" display="flex" gap={8}>
            {/* PDF Viewer */}
            <Box flex="1" bg="white" borderRadius="lg" boxShadow="sm" overflow="hidden" position="relative">
              {/* Toolbar */}
              <Box p={2} bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
                <HStack gap={2} justify="space-between">
                  {/* Center controls */}
                  <HStack gap={1}>
                    <Button size="sm" variant="outline" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>
                      قبلی
                    </Button>
                    <Text fontSize="sm" minW="80px" textAlign="center">
                      {currentPage} / {numPages}
                    </Text>
                    <Button size="sm" variant="outline" onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}>
                      بعدی
                    </Button>
                  </HStack>

                  {/* Right controls */}
                  <HStack gap={1}>
                    <Button size="sm" variant="outline" onClick={() => setScale(Math.max(0.5, scale - 0.25))}>
                      <FiZoomOut />
                    </Button>
                    <Text fontSize="sm" minW="60px" textAlign="center">
                      {Math.round(scale * 100)}%
                    </Text>
                    <Button size="sm" variant="outline" onClick={() => setScale(Math.min(3, scale + 0.25))}>
                      <FiZoomIn />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setRotation((rotation + 90) % 360)}>
                      <FiRotateCw />
                    </Button>
                  </HStack>
                </HStack>
              </Box>

              {/* PDF Display */}
              <Box position="relative" h="calc(100% - 60px)" overflow="auto">
                <Box position="relative" display="inline-block" style={{ position: 'relative' }}>
                  {pdfError ? (
                    <Box display="flex" alignItems="center" justifyContent="center" h="400px">
                      <VStack>
                        <Text color="red.500">{pdfError}</Text>
                        <Text fontSize="sm" color="gray.500">PDF URL: {gradingData?.file_url}</Text>
                        <Button size="sm" onClick={() => window.location.reload()}>
                          Retry
                        </Button>
                      </VStack>
                    </Box>
                  ) : pdfBlobUrl ? (
                    <Document
                      key={`pdf-${gradingData?.file_url}-${pdfBlobUrl}`}
                      file={pdfBlobUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={<div>Rendering PDF...</div>}
                    >
                      {numPages > 0 && currentPage <= numPages && (
                        <Page
                          pageNumber={currentPage}
                          scale={scale}
                          rotate={rotation}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      )}
                    </Document>
                  ) : (
                    <Box display="flex" alignItems="center" justifyContent="center" h="400px">
                      <VStack>
                        <Spinner size="lg" color="blue.500" />
                        <Text>Loading PDF...</Text>
                        <Text fontSize="sm" color="gray.500">URL: {gradingData?.file_url}</Text>
                      </VStack>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Rubric Panel */}
            <Box w="400px" bg="white" borderRadius="lg" p={4} boxShadow="lg">
              <VStack align="stretch" gap={4}>
                {/* Header */}
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  نمره‌دهی سوال
                </Text>

                {/* Question Info */}
                <VStack align="start" gap={2}>
                  <Text fontSize="md" fontWeight="medium" color="gray.700">
                    سوال {gradingData.question_id}: {gradingData.question_title}
                  </Text>
                  
                  {/* Progress Bar */}
                  <VStack align="stretch" w="full" gap={2}>
                    <HStack justify="space-between" align="center">
                      <Text fontSize="sm" fontWeight="medium" color={textColor}>
                        پیشرفت نمره‌دهی سوال
                      </Text>
                      <Text fontSize="sm" color={subtleText}>
                        {gradingData.graded_submissions} از {gradingData.total_submissions}
                      </Text>
                    </HStack>
                    <Box
                      w="full"
                      h="16px"
                      bg={progressBg}
                      borderRadius="full"
                      overflow="hidden"
                      position="relative"
                    >
                      <Box
                        w={`${gradingData.progress_percentage}%`}
                        h="full"
                        bg={gradingData.progress_percentage === 100 ? "green.500" : gradingData.progress_percentage > 0 ? "blue.500" : "gray.400"}
                        borderRadius="full"
                        transition="all 0.3s ease"
                        position="relative"
                      >
                        {/* Progress percentage text overlay */}
                        {gradingData.progress_percentage > 20 && (
                          <Text
                            fontSize="xs"
                            color="white"
                            fontWeight="bold"
                            position="absolute"
                            top="50%"
                            left="50%"
                            transform="translate(-50%, -50%)"
                            textShadow="0 1px 2px rgba(0,0,0,0.3)"
                          >
                            {gradingData.progress_percentage}%
                          </Text>
                        )}
                      </Box>
                    </Box>
                    {gradingData.progress_percentage <= 20 && (
                      <Text fontSize="xs" color={subtleText} textAlign="center">
                        {gradingData.progress_percentage}% تکمیل شده
                      </Text>
                    )}
                  </VStack>

                  <Box h="1px" bg={borderColor} />

                  {/* Total Points */}
                  <VStack align="start" gap={2}>
                    <Text fontSize="md" fontWeight="bold" color="gray.800">
                      نمره کل:
                    </Text>
                    <HStack gap={2} align="center">
                      <HStack gap={1}>
                        <Text 
                          fontSize="xl" 
                          fontWeight="bold" 
                          color={(submissionGrade?.total_points ?? gradingData.question_points) === gradingData.question_points ? "green.600" : 
                                 (submissionGrade?.total_points ?? gradingData.question_points) < gradingData.question_points ? "orange.600" : "blue.600"}
                        >
                          {submissionGrade?.total_points ?? gradingData.question_points}
                        </Text>
                        <Text fontSize="lg" fontWeight="medium" color="gray.600">
                          / {gradingData.question_points}
                        </Text>
                      </HStack>
                      {(submissionGrade?.total_points ?? gradingData.question_points) !== gradingData.question_points && (
                        <Box
                          px={2}
                          py={1}
                          borderRadius="md"
                          bg={(submissionGrade?.total_points ?? gradingData.question_points) < gradingData.question_points ? "orange.100" : "blue.100"}
                          border="1px solid"
                          borderColor={(submissionGrade?.total_points ?? gradingData.question_points) < gradingData.question_points ? "orange.300" : "blue.300"}
                        >
                          <Text 
                            fontSize="xs" 
                            fontWeight="medium" 
                            color={(submissionGrade?.total_points ?? gradingData.question_points) < gradingData.question_points ? "orange.700" : "blue.700"}
                          >
                            {(submissionGrade?.total_points ?? gradingData.question_points) < gradingData.question_points ? "کسر شده" : "اضافه شده"}
                          </Text>
                        </Box>
                      )}
                    </HStack>
                  </VStack>
                </VStack>

                <Box h="1px" bg={borderColor} />

                {/* Rubrics */}
                <VStack align="stretch" gap={3}>
                  <Text fontSize="md" fontWeight="medium" color="gray.700">
                    معیارهای نمره‌دهی
                  </Text>

                  {rubricItems && rubricItems.map((item, index) => {
                    const isSelected = submissionGrade?.selected_item_ids.includes(item.id) || false;
                    const isEditing = editingItem === item.id;
                    
                    return (
                      <HStack key={item.id} align="start" gap={3}>
                        {/* Checkbox */}
                        <Box
                          w="20px"
                          h="20px"
                          border="2px solid"
                          borderColor={isSelected ? "blue.500" : "gray.300"}
                          bg={isSelected ? "blue.500" : "white"}
                          borderRadius="sm"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          cursor="pointer"
                          onClick={() => handleRubricItemToggle(item.id)}
                          mt={1}
                        >
                          {isSelected && (
                            <Text fontSize="xs" color="white" fontWeight="bold">
                              ✓
                            </Text>
                          )}
                        </Box>
                        
                        {/* Number Box */}
                        <Box
                          w="20px"
                          h="20px"
                          bg="gray.200"
                          borderRadius="sm"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          mt={1}
                        >
                          <Text fontSize="xs" fontWeight="bold" color="gray.600">
                            {index + 1}
                          </Text>
                        </Box>
                        
                        {/* Content */}
                        <VStack align="start" gap={1} flex="1">
                          {isEditing ? (
                            <VStack align="stretch" gap={2} w="full" bg="blue.50" p={3} borderRadius="md" border="1px solid" borderColor="blue.200">
                              <VStack gap={2} w="full">
                                <HStack gap={2}>
                                  <Input
                                    size="sm"
                                    value={item.label}
                                    onChange={(e) => {
                                      const updatedItem = {...item, label: e.target.value};
                                      setRubricItems(rubricItems.map(r => r.id === item.id ? updatedItem : r));
                                    }}
                                    placeholder="نام معیار"
                                  />
                                  <Input
                                    size="sm"
                                    type="number"
                                    w="80px"
                                    value={item.delta_points}
                                    onChange={(e) => {
                                      const updatedItem = {...item, delta_points: parseFloat(e.target.value) || 0};
                                      setRubricItems(rubricItems.map(r => r.id === item.id ? updatedItem : r));
                                    }}
                                    placeholder="0"
                                  />
                                </HStack>
                              </VStack>
                              <HStack gap={2}>
                                <Button
                                  size="xs"
                                  colorScheme="green"
                                  onClick={() => handleUpdateRubricItem(item.id, item)}
                                >
                                  <Icon as={FiCheck} mr={1} />
                                  ذخیره
                                </Button>
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => setEditingItem(null)}
                                >
                                  <Icon as={FiX} mr={1} />
                                  لغو
                                </Button>
                              </HStack>
                            </VStack>
                          ) : (
                            <HStack 
                              justify="space-between" 
                              w="full"
                              cursor="pointer"
                              onClick={() => setEditingItem(item.id)}
                              _hover={{ bg: "gray.100" }}
                              bg="gray.50"
                              p={3}
                              borderRadius="md"
                              border="1px solid"
                              borderColor="gray.200"
                            >
                              <VStack align="start" gap={1}>
                                <HStack gap={2} align="center">
                                  <Box
                                    px={2}
                                    py={1}
                                    borderRadius="md"
                                    bg={item.delta_points >= 0 ? "green.100" : "red.100"}
                                    border="1px solid"
                                    borderColor={item.delta_points >= 0 ? "green.300" : "red.300"}
                                  >
                                    <Text 
                                      fontSize="xs" 
                                      fontWeight="bold" 
                                      color={item.delta_points >= 0 ? "green.700" : "red.700"}
                                    >
                                      {item.delta_points >= 0 ? `+${item.delta_points}` : `${item.delta_points}`} امتیاز
                                    </Text>
                                  </Box>
                                  {item.delta_points < 0 && (
                                    <Text fontSize="xs" color="red.500" fontWeight="medium">
                                      کسر امتیاز
                                    </Text>
                                  )}
                                </HStack>
                                <Text 
                                  fontSize="sm" 
                                  color="gray.700"
                                  fontWeight="medium"
                                >
                                  {item.label}
                                </Text>
                              </VStack>
                              <IconButton
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                aria-label="حذف"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRubricItem(item.id);
                                }}
                              >
                                <Icon as={FiTrash2} />
                              </IconButton>
                            </HStack>
                          )}
                        </VStack>
                      </HStack>
                    );
                  })}

                  {/* Add New Item */}
                  {isAddingNew ? (
                    <HStack align="start" gap={3}>
                      {/* Empty checkbox space */}
                      <Box w="20px" h="20px" mt={1} />
                      
                      {/* Number Box */}
                      <Box
                        w="20px"
                        h="20px"
                        bg="gray.200"
                        borderRadius="sm"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        mt={1}
                      >
                        <Text fontSize="xs" fontWeight="bold" color="gray.600">
                          +
                        </Text>
                      </Box>
                      
                      {/* Content */}
                      <VStack align="start" gap={1} flex="1">
                        <VStack align="stretch" gap={2} w="full" bg="green.50" p={3} borderRadius="md" border="1px solid" borderColor="green.200">
                          <VStack gap={2} w="full">
                            <HStack gap={2}>
                              <Input
                                size="sm"
                                placeholder="نام معیار"
                                value={newItemData.label || ''}
                                onChange={(e) => setNewItemData({...newItemData, label: e.target.value})}
                              />
                              <Input
                                size="sm"
                                type="number"
                                w="80px"
                                placeholder="0"
                                value={newItemData.delta_points || 0}
                                onChange={(e) => setNewItemData({...newItemData, delta_points: parseFloat(e.target.value) || 0})}
                              />
                            </HStack>
                            <HStack gap={2}>
                              <Button
                                size="xs"
                                variant={newItemData.is_positive ? "solid" : "outline"}
                                colorScheme="green"
                                onClick={() => setNewItemData({...newItemData, is_positive: true})}
                              >
                                مثبت
                              </Button>
                              <Button
                                size="xs"
                                variant={!newItemData.is_positive ? "solid" : "outline"}
                                colorScheme="red"
                                onClick={() => setNewItemData({...newItemData, is_positive: false})}
                              >
                                منفی
                              </Button>
                            </HStack>
                          </VStack>
                          <HStack gap={2}>
                            <Button
                              size="xs"
                              colorScheme="green"
                              onClick={handleAddRubricItem}
                            >
                              <Icon as={FiCheck} mr={1} />
                              ذخیره
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => {
                                setIsAddingNew(false);
                                setNewItemData({ label: '', delta_points: 0, is_positive: true });
                              }}
                            >
                              <Icon as={FiX} mr={1} />
                              لغو
                            </Button>
                          </HStack>
                        </VStack>
                      </VStack>
                    </HStack>
                  ) : (
                    <HStack align="start" gap={3}>
                      {/* Empty checkbox space */}
                      <Box w="20px" h="20px" mt={1} />
                      
                      {/* Number Box */}
                      <Box
                        w="20px"
                        h="20px"
                        bg="gray.200"
                        borderRadius="sm"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        mt={1}
                      >
                        <Text fontSize="xs" fontWeight="bold" color="gray.600">
                          +
                        </Text>
                      </Box>
                      
                      {/* Content */}
                      <Box
                        flex="1"
                        cursor="pointer"
                        onClick={() => setIsAddingNew(true)}
                        _hover={{ bg: "gray.100" }}
                        bg="gray.50"
                        p={3}
                        borderRadius="md"
                        border="1px dashed"
                        borderColor="gray.400"
                      >
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">
                             افزودن معیار جدید  
                        </Text>
                      </Box>
                    </HStack>
                  )}
                </VStack>
              </VStack>
            </Box>
          </Box>

          {/* Footer */}
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
            <HStack justify="space-between" mx="auto" px={{ base: 4, md: 6 }} gap={3}>
              <Text fontSize="md" color={textColor} fontWeight="bold">
                ارسال {gradingData.current_submission_index + 1} از {gradingData.total_submissions_for_question}
              </Text>
              
              <HStack gap={3}>
                <Button
                  bg="#2E5BBA"
                  color="white"
                  size={{ base: "sm", md: "md" }}
                  paddingLeft={2}
                  _hover={{ bg: "#1E4A9A" }}
                  fontSize={{ base: "xs", md: "sm" }}
                  onClick={goToPreviousSubmission}
                  disabled={!gradingData.previous_submission_id}
                >
                  <FiChevronRight style={{ marginRight: '4px' }} />
                  ارسال قبلی
                </Button>
                
                <Button
                  bg="#2E5BBA"
                  color="white"
                  size={{ base: "sm", md: "md" }}
                  paddingRight={2}
                  _hover={{ bg: "#1E4A9A" }}
                  fontSize={{ base: "xs", md: "sm" }}
                  onClick={goToNextSubmission}
                  disabled={!gradingData.next_submission_id}
                >
                  ارسال بعدی
                  <FiChevronLeft style={{ marginLeft: '4px' }} />
                </Button>
              </HStack>
            </HStack>
          </Box>
        </VStack>
      </GridItem>
    </Grid>
  );
};

export default SubmissionGradingPage;
