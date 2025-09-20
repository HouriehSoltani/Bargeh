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
    term?: string;
    year?: number;
  }) => void;
}

const CreateCoursePopup = ({ isOpen, onClose, onSubmit }: CreateCoursePopupProps) => {
  const [courseNumber, setCourseNumber] = useState("");
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [term, setTerm] = useState("summer");
  const [year, setYear] = useState(1404);
  const [errors, setErrors] = useState<{ courseNumber?: string; courseName?: string } | null>(null);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.800", "white");
  const overlayBg = useColorModeValue("rgba(0, 0, 0, 0.4)", "rgba(0, 0, 0, 0.6)");
  
  // CSS color values for inline styles
  const cssBgColor = useColorModeValue("#ffffff", "#1a202c");
  const cssBorderColor = useColorModeValue("#e2e8f0", "#4a5568");
  const cssTextColor = useColorModeValue("#2d3748", "#ffffff");


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
    setTerm("spring");
    setYear(1403);
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
      term: term,
      year: year,
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
      zIndex={100}
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

            <HStack gap={4}>
              <VStack  align="stretch" gap={2} flex={1}>
                <Box as="label" fontWeight="medium" color={textColor}>ترم</Box>
                <select
                  value={term} 
                  onChange={(e) => setTerm(e.target.value)}
                  style={{
                    color: cssTextColor,
                    backgroundColor: cssBgColor,
                    border: `1px solid ${cssBorderColor}`,
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    width: '100%',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3182ce';
                    e.target.style.boxShadow = '0 0 0 1px #3182ce';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = cssBorderColor;
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="fall">پاییز</option>
                  <option value="winter">زمستان</option>
                  <option value="spring">بهار</option>
                  <option value="summer">تابستان</option>
                </select>
              </VStack>

              <VStack align="stretch" gap={2} flex={1}>
                <Box as="label" fontWeight="medium" color={textColor}>سال</Box>
                <select
                  value={year} 
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  style={{
                    color: cssTextColor,
                    backgroundColor: cssBgColor,
                    border: `1px solid ${cssBorderColor}`,
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    width: '100%',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3182ce';
                    e.target.style.boxShadow = '0 0 0 1px #3182ce';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = cssBorderColor;
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value={1403}>1403</option>
                  <option value={1404}>1404</option>
                  <option value={1405}>1405</option>
                  <option value={1406}>1406</option>
                  <option value={1407}>1407</option>
                </select>
              </VStack>
            </HStack>
            
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
