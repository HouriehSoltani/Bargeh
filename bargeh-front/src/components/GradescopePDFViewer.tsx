import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Box, VStack, HStack, Text, Button, Icon, Spinner } from '@chakra-ui/react';
import { FiPlus, FiX, FiSave, FiZoomIn, FiZoomOut, FiRotateCw } from 'react-icons/fi';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker - use local file from public directory
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface Question {
  id: string;
  title: string;
  points: number;
  pageNumber?: number;
}

// Canvas-based annotation interfaces removed - using simple page-based questions

interface RubricItem {
  id: string;
  title: string;
  points: number;
  description?: string;
  applied: boolean;
}

interface GradescopePDFViewerProps {
  pdfUrl: string;
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  onSaveOutline: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

// Tool type removed - not needed for page-based questions

const GradescopePDFViewer: React.FC<GradescopePDFViewerProps> = ({
  pdfUrl,
  questions,
  onQuestionsChange,
  onSaveOutline,
  onCancel,
  isSaving = false,
}) => {
  // PDF state
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  // Annotation state removed - using simple page-based questions

  // Debug: Log PDF URL
  React.useEffect(() => {
    console.log('GradescopePDFViewer - PDF URL:', pdfUrl);
  }, [pdfUrl]);

  // Fetch PDF with proper credentials
  useEffect(() => {
    if (!pdfUrl) {
      setError('No PDF URL provided');
      setLoading(false);
      return;
    }

    // Clean up previous blob URL when PDF URL changes
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }

    let aborted = false;
    const fetchPdf = async () => {
      try {
        setLoading(true);
        setError(null);
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
        setLoading(false);
        console.log('PDF fetched successfully, size:', arrayBuffer.byteLength, 'bytes');
        console.log('PDF blob URL created:', blobUrl);
      } catch (err: any) {
        if (aborted) return;
        console.error('PDF fetch error:', err);
        setError(`Failed to load PDF: ${err.message}`);
        setLoading(false);
      }
    };

    fetchPdf();
    return () => { 
      aborted = true; 
    };
  }, [pdfUrl]); // Only depend on pdfUrl, not pdfBlobUrl

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  // Question management
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionPoints, setNewQuestionPoints] = useState(10);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  // currentQuestionId removed - not needed for page-based questions

  // Refs
  const pageRef = useRef<HTMLDivElement>(null);

  // Rubric items (hardcoded for now)
  const [rubricItems] = useState<RubricItem[]>([
    { id: '1', title: 'Correct answer', points: 10, description: 'Full points for correct solution', applied: false },
    { id: '2', title: 'Partial credit', points: 5, description: 'Some correct steps shown', applied: false },
    { id: '3', title: 'Missing units', points: -1, description: 'Answer missing proper units', applied: false },
    { id: '4', title: 'Calculation error', points: -2, description: 'Mathematical error in calculation', applied: false },
  ]);

  // Canvas functionality removed - using simple page-based questions

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully:', numPages, 'pages');
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error);
    console.error('PDF URL:', pdfUrl);
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  }, [pdfUrl]);

  // Canvas rendering functions removed - using simple page-based questions

  // Canvas mouse event handlers removed - using simple page-based questions

  const addQuestion = useCallback(() => {
    if (!newQuestionTitle.trim()) return;

    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      title: newQuestionTitle,
      points: newQuestionPoints,
      pageNumber: pageNumber, // Just specify the page number
    };

    console.log('Adding question for page:', pageNumber);

    onQuestionsChange([...questions, newQuestion]);
    setNewQuestionTitle('');
    setNewQuestionPoints(10);
    setIsAddingQuestion(false);
    
    console.log('Question added for page:', pageNumber);
  }, [newQuestionTitle, newQuestionPoints, questions, onQuestionsChange, pageNumber]);

  const removeQuestion = useCallback((questionId: string) => {
    onQuestionsChange(questions.filter(q => q.id !== questionId));
  }, [questions, onQuestionsChange]);

  // selectQuestionRegion function removed - questions are now automatically positioned

  const applyRubricItem = useCallback((rubricItemId: string) => {
    // TODO: Implement rubric application
    console.log('Applying rubric item:', rubricItemId);
  }, []);

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const appliedRubricPoints = rubricItems
    .filter(item => item.applied)
    .reduce((sum, item) => sum + item.points, 0);

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="100%">
        <VStack>
          <Spinner size="lg" color="blue.500" />
          <Text>Loading PDF...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="100%">
        <VStack>
          <Text color="red.500">{error}</Text>
          <Text color="gray.500" fontSize="sm">PDF URL: {pdfUrl}</Text>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box w="100%" h="100%" display="flex" gap={4}>
      {/* Left Panel - Question Management */}
      <Box w="300px" bg="white" borderRadius="lg" p={4} boxShadow="sm">
        <VStack align="stretch" gap={4} h="100%">
          {/* Header */}
          <Text fontSize="lg" fontWeight="bold" color="gray.800">
            مدیریت سوالات
          </Text>

          {/* Total Points */}
          <Box bg="blue.50" p={3} borderRadius="md">
            <Text fontSize="sm" color="blue.600" fontWeight="medium">
              مجموع نمرات: {totalPoints}
            </Text>
            <Text fontSize="xs" color="blue.500">
              نمرات اعمال شده: {appliedRubricPoints}
            </Text>
          </Box>

          {/* Add Question Form */}
          {isAddingQuestion ? (
            <VStack align="stretch" gap={3} p={3} bg="gray.50" borderRadius="md">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                افزودن سوال جدید
              </Text>
              <input
                type="text"
                placeholder="عنوان سوال"
                value={newQuestionTitle}
                onChange={(e) => setNewQuestionTitle(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
              <input
                type="number"
                placeholder="نمره"
                value={newQuestionPoints}
                onChange={(e) => setNewQuestionPoints(Number(e.target.value))}
                min="1"
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
              <HStack gap={2}>
                <Button size="sm" colorScheme="blue" onClick={addQuestion}>
                  <Icon as={FiPlus} mr={1} />
                  افزودن
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsAddingQuestion(false)}>
                  <Icon as={FiX} mr={1} />
                  انصراف
                </Button>
              </HStack>
            </VStack>
          ) : (
            <Button
              colorScheme="blue"
              variant="outline"
              onClick={() => setIsAddingQuestion(true)}
            >
              <Icon as={FiPlus} mr={2} />
              افزودن سوال
            </Button>
          )}

          {/* Questions List */}
          <VStack align="stretch" gap={2} flex="1" overflowY="auto">
            {questions.map((question, index) => (
              <Box
                key={question.id}
                p={3}
                bg={question.pageNumber ? "green.50" : "yellow.50"}
                borderRadius="md"
                border="1px solid"
                borderColor={question.pageNumber ? "green.200" : "yellow.200"}
              >
                <VStack align="stretch" gap={2}>
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="medium" color="gray.800">
                      سوال {index + 1}
                    </Text>
                    <Button
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <Icon as={FiX} />
                    </Button>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    {question.title}
                  </Text>
                  <Text fontSize="xs" color="blue.600" fontWeight="medium">
                    {question.points} نمره
                  </Text>
                  {question.pageNumber ? (
                    <VStack align="stretch" gap={1}>
                      <Text fontSize="xs" color="green.600">
                        ✓ صفحه مشخص شده
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        صفحه {question.pageNumber}
                      </Text>
                    </VStack>
                  ) : (
                    <Text fontSize="xs" color="yellow.600">
                      ⚠️ صفحه در حال بارگذاری...
                    </Text>
                  )}
                </VStack>
              </Box>
            ))}
          </VStack>

          {/* Action Buttons */}
          <VStack gap={2}>
            <Button
              colorScheme="blue"
              w="100%"
              onClick={onSaveOutline}
              loading={isSaving}
              loadingText="در حال ذخیره..."
            >
              <Icon as={FiSave} mr={2} />
              ذخیره طرح کلی
            </Button>
            <Button
              variant="outline"
              w="100%"
              onClick={onCancel}
            >
              انصراف
            </Button>
          </VStack>
        </VStack>
      </Box>

      {/* Middle Panel - PDF Viewer */}
      <Box flex="1" bg="white" borderRadius="lg" boxShadow="sm" overflow="hidden" position="relative">
        {/* Toolbar */}
        <Box p={2} bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
          <HStack gap={2} justify="space-between">
            {/* Annotation tools removed - using simple page-based questions */}

            {/* Center controls */}
            <HStack gap={1}>
              <Button size="sm" variant="outline" onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}>
                قبلی
              </Button>
              <Text fontSize="sm" minW="80px" textAlign="center">
                {pageNumber} / {numPages}
              </Text>
              <Button size="sm" variant="outline" onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}>
                بعدی
              </Button>
            </HStack>

            {/* Right controls */}
            <HStack gap={1}>
              <Button size="sm" variant="outline" onClick={() => setScale(Math.max(0.5, scale - 0.25))}>
                <Icon as={FiZoomOut} />
              </Button>
              <Text fontSize="sm" minW="60px" textAlign="center">
                {Math.round(scale * 100)}%
              </Text>
              <Button size="sm" variant="outline" onClick={() => setScale(Math.min(3, scale + 0.25))}>
                <Icon as={FiZoomIn} />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setRotation((rotation + 90) % 360)}>
                <Icon as={FiRotateCw} />
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* PDF Viewer */}
        <Box position="relative" h="calc(100% - 60px)" overflow="auto">
          <Box ref={pageRef} position="relative" display="inline-block" style={{ position: 'relative' }}>
            {/* Debug logging removed to reduce console spam */}
            {pdfBlobUrl ? (
              <Document
                key={`pdf-${pdfUrl}-${pdfBlobUrl}`} // Force re-render with unique key
                file={pdfBlobUrl} // Use blob URL instead of data
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<div>Rendering PDF...</div>}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" h="400px">
                <VStack>
                  <Spinner size="lg" color="blue.500" />
                  <Text>Loading PDF...</Text>
                </VStack>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Right Panel - Rubric */}
      <Box w="300px" bg="white" borderRadius="lg" p={4} boxShadow="sm">
        <VStack align="stretch" gap={4} h="100%">
          <Text fontSize="lg" fontWeight="bold" color="gray.800">
            روبریک
          </Text>

          <VStack align="stretch" gap={2} flex="1" overflowY="auto">
            {rubricItems.map((item, index) => (
              <Box
                key={item.id}
                p={3}
                bg={item.applied ? "green.50" : "gray.50"}
                borderRadius="md"
                border="1px solid"
                borderColor={item.applied ? "green.200" : "gray.200"}
                cursor="pointer"
                onClick={() => applyRubricItem(item.id)}
                _hover={{ bg: item.applied ? "green.100" : "gray.100" }}
              >
                <VStack align="stretch" gap={1}>
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="medium" color="gray.800">
                      {item.title}
                    </Text>
                    <Text fontSize="sm" color={item.points >= 0 ? "green.600" : "red.600"} fontWeight="bold">
                      {item.points > 0 ? '+' : ''}{item.points}
                    </Text>
                  </HStack>
                  {item.description && (
                    <Text fontSize="xs" color="gray.600">
                      {item.description}
                    </Text>
                  )}
                  <Text fontSize="xs" color="blue.500">
                    کلید: {index + 1}
                  </Text>
                </VStack>
              </Box>
            ))}
          </VStack>

          <Box bg="green.50" p={3} borderRadius="md">
            <Text fontSize="sm" color="green.600" fontWeight="medium">
              نمره کل: {appliedRubricPoints}
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default GradescopePDFViewer;
