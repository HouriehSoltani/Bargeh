import DynamicSidebar from "@/components/DynamicSidebar";
import { Box, Grid, GridItem, Heading, HStack, Icon, Text, VStack, Button, Spinner } from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { FiBookOpen, FiPlus } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { useCourse } from "@/hooks/useCourse";

const CoursePage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { course, isLoading, error } = useCourse(courseId);
  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");
  const subtleText = useColorModeValue("gray.600", "gray.300");

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
          courseSubtitle={`${course.term} ${course.year}`}
          instructor={course.instructor}
          courseId={courseId}
        />
      </GridItem>

      <GridItem area="main">
        <Box bg={bgColor} minH="100vh" p={{ base: 4, md: 6 }}>
          {/* Course Header */}
          <HStack justify="space-between" mb={6}>
            <VStack align="start" gap={0}>
              <HStack>
                <Heading size="lg" color={textColor}>{course.title}</Heading>
                <Text color={subtleText}>|</Text>
                <Text color={subtleText}>{course.term} {course.year}</Text>
              </HStack>
              <Text color={subtleText} fontSize="sm">شناسه درس: {course.id}</Text>
            </VStack>
            <Button colorScheme="teal" variant="solid">
              <Icon as={FiPlus} mr={2} />
              ایجاد تکلیف
            </Button>
          </HStack>

          {/* Description Section */}
          <Box mb={6}>
            <Heading size="md" color={textColor} mb={2}>
              توضیحات
            </Heading>
            <Box height="1px" width="100%" bg={subtleText} mb={3} />
            <Text color={textColor} fontSize="sm">
              {course.description || "توضیحات درس را در صفحه تنظیمات درس ویرایش کنید."}
            </Text>
          </Box>

          {/* Dashboard Table placeholder */}
          <VStack align="stretch" gap={4}>
            <HStack color={subtleText} fontSize="sm" justify="space-between">
              <Text>تکالیف فعال</Text>
              <HStack gap={8}>
                <Text>منتشر شده</Text>
                <Text>موعد</Text>
                <Text>ارسال‌ها</Text>
                <Text>% تصحیح‌شده</Text>
                <Text>انتشار</Text>
                <Text>بازبینی</Text>
              </HStack>
            </HStack>
            <Box
              borderWidth="1px"
              borderColor={useColorModeValue("gray.200", "gray.700")}
              borderRadius="md"
              py={16}
              textAlign="center"
              color={subtleText}
            >
              <Icon as={FiBookOpen} mr={2} />
              در حال حاضر هیچ تکلیفی وجود ندارد.
            </Box>
            <HStack justify="center">
              <Button variant="outline" colorScheme="teal">
                <Icon as={FiPlus} mr={2} />
                ایجاد تکلیف
              </Button>
            </HStack>
          </VStack>
        </Box>
      </GridItem>
    </Grid>
  );
};

export default CoursePage;
