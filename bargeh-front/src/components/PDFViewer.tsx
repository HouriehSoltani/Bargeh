import React, { useState } from 'react';
import { Box, VStack, Text, Button, HStack, Spinner } from '@chakra-ui/react';
import { useColorModeValue } from '@/hooks/useColorMode';
import { FiExternalLink, FiRefreshCw } from 'react-icons/fi';

interface PDFViewerProps {
  pdfUrl?: string;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
  children?: React.ReactNode;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  children,
}) => {
  const bgColor = useColorModeValue("white", "gray.900");
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Debug: Log PDF URL
  React.useEffect(() => {
    console.log('PDFViewer received URL:', pdfUrl);
    setPdfLoadError(false); // Reset error state when URL changes
    setIsLoading(true); // Reset loading state when URL changes
  }, [pdfUrl]);

  const handleRetry = () => {
    setPdfLoadError(false);
    setRetryCount(prev => prev + 1);
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
    >
      {pdfUrl ? (
        <Box
          w="100%"
          h="100%"
          bg={bgColor}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {pdfUrl.startsWith('blob:') ? (
            // For blob URLs, use object tag
            <object
              data={pdfUrl}
              type="application/pdf"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            >
              <embed
                src={pdfUrl}
                type="application/pdf"
                width="100%"
                height="100%"
              />
              <Text color="gray.500" fontSize="sm" mt={4}>
                PDF viewer not supported. <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#4A90E2' }}>Click to open PDF</a>
              </Text>
            </object>
          ) : pdfLoadError ? (
            // Show error state with retry option
            <VStack gap={4} p={8}>
              <Text color="red.500" fontSize="lg" fontWeight="semibold">
                PDF failed to load
              </Text>
              <Text color="gray.600" fontSize="sm" textAlign="center">
                The PDF cannot be displayed in the browser due to security restrictions.
              </Text>
              <HStack gap={4}>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={handleRetry}
                >
                  <FiRefreshCw style={{ marginRight: '8px' }} />
                  Retry
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(pdfUrl, '_blank')}
                >
                  <FiExternalLink style={{ marginRight: '8px' }} />
                  Open in New Tab
                </Button>
              </HStack>
            </VStack>
          ) : (
            // For regular URLs, use iframe with fallback
            <>
              {isLoading && (
                <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" zIndex={10}>
                  <VStack gap={2}>
                    <Spinner size="lg" color="blue.500" />
                    <Text fontSize="sm" color="gray.600">Loading PDF...</Text>
                  </VStack>
                </Box>
              )}
              <iframe
                key={retryCount} // Force re-render on retry
                src={pdfUrl}
                width="100%"
                height="100%"
                style={{ border: 'none', opacity: isLoading ? 0 : 1 }}
                title="Assignment PDF"
                onError={() => {
                  console.log('PDF failed to load in iframe');
                  setPdfLoadError(true);
                  setIsLoading(false);
                }}
                onLoad={() => {
                  console.log('PDF loaded successfully');
                  setPdfLoadError(false);
                  setIsLoading(false);
                }}
              />
            </>
          )}
          
          {/* Fallback link for when iframe fails */}
          {!pdfLoadError && (
            <Box position="absolute" bottom={4} right={4} bg="white" p={2} borderRadius="md" boxShadow="md">
              <Text fontSize="xs" color="gray.600">
                PDF not loading?{' '}
                <a 
                  href={pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ color: '#4A90E2', textDecoration: 'underline' }}
                >
                  Open in new tab
                </a>
              </Text>
            </Box>
          )}
        </Box>
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
              {pdfUrl ? 'Loading PDF...' : 'No PDF uploaded for this assignment'}
            </Text>
          </VStack>
        </Box>
      )}
      
      {/* Overlay for interactive elements */}
      {children}
    </Box>
  );
};

export default PDFViewer;
