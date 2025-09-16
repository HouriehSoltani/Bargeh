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
import { FiUpload, FiCheck, FiArrowRight } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import DynamicSidebar from "@/components/DynamicSidebar";
import { useCourse } from "@/hooks/useCourse";
import { useState, useRef } from "react";
import { api } from "@/services/api";

interface FormData {
  title: string;
  templatePdf: File | null;
  anonymizedGrading: boolean;
  uploadByStudent: 'student' | 'instructor';
  releaseAt: string;
  dueAt: string;
  allowLate: boolean;
  lateDueAt: string;
  variableLength: boolean;
  enforceTimeLimit: boolean;
  timeLimitMinutes: number;
  groupEnabled: boolean;
  groupMaxSize: number;
  totalPoints: number;
}

const HomeworkCreateForm = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { course, isLoading, error } = useCourse(courseId);
  // const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    templatePdf: null,
    anonymizedGrading: false,
    uploadByStudent: 'student',
    releaseAt: '',
    dueAt: '',
    allowLate: false,
    lateDueAt: '',
    variableLength: true,
    enforceTimeLimit: false,
    timeLimitMinutes: 60,
    groupEnabled: false,
    groupMaxSize: 2,
    totalPoints: 100
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");

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
      errors.templatePdf = 'فایل PDF قالب الزامی است';
    }

    if (!formData.releaseAt) {
      errors.releaseAt = 'تاریخ انتشار الزامی است';
    }

    if (!formData.dueAt) {
      errors.dueAt = 'تاریخ تحویل الزامی است';
    }

    if (formData.allowLate && !formData.lateDueAt) {
      errors.lateDueAt = 'تاریخ تحویل دیرهنگام الزامی است';
    }

    if (formData.groupEnabled && formData.groupMaxSize < 2) {
      errors.groupMaxSize = 'حداکثر اندازه گروه باید حداقل 2 باشد';
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
      const formDataToSend = new FormData();
      formDataToSend.append('course', courseId!);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('template_pdf', formData.templatePdf!);
      formDataToSend.append('anonymized_grading', String(formData.anonymizedGrading));
      formDataToSend.append('upload_by_student', String(formData.uploadByStudent === 'student'));
      formDataToSend.append('release_at', new Date(formData.releaseAt).toISOString());
      formDataToSend.append('due_at', new Date(formData.dueAt).toISOString());
      formDataToSend.append('allow_late', String(formData.allowLate));
      if (formData.allowLate && formData.lateDueAt) {
        formDataToSend.append('late_due_at', new Date(formData.lateDueAt).toISOString());
      }
      formDataToSend.append('variable_length', String(formData.variableLength));
      if (formData.enforceTimeLimit) {
        formDataToSend.append('time_limit_minutes', String(formData.timeLimitMinutes));
      }
      formDataToSend.append('group_enabled', String(formData.groupEnabled));
      if (formData.groupEnabled) {
        formDataToSend.append('group_max_size', String(formData.groupMaxSize));
      }
      formDataToSend.append('total_points', String(formData.totalPoints));
      formDataToSend.append('is_published', 'false');

      await api.post('/assignments/homework/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // toast({
      //   title: 'تکلیف با موفقیت ایجاد شد',
      //   status: 'success',
      //   duration: 3000,
      //   isClosable: true,
      // });

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

      // toast({
      //   title: 'خطا در ایجاد تکلیف',
      //   description: 'لطفاً اطلاعات را بررسی کنید',
      //   status: 'error',
      //   duration: 5000,
      //   isClosable: true,
      // });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/courses/${courseId}/assignments/new`);
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
      minH="100vh"
      gap={0}
    >
      <GridItem area="aside" display={{ base: "none", md: "block" }}>
        <DynamicSidebar 
          courseTitle={course.title}
          courseSubtitle={`${course.term} ${course.year}`}
          instructor={course.instructor}
          courseId={courseId}
        />
      </GridItem>

      <GridItem area="main">
        <Box bg={bgColor} minH="100vh" p={{ base: 4, md: 6 }} pb={24} position="relative">
          <VStack align="stretch" gap={6} maxW="800px">
            {/* Header with Progress Indicator */}
            <VStack align="stretch" gap={4}>
              <Heading size="xl" color={textColor}>ایجاد تکلیف</Heading>
              
              {/* Progress Indicator */}
              <HStack gap={0} align="center" justify="flex-start">
                {/* Step 1 - Completed */}
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
                    <Icon as={FiCheck} boxSize={4} />
                  </Box>
                  <Text color="gray.500" fontWeight="medium" fontSize="sm">نوع تکلیف</Text>
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
            
            <VStack align="stretch" gap={6}>
              {/* Assignment Name */}
              <VStack align="stretch" gap={2}>
                <Box as="label" fontWeight="medium" color={textColor}>نام تکلیف *</Box>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="نام تکلیف را وارد کنید"
                  color={textColor}
                />
                {validationErrors.title && (
                  <Box color="red.500" fontSize="sm">{validationErrors.title}</Box>
                )}
              </VStack>

              {/* Template PDF */}
              <VStack align="stretch" gap={2}>
                <Box as="label" fontWeight="medium" color={textColor}>فایل تکلیف (PDF) *</Box>
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
                >
                  <Icon as={FiUpload} mr={2} />
                  {formData.templatePdf ? formData.templatePdf.name : 'انتخاب فایل PDF'}
                </Button>
                {validationErrors.templatePdf && (
                  <Box color="red.500" fontSize="sm">{validationErrors.templatePdf}</Box>
                )}
              </VStack>

              {/* Submission Anonymization */}
              <VStack align="stretch" gap={2}>
                <HStack>
                  <input
                    type="checkbox"
                    checked={formData.anonymizedGrading}
                    onChange={(e) => handleInputChange('anonymizedGrading', e.target.checked)}
                  />
                  <Box as="label" fontWeight="medium" color={textColor}>ناشناس کردن تکالیف تحویل داده شده</Box>
                </HStack>
              </VStack>

              {/* Who will Upload Submissions */}
              <VStack align="stretch" gap={2}>
                <Box as="label" fontWeight="medium" color={textColor}>آپلود تکالیف تحویل داده شده توسط</Box>
                <Stack direction="row" gap={6}>
                  <HStack>
                    <input
                      type="radio"
                      name="uploadByStudent"
                      value="student"
                      checked={formData.uploadByStudent === 'student'}
                      onChange={(e) => handleInputChange('uploadByStudent', e.target.value)}
                    />
                    <Box as="label" color={textColor}>دانشجو</Box>
                  </HStack>
                  <HStack>
                    <input
                      type="radio"
                      name="uploadByStudent"
                      value="instructor"
                      checked={formData.uploadByStudent === 'instructor'}
                      onChange={(e) => handleInputChange('uploadByStudent', e.target.value)}
                    />
                    <Box as="label" color={textColor}>استاد</Box>
                  </HStack>
                </Stack>
              </VStack>

              {/* Release Date */}
              <VStack align="stretch" gap={2}>
                <Box as="label" fontWeight="medium" color={textColor}>تاریخ انتشار *</Box>
                <Input
                  type="datetime-local"
                  value={formData.releaseAt}
                  onChange={(e) => handleInputChange('releaseAt', e.target.value)}
                  color={textColor}
                />
                {validationErrors.releaseAt && (
                  <Box color="red.500" fontSize="sm">{validationErrors.releaseAt}</Box>
                )}
              </VStack>

              {/* Due Date */}
              <VStack align="stretch" gap={2}>
                <Box as="label" fontWeight="medium" color={textColor}>تاریخ تحویل *</Box>
                <Input
                  type="datetime-local"
                  value={formData.dueAt}
                  onChange={(e) => handleInputChange('dueAt', e.target.value)}
                  color={textColor}
                />
                {validationErrors.dueAt && (
                  <Box color="red.500" fontSize="sm">{validationErrors.dueAt}</Box>
                )}
              </VStack>

              {/* Allow Late Submissions */}
              <VStack align="stretch" gap={2}>
                <HStack>
                  <input
                    type="checkbox"
                    checked={formData.allowLate}
                    onChange={(e) => handleInputChange('allowLate', e.target.checked)}
                  />
                  <Box as="label" fontWeight="medium" color={textColor}>اجازه تحویل دیرهنگام</Box>
                </HStack>
              </VStack>

              {/* Late Due Date */}
              {formData.allowLate && (
                <VStack align="stretch" gap={2}>
                  <Box as="label" fontWeight="medium" color={textColor}>تاریخ تحویل دیرهنگام *</Box>
                  <Input
                    type="datetime-local"
                    value={formData.lateDueAt}
                    onChange={(e) => handleInputChange('lateDueAt', e.target.value)}
                    color={textColor}
                  />
                  {validationErrors.lateDueAt && (
                    <Box color="red.500" fontSize="sm">{validationErrors.lateDueAt}</Box>
                  )}
                </VStack>
              )}

              {/* Enforce Time Limit */}
              <VStack align="stretch" gap={2}>
                <HStack>
                  <input
                    type="checkbox"
                    checked={formData.enforceTimeLimit}
                    onChange={(e) => handleInputChange('enforceTimeLimit', e.target.checked)}
                  />
                  <Box as="label" fontWeight="medium" color={textColor}>اعمال محدودیت زمانی</Box>
                </HStack>
              </VStack>

              {/* Time Limit */}
              {formData.enforceTimeLimit && (
                <VStack align="stretch" gap={2}>
                  <Box as="label" fontWeight="medium" color={textColor}>محدودیت زمانی (دقیقه)</Box>
                  <Input
                    type="number"
                    value={formData.timeLimitMinutes}
                    onChange={(e) => handleInputChange('timeLimitMinutes', parseInt(e.target.value) || 0)}
                    min={1}
                    max={1440}
                    color={textColor}
                  />
                </VStack>
              )}

              {/* Submission Type */}
              <VStack align="stretch" gap={2}>
                <Box as="label" fontWeight="medium" color={textColor}>نوع ارسال</Box>
                <Stack direction="row" gap={6}>
                  <HStack>
                    <input
                      type="radio"
                      name="variableLength"
                      checked={formData.variableLength}
                      onChange={() => handleInputChange('variableLength', true)}
                    />
                    <Box as="label" color={textColor}>متغیر</Box>
                  </HStack>
                  <HStack>
                    <input
                      type="radio"
                      name="variableLength"
                      checked={!formData.variableLength}
                      onChange={() => handleInputChange('variableLength', false)}
                    />
                    <Box as="label" color={textColor}>قالب‌دار (طول ثابت)</Box>
                  </HStack>
                </Stack>
              </VStack>

              {/* Group Submission */}
              <VStack align="stretch" gap={2}>
                <HStack>
                  <input
                    type="checkbox"
                    checked={formData.groupEnabled}
                    onChange={(e) => handleInputChange('groupEnabled', e.target.checked)}
                  />
                  <Box as="label" fontWeight="medium" color={textColor}>ارسال گروهی</Box>
                </HStack>
              </VStack>

              {/* Group Max Size */}
              {formData.groupEnabled && (
                <VStack align="stretch" gap={2}>
                  <Box as="label" fontWeight="medium" color={textColor}>حداکثر اندازه گروه</Box>
                  <Input
                    type="number"
                    value={formData.groupMaxSize}
                    onChange={(e) => handleInputChange('groupMaxSize', parseInt(e.target.value) || 0)}
                    min={2}
                    max={10}
                    color={textColor}
                  />
                  {validationErrors.groupMaxSize && (
                    <Box color="red.500" fontSize="sm">{validationErrors.groupMaxSize}</Box>
                  )}
                </VStack>
              )}
            </VStack>
          </VStack>
          
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
            <HStack justify="space-between" mx="auto" px={{ base: 4, md: 6 }}>
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
                disabled={isSubmitting}
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

export default HomeworkCreateForm;
