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
      id: `question-${Date.now()}-${Math.random()}`,
      title: newQuestionTitle.trim(),
      points: Number(newQuestionPoints) || 0,
      pageNumber: Number(pageNumber), // Ensure it's a number
    };

    console.log('Adding question for page:', pageNumber);
    console.log('New question:', newQuestion);

    onQuestionsChange([...questions, newQuestion]);
    setNewQuestionTitle('');
    setNewQuestionPoints(10);
    setIsAddingQuestion(false);
    
    console.log('Question added for page:', pageNumber);
    console.log('Updated questions array:', [...questions, newQuestion]);
  }, [newQuestionTitle, newQuestionPoints, questions, onQuestionsChange, pageNumber]);

  const removeQuestion = useCallback((questionId: string) => {
    onQuestionsChange(questions.filter(q => q.id !== questionId));
  }, [questions, onQuestionsChange]);

  // selectQuestionRegion function removed - questions are now automatically positioned

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

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
      {/* Left Panel - PDF Viewer */}
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

      {/* Right Panel - Question Management */}
      <Box w="300px" bg="gray.100" borderRadius="lg" p={4} boxShadow="sm">
        <VStack align="stretch" gap={4} h="100%">
          {/* Header */}
          <Text fontSize="lg" fontWeight="bold" color="gray.800">
            مدیریت سوالات
          </Text>

          {/* Total Points */}
          <Box bg="blue.100" p={3} borderRadius="md" border="1px solid" borderColor="blue.200" boxShadow="sm">
            <Text fontSize="sm" color="blue.600" fontWeight="medium">
              مجموع نمرات: {totalPoints}
              </Text>
          </Box>

          {/* Add Question Form */}
          {isAddingQuestion ? (
            <VStack align="stretch" gap={3} p={3} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" boxShadow="sm">
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
                <Button paddingLeft={2} size="xs" bg="blue.500" color="white" _hover={{ bg: "blue.600" }} onClick={addQuestion}>
                  <Icon as={FiPlus} mr={1} />
                  افزودن
                </Button>
                <Button paddingLeft={2} size="xs" bg="gray.700" _hover={{ bg: "gray.800" }} onClick={() => setIsAddingQuestion(false)}>
                  <Icon as={FiX} mr={1} />
                  انصراف
                </Button>
              </HStack>
            </VStack>
          ) : (
            <Button
              bg='white'
              variant="outline"
              onClick={() => setIsAddingQuestion(true)}
            >
              <Icon as={FiPlus} mr={2} />
              افزودن سوال
            </Button>
          )}

          {/* Questions List */}
          <VStack align="stretch" gap={1} flex="1" overflowY="auto">
            {questions.map((question, index) => (
              <Box
                key={question.id}
                p={2}
                bg={question.pageNumber ? "blue.100" : "white"}
                borderRadius="sm"
                border="1px solid"
                borderColor={question.pageNumber ? "blue.300" : "gray.300"}
                _hover={{ bg: question.pageNumber ? "blue.200" : "gray.50" }}
                boxShadow="sm"
              >
                <HStack justify="space-between" align="center" gap={2}>
                  <HStack gap={2} flex="1">
                    <Text fontSize="xs" fontWeight="medium" color="gray.600" minW="40px">
                      {index + 1}.
                    </Text>
                    <Text fontSize="xs" color="gray.700" flex="1" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                      {question.title}
                    </Text>
                    <Text fontSize="xs" color="blue.600" fontWeight="medium" minW="50px">
                      {question.points} نمره
                    </Text>
                    {question.pageNumber && (
                      <Text fontSize="xs" color="gray.500" minW="60px">
                        صفحه {question.pageNumber}
              </Text>
                    )}
                  </HStack>
                  <Button
                    size="xs"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => removeQuestion(question.id)}
                    minW="auto"
                    p={0}
                    h="auto"
                  >
                    <Icon as={FiX} />
                  </Button>
                </HStack>
        </Box>
            ))}
          </VStack>

          {/* Action Buttons */}
          <VStack gap={2}>
            <Button
              bg="blue.500"
              color="white"
              _hover={{ bg: "blue.600" }}
              w="100%"
              onClick={onSaveOutline}
              loading={isSaving}
              loadingText="در حال ذخیره..."
            >
              <Icon as={FiSave} mr={2} />
              ذخیره طرح کلی
            </Button>
            <Button
                  bg="gray.700"
                  _hover={{ bg: "gray.800" }}
              w="100%"
              onClick={onCancel}
            >
              انصراف
            </Button>
          </VStack>
          </VStack>
        </Box>
      
    </Box>
  );
};

export default GradescopePDFViewer;
