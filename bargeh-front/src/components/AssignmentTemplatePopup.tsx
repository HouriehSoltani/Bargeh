import React from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Icon,
  Spinner,
} from '@chakra-ui/react';
import { useColorModeValue } from '@/hooks/useColorMode';
import { FiDownload, FiFile, FiX } from 'react-icons/fi';

interface AssignmentTemplatePopupProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentTitle: string;
  templateUrl?: string;
  isLoading?: boolean;
  error?: string;
}

const AssignmentTemplatePopup: React.FC<AssignmentTemplatePopupProps> = ({
  isOpen,
  onClose,
  assignmentTitle,
  templateUrl,
  isLoading = false,
  error,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const subtleText = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const handleDownload = () => {
    if (templateUrl) {
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = templateUrl.startsWith('http') 
        ? templateUrl 
        : `http://localhost:8000${templateUrl}`;
      link.download = `template_${assignmentTitle.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="blackAlpha.600"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        bg={bgColor}
        borderRadius="lg"
        maxW="500px"
        w="100%"
        maxH="90vh"
        overflowY="auto"
        boxShadow="xl"
      >
        {/* Header */}
        <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
          <HStack justify="space-between" align="center">
            <Text color={textColor} fontSize="lg" fontWeight="bold">
              دانلود قالب تکلیف
            </Text>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              p={1}
              minW="auto"
              h="auto"
            >
              <Icon as={FiX} boxSize={4} />
            </Button>
          </HStack>
        </Box>

        {/* Body */}
        <Box p={6}>
          <VStack align="stretch" gap={4}>
            {/* Assignment Title */}
            <Box
              p={4}
              bg={useColorModeValue("gray.50", "gray.700")}
              borderRadius="md"
              border="1px solid"
              borderColor={borderColor}
            >
              <Text color={textColor} fontWeight="medium" fontSize="md">
                {assignmentTitle}
              </Text>
            </Box>

            {/* Loading State */}
            {isLoading && (
              <VStack gap={3}>
                <Spinner size="lg" color="blue.500" />
                <Text color={subtleText}>در حال بارگذاری ...</Text>
              </VStack>
            )}

            {/* Error State */}
            {error && (
              <Box
                p={3}
                bg="red.50"
                border="1px solid"
                borderColor="red.200"
                borderRadius="md"
              >
                <HStack gap={2}>
                  <Icon as={FiX} color="red.500" boxSize={4} />
                  <Text fontSize="sm" color="red.600">{error}</Text>
                </HStack>
              </Box>
            )}

            {/* Template Available */}
            {!isLoading && !error && templateUrl && (
              <VStack align="stretch" gap={4}>
                <HStack gap={3} p={3} bg={useColorModeValue("blue.50", "blue.900")} borderRadius="md">
                  <Icon as={FiFile} color="blue.500" boxSize={5} />
                  <VStack align="start" gap={1} flex={1}>
                    <Text color="blue.600" fontWeight="medium" fontSize="sm">
                      قالب تکلیف آماده است
                    </Text>
                    <Text color="blue.500" fontSize="xs">
                      فایل PDF برای دانلود آماده است
                    </Text>
                  </VStack>
                </HStack>

                <Box
                  p={3}
                  bg={useColorModeValue("gray.50", "gray.700")}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={borderColor}
                >
                  <Text color={subtleText} fontSize="sm" lineHeight="1.6">
                    برای شروع تکلیف، ابتدا آن را دانلود کنید. این فایل شامل دستورالعمل‌ها و ساختار مورد نیاز برای تکمیل تکلیف است.
                  </Text>
                </Box>
              </VStack>
            )}

            {/* No Template Available */}
            {!isLoading && !error && !templateUrl && (
              <VStack gap={3}>
                <Icon as={FiFile} color="gray.400" boxSize={8} />
                <Text color={subtleText} textAlign="center">
                  قالب تکلیف هنوز توسط استاد آپلود نشده است
                </Text>
              </VStack>
            )}
          </VStack>
        </Box>

        {/* Footer */}
        <Box p={6} borderTop="1px solid" borderColor={borderColor}>
          <HStack gap={3}>
                      <Button
                          paddingX={4}
              variant="outline"
              onClick={onClose}
              size="sm"
            >
              انصراف
            </Button>
            {templateUrl && (
                          <Button
                              paddingX={2}
                bg="blue.500"
                color="white"
                _hover={{ bg: "blue.600" }}
                onClick={handleDownload}
                size="sm"
              >
                <Icon as={FiDownload} mr={1} />
                دانلود قالب
              </Button>
            )}
          </HStack>
        </Box>
      </Box>
    </Box>
  );
};

export default AssignmentTemplatePopup;
