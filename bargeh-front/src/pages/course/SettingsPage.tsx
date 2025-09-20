import DynamicSidebar from "@/components/DynamicSidebar";
import { Box, Grid, GridItem, Heading, VStack, Button, Input, Textarea, HStack, Icon, Spinner, Text, createToaster } from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { FiSave, FiTrash2 } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import { useCourse } from "@/hooks/useCourse";
import { convertEnglishTermToPersian } from "@/utils/persianDate";
import { useState, useEffect } from "react";
import { courseService } from "@/services/courseService";

const SettingsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { course, isLoading, error, refetch } = useCourse(courseId);
  const toaster = createToaster({ placement: "top" });
  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");
  const subtleText = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    description: "",
    term: "spring",
    year: 1403
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasAssignments, setHasAssignments] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Update form data when course loads
  useEffect(() => {
    if (course) {
      console.log('Course data loaded:', course);
      setFormData({
        title: course.title || "",
        code: (course as any).courseCode || (course as any).code || "",
        description: course.description || "",
        term: (course as any).term || "spring",
        year: (course as any).year || 1403
      });
    }
  }, [course]);

  // Check for assignments when course loads
  useEffect(() => {
    const checkAssignments = async () => {
      if (courseId) {
        try {
          console.log('Checking assignments for course ID:', courseId);
          const response = await courseService.getAssignments(parseInt(courseId));
          console.log('Full API response:', response);
          
          // Handle paginated response: {count: number, results: array}
          const assignments = (response as any)?.results || [];
          console.log('Extracted assignments:', assignments);
          console.log('Assignments count:', assignments.length);
          
          setHasAssignments(Array.isArray(assignments) && assignments.length > 0);
        } catch (error) {
          console.error('Error checking assignments:', error);
          console.error('Error details:', error);
          setHasAssignments(false); // Default to false if error
        }
      }
    };
    checkAssignments();
  }, [courseId]);

  // Form handlers
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancel = () => {
    navigate(`/courses/${courseId}`);
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) {
      errors.push("نام درس الزامی است");
    }
    
    if (!formData.code.trim()) {
      errors.push("کد درس الزامی است");
    }
    
    if (formData.year < 1400 || formData.year > 1410) {
      errors.push("سال باید بین 1400 تا 1410 باشد");
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    if (!courseId) return;
    
    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      toaster.create({
        title: "خطا در اعتبارسنجی",
        description: errors.join("، "),
        type: "error",
        duration: 5000,
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const updatedCourse = await courseService.updateCourse(parseInt(courseId), formData);
      
      // Update the course data in the component state if needed
      console.log('Course updated successfully:', updatedCourse);
      
      toaster.create({
        title: "تغییرات ذخیره شد",
        description: "اطلاعات درس با موفقیت به‌روزرسانی شد",
        type: "success",
        duration: 3000,
      });
      
      // Refresh course data to show updated information
      refetch();
    } catch (error: any) {
      console.error('Error updating course:', error);
      
      // Handle different types of errors
      let errorMessage = "خطایی در ذخیره تغییرات رخ داد";
      
      if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toaster.create({
        title: "خطا در ذخیره",
        description: errorMessage,
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!courseId || hasAssignments) return;
    
    setIsDeleting(true);
    setShowDeleteModal(false);
    try {
      await courseService.deleteCourse(parseInt(courseId));
      toaster.create({
        title: "درس حذف شد",
        description: "درس با موفقیت حذف شد",
        type: "success",
        duration: 3000,
      });
      // Redirect to courses list after successful deletion
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error: any) {
      toaster.create({
        title: "خطا در حذف",
        description: error?.response?.data?.detail || "خطایی در حذف درس رخ داد",
        type: "error",
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Box bg={bgColor} minH="100vh" p={6} display="flex" alignItems="center" justifyContent="center">
        <VStack>
          <Spinner size="xl" color="blue.500" />
          <Text color={textColor}>در حال بارگذاری درس...</Text>
        </VStack>
      </Box>
    );
  }

  // Show error state
  if (error || !course) {
    return (
      <Box bg={bgColor} minH="100vh" p={6} display="flex" alignItems="center" justifyContent="center">
        <VStack>
          <Text color="red.500" fontSize="lg">خطا در بارگذاری درس</Text>
          <Text color={subtleText}>{error || 'درس یافت نشد'}</Text>
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
          courseSubtitle={`${convertEnglishTermToPersian(course.term)} ${course.year}`}
          courseCode={course.courseCode}
          instructor={course.instructor}
          courseId={courseId}
        />
      </GridItem>

      <GridItem area="main">
        <Box bg={bgColor} minH="100vh" p={{ base: 4, md: 6 }}>
          <VStack align="stretch" gap={6}>
            <Heading size="xl" color={textColor}>تنظیمات درس</Heading>
            
            <Box
              width="50%"
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              p={8}
              bg={useColorModeValue("gray.50", "gray.800")}
              boxShadow="sm"
            >
              <VStack align="stretch" gap={4}>
                <Box>
                  <Box as="label" fontWeight="medium" color={textColor} display="block" mb={2}>
                    نام درس <Text as="span" color="red.500">*</Text>
                  </Box>
                  <Input 
                    paddingRight={2}
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    color={textColor}
                    placeholder="نام درس را وارد کنید"
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                    bg={useColorModeValue("white", "gray.700")}
                    borderColor={useColorModeValue("gray.300", "gray.600")}
                  />
                </Box>

                <Box>
                  <Box as="label" fontWeight="medium" color={textColor} display="block" mb={2}>
                    کد درس <Text as="span" color="red.500">*</Text>
                  </Box>
                  <Input 
                    paddingRight={2}
                    value={formData.code}
                    onChange={(e) => handleInputChange("code", e.target.value)}
                    color={textColor}
                    placeholder="کد درس را وارد کنید"
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                    bg={useColorModeValue("white", "gray.700")}
                    borderColor={useColorModeValue("gray.300", "gray.600")}
                  />
                </Box>

                <HStack gap={4}>
                  <Box flex={1}>
                    <Box as="label" fontWeight="medium" color={textColor} display="block" mb={2}>
                      ترم
                    </Box>
                    <select 
                      value={formData.term}
                      onChange={(e: any) => handleInputChange("term", e.target.value)}
                      style={{
                        fontSize: 'md',
                        color: textColor,
                        backgroundColor: useColorModeValue("white", "gray.800"),
                        border: "1px solid",
                        borderColor: useColorModeValue("gray.300", "gray.600"),
                        borderRadius: "6px",
                        padding: "8px",
                        width: "100%"
                      }}
                    >
                      <option value="fall">پاییز</option>
                      <option value="winter">زمستان</option>
                      <option value="spring">بهار</option>
                      <option value="summer">تابستان</option>
                    </select>
                  </Box>
                  
                  <Box flex={1}>
                    <Box as="label" fontWeight="medium" color={textColor} display="block" mb={2}>
                      سال
                    </Box>
                      <Input 
                        paddingRight={2}
                        type="number"
                        value={formData.year}
                        onChange={(e) => handleInputChange("year", parseInt(e.target.value))}
                        color={textColor}
                        min={1400}
                        max={1410}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                        bg={useColorModeValue("white", "gray.700")}
                        borderColor={useColorModeValue("gray.300", "gray.600")}
                      />
                  </Box>
                </HStack>
                
                <Box>
                  <Box as="label" fontWeight="medium" color={textColor} display="block" mb={2}>
                    توضیحات درس
                  </Box>
                  <Textarea 
                    padding={2}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="توضیحات درس خود را اینجا وارد کنید..."
                    color={textColor}
                    rows={4}
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                    bg={useColorModeValue("white", "gray.700")}
                    borderColor={useColorModeValue("gray.300", "gray.600")}
                  />
                </Box>
                
                <HStack justify="space-between" gap={3}>
                  <Box 
                    position="relative"
                    onMouseEnter={() => hasAssignments && setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <Button 
                      paddingLeft={2}
                      colorScheme="red" 
                      variant="outline"
                      onClick={hasAssignments ? undefined : () => setShowDeleteModal(true)}
                      loading={isDeleting}
                      loadingText="در حال حذف..."
                      disabled={hasAssignments}
                      _disabled={{
                        opacity: 0.6,
                        cursor: "not-allowed",
                        bg: "gray.100",
                        borderColor: "gray.300",
                        color: "gray.500"
                      }}
                      _hover={hasAssignments ? {} : { 
                        bg: "red.50", 
                        borderColor: "red.400",
                        color: "red.600"
                      }}
                      _active={hasAssignments ? {} : { 
                        bg: "red.100", 
                        borderColor: "red.500"
                      }}
                      borderColor={hasAssignments ? "gray.300" : "red.300"}
                      color={hasAssignments ? "gray.500" : "red.600"}
                      bg={hasAssignments ? "gray.100" : "transparent"}
                    >
                      <Icon as={FiTrash2} mr={2} />
                      حذف درس
                    </Button>
                    
                    {hasAssignments && showTooltip && (
                      <Box
                        position="absolute"
                        bottom="100%"
                        left="50%"
                        transform="translateX(-50%)"
                        mb={2}
                        bg="white"
                        border="1px solid"
                        borderColor="red.300"
                        borderRadius="md"
                        p={3}
                        boxShadow="lg"
                        zIndex={10}
                        minW="200px"
                        _after={{
                          content: '""',
                          position: "absolute",
                          top: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          border: "5px solid transparent",
                          borderTopColor: "white"
                        }}
                        _before={{
                          content: '""',
                          position: "absolute",
                          top: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          border: "6px solid transparent",
                          borderTopColor: "gray.200"
                        }}
                      >
                        <Text fontSize="xs" color="gray.600" textAlign="center">
                          این درس قابل حذف نیست زیرا دارای تکالیف است. ابتدا تکالیف را حذف کنید.
                        </Text>
                      </Box>
                    )}
                  </Box>
                  
                  <HStack gap={3}>
                    <Button p={2} variant="outline" onClick={handleCancel}>
                      انصراف
                    </Button>
                    <Button 
                      paddingLeft={2}
                      colorScheme="teal" 
                      onClick={handleSubmit}
                      loading={isSubmitting}
                      loadingText="در حال ذخیره..."
                    >
                      <Icon as={FiSave} mr={2} />
                      ذخیره تغییرات
                    </Button>
                  </HStack>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </GridItem>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.5)"
          zIndex={1000}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            bg={useColorModeValue("white", "gray.800")}
            borderRadius="lg"
            p={6}
            maxW="400px"
            w="90%"
            boxShadow="xl"
          >
            <VStack align="stretch" gap={4}>
              <Text fontSize="lg" fontWeight="bold" color={textColor} textAlign="center">
                حذف درس
              </Text>
              <Text fontSize="sm" color="red.500" textAlign="center">
                آیا مطمئن هستید که می‌خواهید درس "{course?.title}" را حذف کنید؟
              </Text>
              {/* <Text fontSize="xs" color="red.500" textAlign="center">
                این عمل قابل بازگشت نیست.
              </Text> */}
              <HStack justify="center" gap={3} mt={4}>
                <Button
                  paddingX={2}
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                >
                  انصراف
                </Button>
                <Button
                  paddingX={2}
                  colorScheme="red"
                  onClick={handleDelete}
                  loading={isDeleting}
                  loadingText="در حال حذف..."
                >
                  حذف
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}
    </Grid>
  );
};

export default SettingsPage;
