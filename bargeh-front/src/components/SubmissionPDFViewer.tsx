import React, { useState, useCallback, useEffect } from 'react';
import { Box, VStack, HStack, Text, Button, Icon, Spinner } from '@chakra-ui/react';
import { FiZoomIn, FiZoomOut, FiRotateCw, FiCheck } from 'react-icons/fi';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker - use local file from public directory
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface Question {
  id: number;
  title: string;
  max_points: number;
  default_page_numbers?: number[];
}

interface SubmissionOutline {
  question_id: number;
  page_numbers: number[];
}

interface SubmissionPDFViewerProps {
  pdfUrl: string;
  questions: Question[];
  submissionOutline: SubmissionOutline[];
  onOutlineChange: (outline: SubmissionOutline[]) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  numPages: number;
  submissionId?: number;
}

const SubmissionPDFViewer: React.FC<SubmissionPDFViewerProps> = ({
  pdfUrl,
  questions,
  submissionOutline,
  onOutlineChange,
  onSave,
  onCancel,
  isSaving = false,
  numPages,
  submissionId,
}) => {
  // PDF state
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [actualNumPages, setActualNumPages] = useState<number>(numPages); // Use actual PDF page count
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  // Debug: Log PDF URL
  React.useEffect(() => {
    console.log('SubmissionPDFViewer - PDF URL:', pdfUrl);
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
        console.log('Fetching submission PDF from:', pdfUrl);
        
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
        console.log('Submission PDF fetched successfully, size:', arrayBuffer.byteLength, 'bytes');
      } catch (err: any) {
        if (aborted) return;
        console.error('Submission PDF fetch error:', err);
        setError(`Failed to load PDF: ${err.message}`);
        setLoading(false);
      }
    };

    fetchPdf();
    return () => { 
      aborted = true; 
    };
  }, [pdfUrl]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  const onDocumentLoadSuccess = useCallback(async ({ numPages: pdfPageCount }: { numPages: number }) => {
    console.log('Submission PDF loaded successfully:', pdfPageCount, 'pages');
    setActualNumPages(pdfPageCount); // Update with actual PDF page count
    setLoading(false);
    setError(null);
    
    // Update the backend with the correct page count if it's different from the initial value
    if (submissionId && pdfPageCount !== numPages) {
      try {
        const { api } = await import('@/services/api');
        await api.patch(`/api/assignments/submissions/${submissionId}/pages/`, {
          num_pages: pdfPageCount
        });
        console.log(`Updated submission ${submissionId} to have ${pdfPageCount} pages`);
      } catch (error) {
        console.error('Error updating submission page count:', error);
      }
    }
  }, [submissionId, numPages]);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('Submission PDF load error:', error);
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  }, []);

  const handlePageToggle = (questionId: number, pageNumber: number) => {
    onOutlineChange(
      submissionOutline.map(item => {
        if (item.question_id === questionId) {
          const isSelected = item.page_numbers.includes(pageNumber);
          return {
            ...item,
            page_numbers: isSelected 
              ? item.page_numbers.filter(p => p !== pageNumber)
              : [...item.page_numbers, pageNumber].sort()
          };
        }
        return item;
      })
    );
  };

  const getQuestionOutline = (questionId: number) => {
    return submissionOutline.find(item => item.question_id === questionId);
  };

  const isPageSelected = (questionId: number, pageNumber: number) => {
    const outline = getQuestionOutline(questionId);
    return outline?.page_numbers.includes(pageNumber) || false;
  };

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
            {/* Center controls */}
            <HStack gap={1}>
              <Button size="sm" variant="outline" onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}>
                قبلی
              </Button>
              <Text fontSize="sm" minW="80px" textAlign="center">
                {pageNumber} / {actualNumPages}
              </Text>
              <Button size="sm" variant="outline" onClick={() => setPageNumber(Math.min(actualNumPages, pageNumber + 1))}>
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

        {/* PDF Viewer - Single Page with Navigation */}
        <Box position="relative" h="calc(100% - 60px)" overflow="auto">
          <Box position="relative" display="inline-block" style={{ position: 'relative' }}>
            {pdfBlobUrl ? (
              <Document
                key={`submission-pdf-${pdfUrl}-${pdfBlobUrl}`}
                file={pdfBlobUrl}
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

      {/* Right Panel - Question Page Mapping */}
      <Box w="400px" bg="gray.100" borderRadius="lg" p={4} boxShadow="md">
        <VStack align="stretch" gap={4} h="100%">
          {/* Header */}
          <Text fontSize="lg" fontWeight="bold" color="gray.800">
            تعیین صفحات سوالات
          </Text>

          {/* Current Page Info */}
          <Box bg="blue.50" p={3} borderRadius="md">
            <VStack gap={2}>
              <Text fontSize="sm" color="blue.600" fontWeight="medium">
                صفحه فعلی: {pageNumber} از {actualNumPages}
              </Text>
              <Button
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={() => {
                  // Find questions that don't have the current page selected and select it
                  const updatedOutline = submissionOutline.map(item => {
                    if (!item.page_numbers.includes(pageNumber)) {
                      return {
                        ...item,
                        page_numbers: [...item.page_numbers, pageNumber].sort()
                      };
                    }
                    return item;
                  });
                  onOutlineChange(updatedOutline);
                }}
              >
                انتخاب صفحه فعلی برای همه سوالات
              </Button>
            </VStack>
          </Box>

          {/* Questions List */}
          <VStack align="stretch" gap={3} flex="1" overflowY="auto">
            {questions.length === 0 ? (
              <Box p={6} textAlign="center" bg="yellow.50" borderRadius="lg" border="1px solid" borderColor="yellow.200">
                <Text color="yellow.700" fontSize="lg" fontWeight="medium">
                  هیچ سوالی برای این تکلیف تعریف نشده است
                </Text>
                <Text color="yellow.600" fontSize="sm" mt={2}>
                  لطفاً ابتدا طرح کلی تکلیف را در صفحه Outline تعریف کنید
                </Text>
              </Box>
            ) : (
              questions.map((question, index) => {
                const questionOutline = getQuestionOutline(question.id);
                const selectedPages = questionOutline?.page_numbers || [];

                return (
                  <Box
                    key={question.id}
                    p={4}
                    bg="white"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                    boxShadow="sm"
                  >
                    <VStack align="stretch" gap={3}>
                      {/* Question Header */}
                      <HStack justify="space-between" align="center">
                        <VStack align="stretch" gap={1}>
                          <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                            سوال {index + 1}: {question.title}
                          </Text>
                          <Text fontSize="sm" color="blue.600" fontWeight="medium">
                            {question.max_points} نمره
                          </Text>
                        </VStack>
                        <HStack gap={1}>
                          {selectedPages.length > 0 ? (
                            <>
                              <Icon as={FiCheck} color="green.500" />
                              <Text fontSize="sm" color="green.600" fontWeight="medium">
                                {selectedPages.length} صفحه انتخاب شده
                              </Text>
                            </>
                          ) : (
                            <Text fontSize="sm" color="gray.500" fontWeight="medium">
                              هیچ صفحه‌ای انتخاب نشده
                            </Text>
                          )}
                        </HStack>
                      </HStack>

                      {/* Page Selection */}
                      <VStack align="stretch" gap={2}>
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">
                          صفحات مربوط به این سوال را انتخاب کنید:
                        </Text>
                        <Box
                          display="grid"
                          gridTemplateColumns="repeat(auto-fill, minmax(40px, 1fr))"
                          gap={2}
                          p={3}
                          bg="gray.50"
                          borderRadius="md"
                          maxH="200px"
                          overflowY="auto"
                        >
                          {Array.from({ length: actualNumPages }, (_, i) => {
                            const pageNum = i + 1;
                            const isSelected = isPageSelected(question.id, pageNum);
                            
                            return (
                              <Button
                                key={pageNum}
                                size="sm"
                                variant={isSelected ? "solid" : "outline"}
                                colorScheme={isSelected ? "blue" : "gray"}
                                onClick={() => handlePageToggle(question.id, pageNum)}
                                minW="40px"
                                h="40px"
                                fontSize="xs"
                                fontWeight={isSelected ? "bold" : "normal"}
                                _hover={{
                                  transform: "scale(1.05)",
                                  transition: "transform 0.2s"
                                }}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </Box>
                      </VStack>
                    </VStack>
                  </Box>
                );
              })
            )}
          </VStack>

          {/* Action Buttons */}
          <VStack gap={2}>
            <Button
              bg="blue.500"
              color="white"
              _hover={{ bg: "blue.600" }}
              w="100%"
              onClick={onSave}
              loading={isSaving}
              loadingText="در حال ذخیره..."
            >
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

export default SubmissionPDFViewer;
