import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Text,
  Icon,
  createToaster,
  Badge,
} from '@chakra-ui/react';
import { FiAlertTriangle, FiBook, FiUser, FiHash } from 'react-icons/fi';
import { useColorModeValue } from '@/hooks/useColorMode';
import { useCourses } from '@/hooks/useCourses';

interface UnenrollCoursePopupProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  courseTitle: string;
  courseCode: string;
  instructor: string;
}

const UnenrollCoursePopup: React.FC<UnenrollCoursePopupProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  courseCode,
  instructor,
}) => {
  const navigate = useNavigate();
  const toast = createToaster({ placement: "top" });
  const [isLoading, setIsLoading] = useState(false);
  const { unenrollFromCourse } = useCourses();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const overlayBg = useColorModeValue('rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.6)');

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsLoading(false);
    onClose();
  };

  const handleUnenroll = async () => {
    try {
      setIsLoading(true);
      await unenrollFromCourse(courseId);
      
      toast.create({
        title: 'انصراف موفق',
        description: `با موفقیت از درس "${courseTitle}" انصراف دادید`,
        type: 'success',
        duration: 5000,
      });

      handleClose();
      // Navigate back to home page
      navigate('/');
    } catch (error: any) {
      console.error('Failed to unenroll:', error);
      toast.create({
        title: 'خطا در انصراف',
        description: error?.response?.data?.detail || 'خطا در انصراف از درس',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg={overlayBg}
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={9999}
      style={{ zIndex: 9999 }}
      p={4}
    >
      <Box
        bg={bgColor}
        borderRadius="lg"
        boxShadow="2xl"
        w="full"
        maxW="500px"
        border="1px solid"
        borderColor={borderColor}
        overflow="hidden"
        position="relative"
        zIndex={10000}
      >
        {/* Header */}
        <Box
          bg="red.50"
          borderColor={borderColor}
          p={4}
          textAlign="center"
        >
          <VStack gap={3}>
            <Box
              bg="red.100"
              color="red.600"
              p={3}
              borderRadius="full"
              w="60px"
              h="60px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="24px"
            >
              <Icon as={FiAlertTriangle} />
            </Box>
            <Heading size="lg" color={textColor}>
              انصراف از درس
            </Heading>
            <Text fontSize="sm" color="gray.600">
                  پس از انصراف، دسترسی شما به این درس و تکالیف آن قطع خواهد شد.

            </Text>
          </VStack>
        </Box>

        {/* Content */}
        <Box p={6}>
          <VStack gap={6} align="stretch">
            {/* Course Info Card */}
            <Box
              bg={useColorModeValue('gray.50', 'gray.700')}
              p={6}
              borderRadius="xl"
              border="1px solid"
              borderColor={useColorModeValue('gray.200', 'gray.600')}
              position="relative"
              overflow="hidden"
            >
              
              <VStack gap={4} align="stretch" position="relative" zIndex={1}>
                <HStack gap={3} align="center">
                  <Icon as={FiBook} color="blue.500" fontSize="20px" />
                  <Text fontSize="xl" fontWeight="bold" color={textColor}>
                    {courseTitle}
                  </Text>
                </HStack>
                
                <HStack gap={4} wrap="wrap">
                  <HStack gap={2}>
                    <Icon as={FiHash} color="gray.500" fontSize="16px" />
                    <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
                      {courseCode}
                    </Badge>
                  </HStack>
                  
                  <HStack gap={2}>
                    <Icon as={FiUser} color="gray.500" fontSize="16px" />
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      {instructor}
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
            </Box>

            
            {/* Action Buttons */}
            <HStack justify="flex-end" gap={3} pt={2}>
                          <Button
                paddingX={2}
                variant="outline"
                onClick={handleClose}
                color={textColor}
                disabled={isLoading}
              >
                بازگشت
              </Button>
                          <Button
                paddingX={2}
                colorScheme="red"
                loading={isLoading}
                loadingText="در حال انصراف..."
                onClick={handleUnenroll}
              >
                تایید 
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Box>,
    document.body
  );
};

export default UnenrollCoursePopup;
