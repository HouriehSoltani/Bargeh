import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Icon,
} from '@chakra-ui/react';
import { useColorModeValue } from '@/hooks/useColorMode';
import { FiUpload, FiX, FiCheck } from 'react-icons/fi';
import { api } from '@/services/api';

interface StudentUploadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentTitle: string;
  assignmentId: number;
  onUploadSuccess: (file: File) => void;
  isUpdating?: boolean; // Added isUpdating prop
}

const StudentUploadPopup: React.FC<StudentUploadPopupProps> = ({
  isOpen,
  onClose,
  assignmentTitle,
  assignmentId,
  onUploadSuccess,
  isUpdating = false, // Default to false for new uploads
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const subtleText = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const boxBg = useColorModeValue("gray.50", "gray.700");
  const dropZoneBg = useColorModeValue("blue.50", "blue.900");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setUploadError(null);
      } else {
        setUploadError('لطفاً فقط فایل PDF انتخاب کنید');
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      console.log('Uploading file:', selectedFile.name, 'to assignment:', assignmentId);
      console.log('FormData contents:', Array.from(formData.entries()));
      console.log('Is updating existing submission:', isUpdating);

      // Upload to backend - use PUT for updates, POST for new uploads
      const httpMethod = isUpdating ? api.put : api.post;
      console.log('Using HTTP method:', isUpdating ? 'PUT' : 'POST');
      const response = await httpMethod(`/api/assignments/${assignmentId}/submissions/student/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload successful:', (response as any).data);
      
      // Call success callback with the file
      onUploadSuccess(selectedFile);
      
      // Close popup
      onClose();
      
      // Reset state
      setSelectedFile(null);
      setUploadError(null);
    } catch (error: any) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      let errorMessage = 'خطا در آپلود فایل';
      
      if (error.response?.data?.error) {
        if (error.response.data.error.includes('already have a submission')) {
          errorMessage = 'شما قبلاً برای این تکلیف ارسال کرده‌اید. برای تغییر فایل، از دکمه "ویرایش" استفاده کنید.';
        } else {
          errorMessage = error.response.data.error;
        }
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadError(null);
    onClose();
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
              آپلود پاسخ تکلیف
            </Text>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
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
              bg={boxBg}
              borderRadius="md"
              border="1px solid"
              borderColor={borderColor}
            >
              <Text color={textColor} fontWeight="medium" fontSize="md">
                {assignmentTitle}
              </Text>
            </Box>

            {/* File Upload Area */}
            <Box
              p={6}
              border="2px dashed"
              borderColor={selectedFile ? "green.300" : "gray.300"}
              borderRadius="md"
              bg={selectedFile ? "green.50" : boxBg}
              textAlign="center"
              cursor="pointer"
              _hover={{ borderColor: "blue.400" }}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              
              {selectedFile ? (
                <VStack gap={2}>
                  <Icon as={FiCheck} color="green.500" boxSize={8} />
                  <Text color="green.600" fontWeight="medium">
                    فایل انتخاب شده
                  </Text>
                  <Text color="green.500" fontSize="sm">
                    {selectedFile.name}
                  </Text>
                </VStack>
              ) : (
                <VStack gap={2}>
                  <Icon as={FiUpload} color="gray.400" boxSize={8} />
                  <Text color={subtleText} fontWeight="medium">
                    فایل PDF خود را انتخاب کنید
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    یا اینجا کلیک کنید
                  </Text>
                </VStack>
              )}
            </Box>

            {/* Error Message */}
            {uploadError && (
              <Box
                p={3}
                bg="red.50"
                border="1px solid"
                borderColor="red.200"
                borderRadius="md"
              >
                <HStack gap={2}>
                  <Icon as={FiX} color="red.500" boxSize={4} />
                  <Text fontSize="sm" color="red.600">{uploadError}</Text>
                </HStack>
              </Box>
            )}

            {/* Instructions */}
            <Box
              p={3}
              bg={dropZoneBg}
              borderRadius="md"
            >
              <Text color="blue.600" fontSize="sm" lineHeight="1.6">
                پس از آپلود فایل، به صفحه تعیین صفحات سوالات منتقل خواهید شد.
              </Text>
            </Box>
          </VStack>
        </Box>

        {/* Footer */}
        <Box p={6} borderTop="1px solid" borderColor={borderColor}>
          <HStack gap={3}>
            <Button
              variant="outline"
              onClick={handleClose}
              size="sm"
              disabled={isUploading}
            >
              انصراف
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleUpload}
              size="sm"
              disabled={!selectedFile || isUploading}
              loading={isUploading}
              loadingText="در حال آپلود..."
            >
              <Icon as={FiUpload} mr={1} />
              آپلود و ادامه
            </Button>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
};

export default StudentUploadPopup;
