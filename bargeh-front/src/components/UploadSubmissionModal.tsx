import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Icon,
  Spinner,
} from '@chakra-ui/react';
import { FiUpload, FiX, FiInfo } from 'react-icons/fi';
import { useColorModeValue } from '@/hooks/useColorMode';

interface Student {
  id: number;
  name: string;
  email: string;
}

interface UploadSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (studentId: number | null, file: File) => Promise<void>;
  students: Student[];
  isUploading: boolean;
}

const UploadSubmissionModal: React.FC<UploadSubmissionModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  students,
  isUploading,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const infoBg = useColorModeValue("blue.50", "blue.900");
  const infoText = useColorModeValue("blue.700", "blue.200");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await onUpload(selectedStudent, selectedFile);
      // Reset form
      setSelectedStudent(null);
      setSelectedFile(null);
      setFileName('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedStudent(null);
    setSelectedFile(null);
    setFileName('');
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
    >
      <Box
        bg={bgColor}
        borderRadius="lg"
        boxShadow="xl"
        maxW="500px"
        w="90%"
        p={0}
      >
        <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              آپلود ارسال
            </Text>
            <Button variant="ghost" size="sm" p={1} onClick={handleClose}>
              <Icon as={FiX} />
            </Button>
          </HStack>
        </Box>

        <Box p={6}>
          <VStack align="stretch" gap={4}>
            {/* Info Banner */}
            <Box
              bg={infoBg}
              p={3}
              borderRadius="md"
              border="1px solid"
              borderColor={useColorModeValue("blue.200", "blue.700")}
            >
              <HStack align="start" gap={2}>
                <Icon as={FiInfo} color={infoText} mt={0.5} />
                <Text fontSize="sm" color={infoText}>
                  آپلود ارسال برای یک دانشجو
                </Text>
              </HStack>
            </Box>

            {/* Required field note */}
            <Text fontSize="sm" color="red.500">
              * فیلد اجباری
            </Text>

            {/* Student Selection */}
            <VStack align="stretch" gap={2}>
              <Text color={textColor} fontSize="sm" fontWeight="medium">
                دانشجو <Text as="span" color="red.500">*</Text>
              </Text>
              <select
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '12px',
                  width: '100%',
                  fontSize: '14px',
                  color: '#2d3748'
                }}
                value={selectedStudent || ''}
                onChange={(e) => setSelectedStudent(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">انتخاب دانشجو</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </VStack>

            {/* File Upload */}
            <VStack align="stretch" gap={2}>
              <Text color={textColor} fontSize="sm" fontWeight="medium">
                فایل PDF ارسال <Text as="span" color="red.500">*</Text>
              </Text>
              <Box
                border="2px dashed"
                borderColor={borderColor}
                borderRadius="md"
                p={4}
                textAlign="center"
                cursor="pointer"
                _hover={{ borderColor: "blue.400", bg: useColorModeValue("blue.50", "blue.900") }}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <VStack gap={2}>
                  <Icon as={FiUpload} boxSize={6} color="gray.500" />
                  <Text color="gray.600" fontSize="sm">
                    {fileName || 'لطفاً فایل را انتخاب کنید'}
                  </Text>
                  <Button
                    size="sm"
                    bg="#2E5BBA"
                    color="white"
                    _hover={{ bg: "#1E4A9A" }}
                    border="1px solid"
                    borderColor="#2E5BBA"
                  >
                    انتخاب فایل
                  </Button>
                </VStack>
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </Box>
            </VStack>
          </VStack>
        </Box>

        <Box p={6} borderTop="1px solid" borderColor={borderColor}>
          <HStack justify="flex-end" gap={3}>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
              borderColor={borderColor}
              color={textColor}
            >
              انصراف
            </Button>
            <Button
              bg="#2E5BBA"
              color="white"
              _hover={{ bg: "#1E4A9A" }}
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <HStack gap={2}>
                  <Spinner size="sm" />
                  <Text>در حال آپلود...</Text>
                </HStack>
              ) : (
                'آپلود'
              )}
            </Button>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
};

export default UploadSubmissionModal;
