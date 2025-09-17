import DynamicSidebar from "@/components/DynamicSidebar";
import { Box, Grid, GridItem, Heading, Text, VStack, Button, Icon, Spinner, HStack } from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { FiUserPlus } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { useCourse } from "@/hooks/useCourse";
import { convertEnglishTermToPersian } from "@/utils/persianDate";

const RosterPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { course, isLoading, error } = useCourse(courseId);
  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");
  const subtleText = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");

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
          instructor={course.instructor}
          courseId={courseId}
        />
      </GridItem>

      <GridItem area="main">
        <Box bg={bgColor} minH="100vh" p={{ base: 4, md: 6 }}>
          <VStack align="stretch" gap={6}>
            {/* Course Header */}
            <Box>
              <HStack align='center' gap={3} mb={2}>
                <Heading size="xl" color={textColor} fontWeight="bold">
                  {course.title}
                </Heading>
                <Box height="20px" width="1px" bg={subtleText} />
                <Text color={subtleText} fontSize="lg">
                  {convertEnglishTermToPersian(course.term)} {course.year}
                </Text>
              </HStack>
              <Text color={subtleText} fontSize="sm">
                شماره درس: {course.courseCode}
              </Text>
            </Box>
            
            <Heading size="lg" color={textColor}>لیست دانشجویان</Heading>
            
            <Box
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="md"
              py={16}
              textAlign="center"
              color={subtleText}
            >
              <Text fontSize="lg" mb={4}>هنوز هیچ دانشجویی ثبت‌نام نشده است</Text>
              <Button colorScheme="teal">
                <Icon as={FiUserPlus} mr={2} />
                افزودن دانشجو
              </Button>
            </Box>
          </VStack>
        </Box>
      </GridItem>
    </Grid>
  );
};

export default RosterPage;
