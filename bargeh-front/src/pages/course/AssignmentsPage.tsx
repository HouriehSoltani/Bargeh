import DynamicSidebar from "@/components/DynamicSidebar";
import { 
  Box, 
  Grid, 
  GridItem, 
  Heading, 
  Text, 
  VStack, 
  Icon, 
  Spinner, 
  HStack,
  Badge,
  IconButton
} from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { FiChevronUp, FiChevronDown, FiMoreVertical, FiCircle } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { useCourse } from "@/hooks/useCourse";
import { useAssignments } from "@/hooks/useAssignments";

const AssignmentsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { course, isLoading, error } = useCourse(courseId);
  const { assignmentCount, isLoading: assignmentsLoading } = useAssignments(courseId);
  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");
  const subtleText = useColorModeValue("gray.600", "gray.300");

  // Show loading state
  if (isLoading) {
    return (
      <Box bg={bgColor} minH="100vh" p={6} display="flex" alignItems="center" justifyContent="center">
        <VStack>
          <Spinner size="xl" color="blue.500" />
          <Text color={textColor}>در حال بارگذاری ...</Text>
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
            {/* Assignments Header */}
            <Box>
              <Heading size="xl" color={textColor} fontWeight="bold">
                {assignmentsLoading ? (
                  <HStack>
                    <Spinner size="sm" />
                    <Text>در حال بارگذاری...</Text>
                  </HStack>
                ) : (
                  `${assignmentCount} تکلیف`
                )}
            </Heading>
            </Box>
            
            {/* Assignments Table */}
            <VStack align="stretch" gap={4}>
            <Box
              borderWidth="1px"
              borderColor={useColorModeValue("gray.200", "gray.700")}
              borderRadius="md"
                overflow="hidden"
              >
                <Box as="table" width="100%" fontSize="sm">
                  <Box as="thead" bg={useColorModeValue("gray.50", "gray.800")}>
                    <Box as="tr" borderBottom="1px" borderColor={useColorModeValue("gray.200", "gray.700")}>
                      <Box as="th" p={3} textAlign="right" color={textColor} fontWeight="semibold">
                        نام تکلیف
                      </Box>
                      <Box as="th" p={3} textAlign="right" color={textColor} fontWeight="semibold">
                        نمره
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
                      <Box as="th" p={3} textAlign="center" color={textColor} fontWeight="semibold">بازنمره‌دهی</Box>
                      <Box as="th" p={3} textAlign="center" width="50px"></Box>
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {/* Demo Assignment Rows */}
                    <Box 
                      as="tr" 
                      borderBottom="1px" 
                      borderColor={useColorModeValue("gray.100", "gray.700")}
                      _hover={{ bg: useColorModeValue("gray.50", "gray.800") }}
                    >
                      <Box as="td" p={3} color={textColor} fontWeight="medium">
                        تکلیف اول - برنامه‌نویسی
                      </Box>
                      <Box as="td" p={3} color={textColor} fontWeight="medium">
                        ۲۰
                      </Box>
                      <Box as="td" p={3} color={subtleText}>
                        ۱۵ خرداد
                      </Box>
                      <Box as="td" p={3} color={subtleText}>
                        ۳۰ خرداد
                      </Box>
                      <Box as="td" p={3} color={textColor}>
                        ۱۸
                      </Box>
                      <Box as="td" p={3}>
                        <VStack align="start" gap={1}>
                          <Box
                            width="100px"
                            height="6px"
                            bg={useColorModeValue("gray.200", "gray.600")}
                            borderRadius="md"
                            position="relative"
                            overflow="hidden"
                          >
                            <Box
                              width="90%"
                              height="100%"
                              bg="blue.500"
                              borderRadius="md"
                            />
                          </Box>
                          <Text fontSize="xs" color={subtleText}>۹۰٪</Text>
                        </VStack>
                      </Box>
                      <Box as="td" p={3} textAlign="center">
                        <Icon as={FiCircle} color="green.500" />
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
                    
                    <Box 
                      as="tr" 
                      borderBottom="1px" 
                      borderColor={useColorModeValue("gray.100", "gray.700")}
                      _hover={{ bg: useColorModeValue("gray.50", "gray.800") }}
                    >
                      <Box as="td" p={3} color={textColor} fontWeight="medium">
                        تکلیف دوم - الگوریتم
                      </Box>
                      <Box as="td" p={3} color={textColor} fontWeight="medium">
                        ۲۵
                      </Box>
                      <Box as="td" p={3} color={subtleText}>
                        ۲۰ خرداد
                      </Box>
                      <Box as="td" p={3} color={subtleText}>
                        ۵ تیر
                      </Box>
                      <Box as="td" p={3} color={textColor}>
                        ۱۵
                      </Box>
                      <Box as="td" p={3}>
                        <VStack align="start" gap={1}>
                          <Box
                            width="100px"
                            height="6px"
                            bg={useColorModeValue("gray.200", "gray.600")}
                            borderRadius="md"
                            position="relative"
                            overflow="hidden"
                          >
                            <Box
                              width="60%"
                              height="100%"
                              bg="orange.500"
                              borderRadius="md"
                            />
                          </Box>
                          <Text fontSize="xs" color={subtleText}>۶۰٪</Text>
                        </VStack>
                      </Box>
                      <Box as="td" p={3} textAlign="center">
                        <Icon as={FiCircle} color="orange.500" />
                      </Box>
                      <Box as="td" p={3} textAlign="center">
                        <Badge colorScheme="orange" variant="subtle" fontSize="xs">
                          در حال تصحیح
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
                    
                    <Box 
                      as="tr" 
                      borderBottom="1px" 
                      borderColor={useColorModeValue("gray.100", "gray.700")}
                      _hover={{ bg: useColorModeValue("gray.50", "gray.800") }}
                    >
                      <Box as="td" p={3} color={textColor} fontWeight="medium">
                        پروژه نهایی
                      </Box>
                      <Box as="td" p={3} color={textColor} fontWeight="medium">
                        ۵۰
                      </Box>
                      <Box as="td" p={3} color={subtleText}>
                        ۱ تیر
                      </Box>
                      <Box as="td" p={3} color={subtleText}>
                        ۲۰ تیر
                      </Box>
                      <Box as="td" p={3} color={textColor}>
                        ۱۲
                      </Box>
                      <Box as="td" p={3}>
                        <VStack align="start" gap={1}>
                          <Box
                            width="100px"
                            height="6px"
                            bg={useColorModeValue("gray.200", "gray.600")}
                            borderRadius="md"
                            position="relative"
                            overflow="hidden"
                          >
                            <Box
                              width="0%"
                              height="100%"
                              bg="red.500"
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
                        <Badge colorScheme="red" variant="subtle" fontSize="xs">
                          منتشر نشده
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
            </VStack>
          </VStack>
        </Box>
      </GridItem>
    </Grid>
  );
};

export default AssignmentsPage;
