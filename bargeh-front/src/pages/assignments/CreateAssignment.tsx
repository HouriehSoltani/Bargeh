import { Box, Grid, GridItem, Heading, VStack, Button, Text, Icon, HStack } from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { FiFileText, FiCheckCircle, FiCode, FiArrowLeft, FiArrowRight, FiBook } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import DynamicSidebar from "@/components/DynamicSidebar";
import { useCourse } from "@/hooks/useCourse";
import { useState } from "react";

interface AssignmentType {
  id: string;
  name: string;
  description: string;
  icon: any;
  enabled: boolean;
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

const CreateAssignment = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { course, isLoading, error } = useCourse(courseId);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");
  const subtleText = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const cardBg = useColorModeValue("white", "gray.800");
  const cardHover = useColorModeValue("gray.50", "gray.700");
  const selectedBg = useColorModeValue("blue.50", "blue.900");
  const selectedBorder = useColorModeValue("blue.200", "blue.700");

  const handleNext = () => {
    if (selectedType === 'homework') {
      navigate(`/courses/${courseId}/assignments/new/homework`);
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
          courseSubtitle={`${course.term} ${course.year}`}
          instructor={course.instructor}
          courseId={courseId}
        />
      </GridItem>

      <GridItem area="main">
        <Box bg={bgColor} minH="100vh" p={{ base: 4, md: 6 }} pb={24} position="relative">
          <VStack align="stretch" gap={6}>
            {/* Header with Progress Indicator */}
            <VStack align="stretch" gap={4}>
              <Heading size="xl" color={textColor}>ایجاد تکلیف</Heading>
              
              {/* Progress Indicator */}
              <HStack gap={0} align="center" justify="flex-start">
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
                
                {/* Step 2 - Inactive */}
                <HStack gap={3} align="center">
                  <Box
                    w="28px"
                    h="28px"
                    borderRadius="full"
                    bg="gray.200"
                    color="gray.600"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="sm"
                    fontWeight="bold"
                  >
                    2
                  </Box>
                  <Text color="gray.500" fontWeight="medium" fontSize="sm">تنظیمات تکلیف</Text>
                </HStack>
              </HStack>
            </VStack>
            
            <Text color={subtleText} fontSize="lg">
              نوع تکلیف را انتخاب کنید
            </Text>

            <VStack align="stretch" gap={4} maxW="600px">
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
              >
                <Icon as={FiArrowRight} mr={2} />
                بازگشت
              </Button>
              
              <Button
                paddingRight={2}
                bg="#2E5BBA"
                color="white"
                size={{ base: "sm", md: "md" }}
                _hover={{ bg: "#1E4A9A" }}
                fontSize={{ base: "xs", md: "sm" }}
                onClick={handleNext}
                disabled={!selectedType}
              >
                ادامه
                <Icon as={FiArrowLeft} ml={2} />
              </Button>
            </HStack>
          </Box>
        </Box>
      </GridItem>
    </Grid>
  );
};

export default CreateAssignment;
