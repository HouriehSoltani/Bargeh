import { 
  Box, 
  Grid, 
  GridItem, 
  Heading, 
  VStack, 
  Button, 
  Text, 
  Icon, 
  HStack,
  Input,
  Stack
} from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { FiUpload, FiArrowRight, FiFileText, FiCheckCircle, FiCode, FiBook } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import DynamicSidebar from "@/components/DynamicSidebar";
import PersianDatePicker from "@/components/PersianDatePicker";
import { useCourse } from "@/hooks/useCourse";
import { convertEnglishTermToPersian } from "@/utils/persianDate";
import { useState, useRef } from "react";
import { assignmentService } from "@/services/assignmentService";

interface AssignmentType {
  id: string;
  name: string;
  description: string;
  icon: any;
  enabled: boolean;
}

interface FormData {
  title: string;
  templatePdf: File | null;
  anonymizedGrading: boolean;
  uploadByStudent: 'student' | 'instructor';
  dueAt: string;
  totalPoints: number;
  regradeEnabled: boolean;
}

const assignmentTypes: AssignmentType[] = [
  {
    id: 'homework',
    name: 'تکلیف',
    description: 'مجموعه تمرین‌ها و تکالیف نوشتنی',
    icon: FiBook,
    enabled: true
  },
  {
    id: 'exam_quiz',
    name: 'امتحان / کوییز',
    description: 'آزمون‌های زمان‌دار و امتحانات',
    icon: FiFileText,
    enabled: false
  },
  {
    id: 'bubble_sheet',
    name: 'آزمون تستی',
    description: 'آزمون‌های چندگزینه‌ای و برگه‌های پاسخ تستی',
    icon: FiCheckCircle,
    enabled: false
  },
  {
    id: 'programming',
    name: 'برنامه‌نویسی',
    description: 'تکالیف کدنویسی و پروژه‌های برنامه‌نویسی',
    icon: FiCode,
    enabled: false
  }
];

const CreateAssignmentMerged = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { course, isLoading, error } = useCourse(courseId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Assignment type selection state
  const [selectedType, setSelectedType] = useState<string | null>('homework');

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    templatePdf: null,
    anonymizedGrading: false,
    uploadByStudent: 'student',
    dueAt: '',
    totalPoints: 100,
    regradeEnabled: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Color mode values
  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");
  const subtleText = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const cardBg = useColorModeValue("white", "gray.800");
  const cardHover = useColorModeValue("gray.50", "gray.700");
  const selectedBg = useColorModeValue("blue.50", "blue.900");
  const selectedBorder = useColorModeValue("blue.200", "blue.700");
  const formBg = useColorModeValue("gray.100", "gray.800");
  const formBorder = useColorModeValue("gray.200", "gray.600");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const inputBorder = useColorModeValue("gray.300", "gray.600");

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleInputChange('templatePdf', file);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'نام تکلیف الزامی است';
    }

    if (!formData.templatePdf) {
      errors.templatePdf = 'فایل تکلیف الزامی است';
    }

    // Only require deadline when student uploads
    if (formData.uploadByStudent === 'student' && !formData.dueAt) {
      errors.dueAt = 'تاریخ تحویل الزامی است';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare assignment data
      const assignmentData = {
        title: formData.title,
        instructions: formData.title, // Using title as instructions for now
        total_points: formData.totalPoints,
        is_published: false,
        regrade_enabled: formData.regradeEnabled,
        due_at: formData.uploadByStudent === 'student' && formData.dueAt 
          ? new Date(formData.dueAt).toISOString() 
          : null,
        course: parseInt(courseId!)
      };

      // Create assignment using the service
      await assignmentService.createAssignment(parseInt(courseId!), assignmentData);

      navigate(`/courses/${courseId}/assignments`);
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      
      if (error.response?.data) {
        const serverErrors = error.response.data;
        const errors: Record<string, string> = {};
        
        Object.keys(serverErrors).forEach(key => {
          if (Array.isArray(serverErrors[key])) {
            errors[key] = serverErrors[key][0];
          } else {
            errors[key] = serverErrors[key];
          }
        });
        
        setValidationErrors(errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/courses/${courseId}/assignments`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <Box bg={bgColor} minH="100vh" p={6} display="flex" alignItems="center" justifyContent="center">
        <Text color={textColor}>در حال بارگذاری...</Text>
      </Box>
    );
  }

  // Show error state
  if (error || !course) {
    return (
      <Box bg={bgColor} minH="100vh" p={6} display="flex" alignItems="center" justifyContent="center">
        <VStack>
          <Text color="red.500" fontSize="lg">خطا در بارگذاری درس</Text>
          <Text color="gray.500">{error || 'درس یافت نشد'}</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Grid
      templateAreas={{ base: `"main"`, md: `"aside main"` }}
      templateColumns={{ base: "1fr", md: "250px 1fr" }}
      templateRows={{ base: "1fr", md: "1fr" }}
      minH="100vh"
      gap={0}
      alignItems="stretch"
      h="auto"
    >
      <GridItem area="aside" display={{ base: "none", md: "block" }} alignSelf="stretch">
        <DynamicSidebar 
          courseTitle={course.title}
          courseSubtitle={`${convertEnglishTermToPersian(course.term)} ${course.year}`}
          courseCode={course.courseCode}
          instructor={course.instructor}
          courseId={courseId}
        />
      </GridItem>

      <GridItem area="main">
        <Box bg={bgColor} minH="100vh" p={{ base: 6, md: 8 }} pb={24} position="relative">
          {/* Header with Progress Indicator */}
          <VStack align="stretch" gap={4} mb={8}>
            <Heading size="xl" color={textColor} fontWeight="bold">
              ایجاد تکلیف
            </Heading>
            
            {/* Progress Indicator */}
            <HStack gap={0} align="center">
              {/* Step 1 - Active */}

              <HStack gap={3} align="center">
                <Box
                  w="28px"
                  h="28px"
                  borderRadius="full"
                  bg="blue.500"
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="sm"
                  fontWeight="bold"
                >
                  1
                </Box>
                <Text color={textColor} fontWeight="medium" fontSize="sm">نوع تکلیف</Text>
              </HStack>
              
              {/* Progress Line */}
              <Box
                w="60px"
                h="2px"
                bg="blue.500"
                mx={2}
              />
              
              {/* Step 2 - Active */}
              <HStack gap={3} align="center">
                <Box
                  w="28px"
                  h="28px"
                  borderRadius="full"
                  bg="blue.500"
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="sm"
                  fontWeight="bold"
                >
                  2
                </Box>
                <Text color={textColor} fontWeight="medium" fontSize="sm">تنظیمات تکلیف</Text>
              </HStack>
            </HStack>
          </VStack>

          {/* Split Layout */}
          <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap={8} h="calc(100vh - 200px)">
            {/* Left Side - Assignment Type Selection */}
            <GridItem>
              <VStack align="stretch" gap={6} h="full">
                <VStack align="stretch" gap={4}>
                    <Text color={textColor} fontSize="lg" fontWeight="medium">
                      نوع تکلیف
                    </Text>
                  
                  <VStack align="stretch" gap={4}>
                    {assignmentTypes.map((type) => (
                      <Box
                        key={type.id}
                        p={6}
                        bg={selectedType === type.id ? selectedBg : cardBg}
                        border="2px solid"
                        borderColor={selectedType === type.id ? selectedBorder : borderColor}
                        borderRadius="lg"
                        cursor={type.enabled ? "pointer" : "not-allowed"}
                        opacity={type.enabled ? 1 : 0.5}
                        _hover={type.enabled ? { 
                          bg: selectedType === type.id ? selectedBg : cardHover,
                          transform: "translateY(-2px)",
                          boxShadow: "md"
                        } : {}}
                        transition="all 0.2s"
                        onClick={() => type.enabled && setSelectedType(type.id)}
                      >
                        <HStack gap={4} align="start">
                          <Box
                            p={3}
                            bg={selectedType === type.id ? "blue.500" : "gray.100"}
                            color={selectedType === type.id ? "white" : "gray.600"}
                            borderRadius="lg"
                          >
                            <Icon as={type.icon} boxSize={6} />
                          </Box>
                          <VStack align="start" gap={2} flex={1}>
                            <Heading size="md" color={textColor}>
                              {type.name}
                            </Heading>
                            <Text color={subtleText} fontSize="sm">
                              {type.description}
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </VStack>
              </VStack>
            </GridItem>

            {/* Homework Form */}
            <GridItem>
              {selectedType === 'homework' && (
                <Box
                  width="70%"
                  bg={formBg}
                  borderRadius="lg"
                  border="1px"
                  borderColor={formBorder}
                  p={6}

                  overflowY="auto"
                  pb={20}
                  boxShadow="sm"
                >
                  <VStack align="stretch" gap={6}>
                  {/* Assignment Name */}
                  <VStack align="stretch" gap={2}>
                    <Text fontWeight="medium" color={textColor}>نام تکلیف *</Text>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="نام تکلیف را وارد کنید"
                      color={textColor}
                      size="sm"
                      fontSize="sm"
                      bg={inputBg}
                      border="1px solid"
                      borderColor={inputBorder}
                      borderRadius="md"
                      _placeholder={{ pr: 2, fontSize: "sm" }}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                    />
                    {validationErrors.title && (
                      <Text color="red.500" fontSize="sm">{validationErrors.title}</Text>
                    )}
                  </VStack>

                  {/* Template PDF */}
                  <VStack align="stretch" gap={2}>
                    <Text fontWeight="medium" color={textColor}>فایل تکلیف (PDF) *</Text>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      display="none"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      w="full"
                      justifyContent="flex-start"
                      size="sm"
                      fontSize="sm"
                      bg={inputBg}
                      border="1px solid"
                      borderColor={inputBorder}
                      borderRadius="md"
                      children={
                        <HStack paddingRight={2}>
                          <Icon as={FiUpload} boxSize={4} />
                          <Text fontSize="sm">{formData.templatePdf ? formData.templatePdf.name : 'انتخاب فایل PDF'}</Text>
                        </HStack>
                      }
                      _hover={{ bg: 'blue.50', borderColor: 'blue.300' }}
                    />
                    {validationErrors.templatePdf && (
                      <Text color="red.500" fontSize="sm">{validationErrors.templatePdf}</Text>
                    )}
                  </VStack>

                  {/* Submission Anonymization */}
                  <VStack align="stretch" gap={1}>
                    <HStack>
                      <input
                        type="checkbox"
                        checked={formData.anonymizedGrading}
                        onChange={(e: any) => handleInputChange('anonymizedGrading', e.target.checked)}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      <Text fontWeight="medium" color={textColor}>ناشناس کردن تکالیف</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.500">تکالیف تحویل داده شده به صورت ناشناس نمایش داده می‌شوند</Text>
                  </VStack>

                  {/* Regrade Requests */}
                  <VStack align="stretch" gap={1}>
                    <HStack>
                      <input
                        type="checkbox"
                        checked={formData.regradeEnabled}
                        onChange={(e: any) => handleInputChange('regradeEnabled', e.target.checked)}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      <Text fontWeight="medium" color={textColor}>فعال‌سازی درخواست بازبینی</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.500">دانشجویان می‌توانند درخواست بازبینی نمره خود را ارسال کنند</Text>
                  </VStack>

                  {/* Who will Upload Submissions */}
                  <VStack align="stretch" gap={3}>
                    <Text fontWeight="medium" color={textColor}>آپلود تکالیف توسط</Text>
                    <Stack direction="row" gap={8}>
                      <HStack>
                        <input
                          type="radio"
                          name="uploadByStudent"
                          value="student"
                          checked={formData.uploadByStudent === 'student'}
                          onChange={(e: any) => handleInputChange('uploadByStudent', e.target.value)}
                          style={{ transform: 'scale(1.2)' }}
                        />
                        <Text color={textColor}>دانشجو</Text>
                      </HStack>
                      <HStack>
                        <input
                          type="radio"
                          name="uploadByStudent"
                          value="instructor"
                          checked={formData.uploadByStudent === 'instructor'}
                          onChange={(e: any) => handleInputChange('uploadByStudent', e.target.value)}
                          style={{ transform: 'scale(1.2)' }}
                        />
                        <Text color={textColor}>استاد</Text>
                      </HStack>
                    </Stack>
                  </VStack>

                  {/* Due Date - Only show when student uploads */}
                  {formData.uploadByStudent === 'student' ? (
                    <VStack align="stretch" gap={2}>
                      <PersianDatePicker
                        label="تاریخ تحویل *"
                        value={formData.dueAt}
                        onChange={(value) => handleInputChange('dueAt', value)}
                        errorMessage={validationErrors.dueAt}
                      />
                    </VStack>
                  ) : (
                    <VStack align="stretch" gap={2}>
                      <Text fontWeight="medium" color={textColor}>تاریخ تحویل</Text>
                      <Text fontSize="sm" color="gray.500" bg="gray.50" p={3} borderRadius="md">
                        در صورت آپلود توسط استاد، نیازی به تعیین تاریخ تحویل نیست
                      </Text>
                    </VStack>
                  )}

                  {/* Points */}
                  <VStack align="stretch" gap={2}>
                    <Text fontWeight="medium" color={textColor}>نمره کل تکلیف</Text>
                    <Input
                      type="number"
                      value={formData.totalPoints}
                      onChange={(e: any) => handleInputChange('totalPoints', parseInt(e.target.value) || 0)}
                      min={1}
                      max={1000}
                      size="sm"
                      fontSize="sm"
                      pr={4}
                      bg={inputBg}
                      border="1px solid"
                      borderColor={inputBorder}
                      borderRadius="md"
                      _placeholder={{ pr: 4, fontSize: "sm" }}
                    />
                  </VStack>
                  </VStack>
                </Box>
              )}
            </GridItem>
          </Grid>
          
          {/* Bottom Action Bar */}
          <Box
            position="fixed"
            bottom={0}
            left={0}
            right={0}
            bg="gray.100"
            borderTop="1px solid"
            borderColor="gray.300"
            p={{ base: 1, md: 2 }}
            zIndex={10}
            w="100%"
          >
            <HStack justify="flex-end" mx="auto" px={{ base: 4, md: 6 }}>
              <Button 
                paddingLeft={2}
                variant="outline"
                colorScheme="blue"
                size={{ base: "sm", md: "md" }}
                borderColor="#4A90E2"
                color="#4A90E2"
                _hover={{ bg: "#4A90E2", color: "white" }}
                fontSize={{ base: "xs", md: "sm" }}
                onClick={handleGoBack}
                disabled={isSubmitting}
              >
                <Icon as={FiArrowRight} mr={2} />
                بازگشت
              </Button>
              
              <Button
                padding={2}
                bg="#2E5BBA"
                color="white"
                size={{ base: "sm", md: "md" }}
                _hover={{ bg: "#1E4A9A" }}
                fontSize={{ base: "xs", md: "sm" }}
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedType}
                loadingText="در حال ایجاد..."
              >
                {isSubmitting ? 'در حال ایجاد...' : 'ایجاد تکلیف'}
              </Button>
            </HStack>
          </Box>
        </Box>
      </GridItem>
    </Grid>
  );
};

export default CreateAssignmentMerged;
