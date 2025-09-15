import DynamicSidebar from "@/components/DynamicSidebar";
import { 
  Box, 
  Grid, 
  GridItem, 
  Heading, 
  Text, 
  VStack, 
  Button, 
  Icon, 
  Spinner, 
  HStack,
  Badge,
  IconButton
} from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { FiPlus, FiChevronUp, FiChevronDown, FiMoreVertical, FiCircle } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { useCourse } from "@/hooks/useCourse";

const CoursePage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { course, isLoading, error } = useCourse(courseId);
  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");
  const subtleText = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.800");
  const tableRowHover = useColorModeValue("gray.50", "gray.800");
  const progressBg = useColorModeValue("gray.200", "gray.600");

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
          <VStack align="stretch" gap={6}>
            {/* Course Header  */}
            <Box>
              <HStack align='center' gap={3} mb={2}>
                <Heading size="xl" color={textColor} fontWeight="bold">
                  {course.title}
                </Heading>
                <Box  height="20px" width="1px" bg={subtleText} />
                <Text color={subtleText} fontSize="lg">
                  {course.term} {course.year}
                </Text>
              </HStack>
              <Text color={subtleText} fontSize="sm">
                شماره درس: {course.courseCode}
              </Text>
            </Box>

            {/* Description Section */}
            <Box width="50%">
              <Heading size="md" color={textColor} mb={2}>
                توضیحات
            </Heading>
              <Box height="2px" width="100%" bg='gray.400' mb={3} />
              <Text color={textColor} fontSize="sm">
                {course.description || "توضیحات درس را در صفحه تنظیمات درس ویرایش کنید."}
              </Text>
            </Box>
            
            {/* Active Assignments Table */}
            <VStack align="stretch" gap={4}>
              <Box
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="md"
                overflow="hidden"
              >
                <Box as="table" width="100%" fontSize="sm">
                  <Box as="thead" bg={tableHeaderBg}>
                    <Box as="tr" borderBottom="1px" borderColor={borderColor}>
                      <Box as="th" p={3} textAlign="right" color={textColor} fontWeight="semibold">
                         تکالیف فعال
                      </Box>
                      <Box as="th" p={3} textAlign="right" color={textColor} fontWeight="semibold">
                        <HStack gap={1}>
                          <Text>تاریخ ایجاد</Text>
                          <Icon as={FiChevronDown} boxSize={3} />
                        </HStack>
                      </Box>
                      <Box as="th" p={3} textAlign="right" color={textColor} fontWeight="semibold">
                        <HStack gap={1}>
                          <Text>مهلت </Text>
                          <Icon as={FiChevronDown} boxSize={3} />
                        </HStack>
                      </Box>
                      <Box as="th" p={3} textAlign="right" color={textColor} fontWeight="semibold">
                        <HStack gap={1}>
                          <Text> تحویل داده‌شده</Text>
                          <Icon as={FiChevronUp} boxSize={3} />
                        </HStack>
                      </Box>
                      <Box as="th" p={3} textAlign="right" color={textColor} fontWeight="semibold">
                        <HStack gap={1}>
                          <Text> تصحیح شده</Text>
                          <Icon as={FiChevronUp} boxSize={3} />
                        </HStack>
                      </Box>
                      <Box as="th" p={3} textAlign="center" color={textColor} fontWeight="semibold">انتشار</Box>
                      <Box as="th" p={3} textAlign="center" color={textColor} fontWeight="semibold">بازبینی</Box>
                      <Box as="th" p={3} textAlign="center" width="50px"></Box>
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {/* Demo Assignment Row */}
                    <Box 
                      as="tr" 
                      borderBottom="1px" 
                      borderColor={borderColor}
                      _hover={{ bg: tableRowHover }}
                    >
                      <Box as="td" p={3} color={textColor} fontWeight="medium">
                        تکلیف نمونه
                      </Box>
                      <Box as="td" p={3} color={subtleText}>
                        -
                      </Box>
                      <Box as="td" p={3} color={subtleText}>
                        ۳۰ خرداد
                      </Box>
                      <Box as="td" p={3} color={textColor}>
                        ۲۰
                      </Box>
                      <Box as="td" p={3}>
                        <VStack align="start" gap={1}>
                          <Box
                            width="100px"
                            height="6px"
                            bg={progressBg}
                            borderRadius="md"
                            position="relative"
                            overflow="hidden"
                          >
                            <Box
                              width="0%"
                              height="100%"
                              bg="blue.500"
                              borderRadius="md"
                            />
                          </Box>
                          <Text fontSize="xs" color={subtleText}>۰٪</Text>
                        </VStack>
                      </Box>
                      <Box as="td" p={3} textAlign="center">
                        <Icon as={FiCircle} color={subtleText} />
                      </Box>
                      <Box as="td" p={3} textAlign="center">
                        <Badge colorScheme="green" variant="subtle" fontSize="xs">
                          فعال
                        </Badge>
                      </Box>
                      <Box as="td" p={3} textAlign="center">
                        <IconButton
                          variant="ghost"
                          size="sm"
                          aria-label="عملیات"
                        >
                          <Icon as={FiMoreVertical} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
              {/* Empty State  */}
                <Box textAlign="center" >
                  <VStack gap={4}>
                    <Text color={subtleText} fontSize="lg">
                      هنوز هیچ تکلیفی ایجاد نشده است
                    </Text>
                    <Button paddingLeft={2} colorScheme="teal" size="sm">
                      <Icon as={FiPlus} mr={2} />
                      ایجاد تکلیف
                    </Button>
                  </VStack>
                </Box>
            </VStack>
          </VStack>
        </Box>
      </GridItem>
    </Grid>
  );
};

export default CoursePage;
