import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box, VStack, Text, Button, HStack, Spinner, IconButton, Icon } from '@chakra-ui/react';
import { useColorModeValue } from '@/hooks/useColorMode';
import { FiExternalLink, FiRefreshCw, FiZoomIn, FiZoomOut, FiRotateCw } from 'react-icons/fi';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// Add basic CSS for PDF pages
const pdfStyles = `
  .pdf-page {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin: 0 auto;
  }
  .react-pdf__Page {
    margin: 0 auto;
  }
  .react-pdf__Page__canvas {
    display: block;
    margin: 0 auto;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = pdfStyles;
  document.head.appendChild(styleSheet);
}

interface PDFViewerV2Props {
  pdfUrl?: string;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
  children?: React.ReactNode;
}

const PDFViewerV2: React.FC<PDFViewerV2Props> = ({
  pdfUrl,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  children,
}) => {
  const bgColor = useColorModeValue("white", "gray.900");
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  // Debug: Log PDF URL changes
  React.useEffect(() => {
    console.log('PDFViewerV2 received URL:', pdfUrl);
    if (pdfUrl) {
      setLoading(true);
      setError(null);
      setPageNumber(1);
      setNumPages(null);
      setUseFallback(false); // Reset fallback state
      
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.log('PDF loading timeout after 5 seconds, switching to fallback');
        setUseFallback(true);
        setLoading(false);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [pdfUrl]);

  // Debug: Log state changes
  React.useEffect(() => {
    console.log('PDFViewerV2 state:', { loading, error, useFallback, pageNumber, numPages });
  }, [loading, error, useFallback, pageNumber, numPages]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    console.log('PDF loaded successfully, pages:', numPages);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error);
    console.error('PDF URL was:', pdfUrl);
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
    // Try fallback iframe method
    setUseFallback(true);
  }, [pdfUrl]);

  const onPageLoadSuccess = useCallback(() => {
    console.log('Page loaded successfully');
  }, []);

  const onPageLoadError = useCallback((error: Error) => {
    console.error('Page load error:', error);
    setError('Failed to load page');
  }, []);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handlePreviousPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setPageNumber(1);
    setScale(1.0);
    setRotation(0);
    setUseFallback(false);
  };

  return (
    <Box
      w="100%"
      h="100%"
      bg="gray.100"
      position="relative"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      borderRadius="md"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      {pdfUrl ? (
        <>
          {/* PDF Controls */}
          <Box
            bg={bgColor}
            p={2}
            borderBottom="1px solid"
            borderColor="gray.200"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexShrink={0}
          >
            <HStack gap={2}>
              <IconButton
                size="sm"
                variant="outline"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                aria-label="Zoom Out"
              >
                <FiZoomOut />
              </IconButton>
              <Text fontSize="sm" minW="60px" textAlign="center">
                {Math.round(scale * 100)}%
              </Text>
              <IconButton
                size="sm"
                variant="outline"
                onClick={handleZoomIn}
                disabled={scale >= 3.0}
                aria-label="Zoom In"
              >
                <FiZoomIn />
              </IconButton>
              <IconButton
                size="sm"
                variant="outline"
                onClick={handleRotate}
                aria-label="Rotate"
              >
                <FiRotateCw />
              </IconButton>
            </HStack>

            <HStack gap={2}>
              <Button
                size="sm"
                variant="outline"
                onClick={handlePreviousPage}
                disabled={pageNumber <= 1}
              >
                Previous
              </Button>
              <Text fontSize="sm">
                {pageNumber} / {numPages || '?'}
              </Text>
              <Button
                size="sm"
                variant="outline"
                onClick={handleNextPage}
                disabled={pageNumber >= (numPages || 1)}
              >
                Next
              </Button>
            </HStack>

            <HStack gap={2}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(pdfUrl, '_blank')}
              >
                <Icon as={FiExternalLink} mr={2} />
                Open in New Tab
              </Button>
            </HStack>
          </Box>

          {/* PDF Content */}
          <Box
            flex="1"
            overflow="auto"
            bg="white"
            display="flex"
            justifyContent="center"
            alignItems="flex-start"
            p={4}
          >
            {loading && (
              <VStack gap={4} p={8}>
                <Spinner size="lg" color="blue.500" />
                <Text fontSize="sm" color="gray.600">Loading PDF...</Text>
              </VStack>
            )}

            {error && (
              <VStack gap={4} p={8}>
                <Text color="red.500" fontSize="lg" fontWeight="semibold">
                  {error}
                </Text>
                <HStack gap={4}>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={handleRetry}
                  >
                    <Icon as={FiRefreshCw} mr={2} />
                    Retry
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(pdfUrl, '_blank')}
                  >
                    <Icon as={FiExternalLink} mr={2} />
                    Open in New Tab
                  </Button>
                </HStack>
              </VStack>
            )}

            {!loading && !error && !useFallback && (
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <VStack gap={2}>
                    <Spinner size="lg" color="blue.500" />
                    <Text fontSize="sm" color="gray.600">Loading PDF...</Text>
                  </VStack>
                }
                error={
                  <VStack gap={4} p={8}>
                    <Text color="red.500" fontSize="lg" fontWeight="semibold">
                      Failed to load PDF
                    </Text>
                    <HStack gap={2}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={handleRetry}
                      >
                        <Icon as={FiRefreshCw} mr={2} />
                        Retry
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="green"
                        onClick={() => window.open(pdfUrl, '_blank')}
                      >
                        <Icon as={FiExternalLink} mr={2} />
                        Open in New Tab
                      </Button>
                    </HStack>
                  </VStack>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  onLoadSuccess={onPageLoadSuccess}
                  onLoadError={onPageLoadError}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="pdf-page"
                />
              </Document>
            )}

        {/* Fallback iframe method */}
        {useFallback && (() => {
          console.log('Rendering iframe fallback');
          return (
            <Box w="100%" h="100%">
              <Text fontSize="sm" color="blue.500" mb={2}>
                Using iframe fallback method
              </Text>
            <iframe
              src={pdfUrl}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="Assignment PDF (Fallback)"
              onLoad={() => {
                console.log('PDF loaded successfully in iframe fallback');
                setLoading(false);
                setError(null);
              }}
              onError={() => {
                console.error('PDF failed to load in iframe fallback');
                setError('PDF failed to load in both PDF.js and iframe methods');
                setLoading(false);
              }}
            />
            </Box>
          );
        })()}
          </Box>
        </>
      ) : (
        <Box
          w="100%"
          h="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="white"
          border="2px dashed"
          borderColor="gray.300"
        >
          <VStack>
            <Text fontSize="lg" color="gray.500">
              PDF Assignment
            </Text>
            <Text fontSize="sm" color="gray.400">
              No PDF uploaded for this assignment
            </Text>
          </VStack>
        </Box>
      )}
      
      {/* Overlay for interactive elements */}
      {children}
    </Box>
  );
};

export default PDFViewerV2;
