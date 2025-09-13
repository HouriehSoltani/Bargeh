import { Box, Button, Heading, Input, Textarea, VStack, HStack } from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { useState, useEffect } from "react";

interface CreateCoursePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (values: {
    title: string;
    code: string;
    description?: string;
  }) => void;
}

const CreateCoursePopup = ({ isOpen, onClose, onSubmit }: CreateCoursePopupProps) => {
  const [courseNumber, setCourseNumber] = useState("");
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ courseNumber?: string; courseName?: string } | null>(null);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.800", "white");
  const overlayBg = useColorModeValue("rgba(0, 0, 0, 0.4)", "rgba(0, 0, 0, 0.6)");


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
    // Reset form
    setCourseNumber("");
    setCourseName("");
    setDescription("");
    setErrors(null);
    onClose();
  };

  const handleSubmit = () => {
    const nextErrors: { courseNumber?: string; courseName?: string } = {};
    if (!courseNumber.trim()) nextErrors.courseNumber = "شماره درس الزامی است";
    if (!courseName.trim()) nextErrors.courseName = "نام درس الزامی است";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors(null);
    onSubmit?.({
      title: courseName.trim(),
      code: courseNumber.trim(),
      description: description.trim() || undefined,
    });
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg={overlayBg}
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      onClick={handleClose}
    >
      <Box
        bg={bgColor}
        borderRadius="lg"
        boxShadow="2xl"
        maxW="720px"
        w="100%"
        maxH="90vh"
        overflowY="auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Box p={4} borderBottom="1px" borderColor={borderColor} bg="blue.50">
          <Heading size="md" color={textColor}>ایجاد درس جدید</Heading>
        </Box>
        
        {/* Form Content */}
        <Box p={6}>
          <VStack align="stretch" gap={4}>
            <VStack align="stretch" gap={2}>
              <Box as="label" fontWeight="medium" color={textColor}>شماره درس</Box>
              <Input 
                padding={2}                
                value={courseNumber} 
                onChange={(e) => setCourseNumber(e.target.value)} 
                placeholder="مثلاً: 1740028 "
                color={textColor}
              />
              {errors?.courseNumber && <Box color="red.500" fontSize="sm">{errors.courseNumber}</Box>}
            </VStack>
            
            <VStack align="stretch" gap={2}>
              <Box as="label" fontWeight="medium" color={textColor}>نام درس</Box>
            <Input
                padding={2}                
                value={courseName} 
                onChange={(e) => setCourseName(e.target.value)} 
                placeholder="مثلاً: مبانی برنامه نویسی"
                color={textColor}
              />
              {errors?.courseName && <Box color="red.500" fontSize="sm">{errors.courseName}</Box>}
            </VStack>
            
            <VStack align="stretch" gap={2}>
              <Box as="label" fontWeight="medium" color={textColor}>توضیحات درس</Box>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                color={textColor}
                rows={3}
              />
            </VStack>
            
            <HStack justify="flex-end" gap={3} pt={2}>
              <Button paddingX={2} variant="outline" onClick={handleClose} color={textColor}>
                انصراف
              </Button>
              <Button paddingX={2} colorScheme="teal" onClick={handleSubmit}>
                ایجاد درس
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateCoursePopup;
