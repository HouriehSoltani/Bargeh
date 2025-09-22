import React, { useState, useEffect, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  GridItem,
  VStack,
  HStack,
  Text,
  Heading,
  Spinner,
  Table,
  Button,
  Icon,
  Input,
  Badge,
  Stat,
} from '@chakra-ui/react';
import { FiSearch, FiDownload, FiEye, FiX, FiCheck, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { useColorModeValue } from '@/hooks/useColorMode';
import DynamicSidebar from '@/components/DynamicSidebar';
import { useAssignment } from '@/hooks/useAssignment';
import { api } from '@/services/api';

interface GradeStatistics {
  minimum: number;
  median: number;
  maximum: number;
  mean: number;
  std_dev: number;
  total_students: number;
  graded_students: number;
}

interface StudentGrade {
  id: number;
  student_name: string;
  email: string;
  total_score: number;
  max_score: number;
  is_graded: boolean;
  is_viewed: boolean;
  graded_at: string;
}

interface GradeDistribution {
  [key: string]: number; // score range -> count
}

const ReviewGradesPage: React.FC = () => {
  const { assignmentId } = useParams<{ courseId: string; assignmentId: string }>();

  // Fetch assignment data
  const { assignment, isLoading: assignmentLoading, error: assignmentError } = useAssignment(assignmentId);

  // State
  const [statistics, setStatistics] = useState<GradeStatistics | null>(null);
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [gradeDistribution, setGradeDistribution] = useState<GradeDistribution>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof StudentGrade>('student_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtleText = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.800');
  const tableRowHover = useColorModeValue('gray.50', 'gray.800');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!assignmentId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Load grade statistics
        const statsResponse = await api.get(`/api/assignments/${assignmentId}/grade-statistics/`);
        setStatistics(statsResponse as GradeStatistics);

        // Load student grades
        const gradesResponse = await api.get(`/api/assignments/${assignmentId}/student-grades/`);
        const grades = (gradesResponse as any).grades || [];
        setStudentGrades(grades);

        // Generate grade distribution from student grades
        const distribution: GradeDistribution = {};
        grades.forEach((grade: StudentGrade) => {
          if (grade.is_graded) {
            const score = Math.round(grade.total_score);
            distribution[score.toString()] = (distribution[score.toString()] || 0) + 1;
          }
        });
        setGradeDistribution(distribution);

      } catch (err: any) {
        console.error('Error loading review grades data:', err);
        setError('خطا در بارگذاری اطلاعات نمرات');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [assignmentId]);

  // Handle sorting
  const handleSort = (field: keyof StudentGrade) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon for table headers
  const getSortIcon = (field: keyof StudentGrade) => {
    if (sortField !== field) {
      return <Icon as={FiArrowUp} color="gray.400" />;
    }
    return (
      <Icon 
        as={sortDirection === 'asc' ? FiArrowUp : FiArrowDown} 
        color="blue.500" 
      />
    );
  };

  // Sort and filter data
  const filteredAndSortedGrades = studentGrades
    .filter(grade => 
      grade.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortDirection === 'asc' ? (aValue ? 1 : -1) : (bValue ? -1 : 1);
      }
      
      return 0;
    });

  // Generate histogram data
  const generateHistogramData = () => {
    if (!statistics || !gradeDistribution) return [];

    // Create meaningful score ranges like in the image
    const ranges = [
      { start: 0, end: 20, label: "0-20" },
      { start: 20, end: 40, label: "20-40" },
      { start: 40, end: 60, label: "40-60" },
      { start: 60, end: 80, label: "60-80" },
      { start: 80, end: 100, label: "80-100" }
    ];

    const buckets: { range: string; count: number; percentage: number }[] = [];

    ranges.forEach(({ start, end, label }) => {
      // Count grades in this range
      let count = 0;
      Object.entries(gradeDistribution).forEach(([score, scoreCount]) => {
        const scoreNum = parseFloat(score);
        if (scoreNum >= start && scoreNum < end) {
          count += scoreCount;
        }
      });

      const percentage = statistics.total_students > 0 ? (count / statistics.total_students) * 100 : 0;
      buckets.push({ range: label, count, percentage });
    });

    return buckets;
  };

  const histogramData = generateHistogramData();
  const maxCount = Math.max(...histogramData.map(b => b.count));

  // Show loading state
  if (assignmentLoading || isLoading) {
    return (
      <Grid
        templateAreas={{ base: `"main"`, md: `"aside main"` }}
        templateColumns={{ base: "1fr", md: "300px 1fr" }}
        minH="100vh"
        gap={0}
      >
        <GridItem area="aside">
          <DynamicSidebar />
        </GridItem>
        <GridItem area="main" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
          <VStack gap={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color={textColor}>در حال بارگذاری اطلاعات نمرات...</Text>
          </VStack>
        </GridItem>
      </Grid>
    );
  }

  // Show error state
  if (assignmentError || error) {
    return (
      <Grid
        templateAreas={{ base: `"main"`, md: `"aside main"` }}
        templateColumns={{ base: "1fr", md: "300px 1fr" }}
        minH="100vh"
        gap={0}
      >
        <GridItem area="aside">
          <DynamicSidebar />
        </GridItem>
        <GridItem area="main" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
          <Box p={4} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md">
            <Text color="red.700" fontWeight="bold">خطا!</Text>
            <Text color="red.600">{assignmentError || error}</Text>
          </Box>
        </GridItem>
      </Grid>
    );
  }

  return (
    <Fragment>
    <Grid
      templateAreas={{ base: `"main"`, md: `"sidebar main"` }}
      templateColumns={{ base: "1fr", md: "300px 1fr" }}
      minH="100vh"
      gap={0}
    >
      {/* Left Sidebar - Assignment Navigation */}
      <GridItem area="sidebar">
        <DynamicSidebar />
      </GridItem>

      {/* Main Content */}
      <GridItem area="main" bg={bgColor}>
        <Box p={6}>
          <VStack align="stretch" gap={6}>
            {/* Header */}
            <VStack align="start" gap={2}>
              <Heading size="xl" color={textColor} fontWeight="bold">
                بررسی نمرات برای {assignment?.title}
              </Heading>
              <HStack gap={4}>
                <HStack gap={2}>
                  <Box w={3} h={3} bg="green.500" borderRadius="full" />
                  <Text fontSize="sm" color={subtleText}>درخواست‌های تجدید نظر باز</Text>
                </HStack>
                <HStack gap={2}>
                  <Box w={3} h={3} bg="gray.500" borderRadius="full" />
                  <Text fontSize="sm" color={subtleText}>نمرات منتشر نشده</Text>
                </HStack>
              </HStack>
            </VStack>

            {/* Grade Distribution Histogram */}
            <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor={borderColor}>
              <VStack align="stretch" gap={6}>
                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                  توزیع نمرات
                </Text>
                
                {/* Histogram */}
                <Box>
                  {/* X-axis labels */}
                  <HStack justify="space-between" mb={2} px={4}>
                    <Text fontSize="xs" color={subtleText}>0</Text>
                    <Text fontSize="xs" color={subtleText}>20</Text>
                    <Text fontSize="xs" color={subtleText}>40</Text>
                    <Text fontSize="xs" color={subtleText}>60</Text>
                    <Text fontSize="xs" color={subtleText}>80</Text>
                    <Text fontSize="xs" color={subtleText}>100</Text>
                  </HStack>
                  
                  {/* Histogram bars */}
                  <VStack align="stretch" gap={3}>
                    {histogramData.map((bucket, index) => (
                      <Box key={index} position="relative">
                        <HStack align="center" gap={4}>
                          <Text fontSize="sm" color={subtleText} w="60px" textAlign="right">
                            {bucket.range}
                          </Text>
                          <Box flex="1" h="30px" bg="gray.100" borderRadius="md" overflow="hidden" position="relative">
                            <Box
                              h="100%"
                              w={`${maxCount > 0 ? (bucket.count / maxCount) * 100 : 0}%`}
                              bg="blue.500"
                              borderRadius="md"
                              transition="width 0.5s ease"
                              boxShadow="sm"
                            />
                            {bucket.count > 0 && (
                              <Text
                                fontSize="sm"
                                color="white"
                                fontWeight="bold"
                                position="absolute"
                                top="50%"
                                left="50%"
                                transform="translate(-50%, -50%)"
                                textShadow="0 1px 2px rgba(0,0,0,0.5)"
                                zIndex={1}
                              >
                                {bucket.count}
                              </Text>
                            )}
                          </Box>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                  
                  {/* Y-axis label */}
                  <Text fontSize="xs" color={subtleText} textAlign="center" mt={2}>
                    تعداد دانشجویان
                  </Text>
                </Box>
              </VStack>
            </Box>

            {/* Statistics */}
            <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor={borderColor}>
              <VStack align="stretch" gap={4}>
                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                  آمار نمرات
                </Text>
                
                <Grid templateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap={4}>
                  <Stat.Root>
                    <Stat.Label color={subtleText}>حداقل</Stat.Label>
                    <Stat.ValueText color={textColor}>{statistics?.minimum?.toFixed(1) || '0.0'}</Stat.ValueText>
                  </Stat.Root>
                  <Stat.Root>
                    <Stat.Label color={subtleText}>میانه</Stat.Label>
                    <Stat.ValueText color={textColor}>{statistics?.median?.toFixed(1) || '0.0'}</Stat.ValueText>
                  </Stat.Root>
                  <Stat.Root>
                    <Stat.Label color={subtleText}>حداکثر</Stat.Label>
                    <Stat.ValueText color={textColor}>{statistics?.maximum?.toFixed(1) || '0.0'}</Stat.ValueText>
                  </Stat.Root>
                  <Stat.Root>
                    <Stat.Label color={subtleText}>میانگین</Stat.Label>
                    <Stat.ValueText color={textColor}>{statistics?.mean?.toFixed(1) || '0.0'}</Stat.ValueText>
                  </Stat.Root>
                  <Stat.Root>
                    <Stat.Label color={subtleText}>انحراف معیار</Stat.Label>
                    <Stat.ValueText color={textColor}>{statistics?.std_dev?.toFixed(1) || '0.0'}</Stat.ValueText>
                    <Stat.HelpText>
                      <Icon as={FiEye} />
                    </Stat.HelpText>
                  </Stat.Root>
                </Grid>
              </VStack>
            </Box>

            {/* Student Grades Table */}
            <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor={borderColor}>
              <VStack align="stretch" gap={4}>
                <HStack justify="space-between" align="center">
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    {filteredAndSortedGrades.length} دانشجو
                  </Text>
                  <Box position="relative" maxW="300px">
                    <Input
                      placeholder="جستجو در دانشجویان..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      pl={10}
                    />
                    <Icon 
                      as={FiSearch} 
                      color="gray.400" 
                      position="absolute"
                      left={3}
                      top="50%"
                      transform="translateY(-50%)"
                      pointerEvents="none"
                    />
                  </Box>
                </HStack>

                <Box
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="md"
                  overflow="hidden"
                  maxH="calc(100vh - 300px)"
                  overflowY="auto"
                >
                  <Table.Root>
                    <Table.Header bg={tableHeaderBg} position="sticky" top={0} zIndex={10}>
                      <Table.Row>
                        <Table.ColumnHeader 
                          cursor="pointer" 
                          onClick={() => handleSort('student_name')}
                          _hover={{ bg: hoverBg }}
                          userSelect="none"
                          py={4}
                          px={6}
                        >
                          <HStack>
                            <Text fontSize="sm" fontWeight="semibold">نام و نام خانوادگی</Text>
                            {getSortIcon('student_name')}
                          </HStack>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader 
                          cursor="pointer" 
                          onClick={() => handleSort('email')}
                          _hover={{ bg: hoverBg }}
                          userSelect="none"
                          py={4}
                          px={6}
                        >
                          <HStack>
                            <Text fontSize="sm" fontWeight="semibold">ایمیل</Text>
                            {getSortIcon('email')}
                          </HStack>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader 
                          cursor="pointer" 
                          onClick={() => handleSort('total_score')}
                          _hover={{ bg: hoverBg }}
                          userSelect="none"
                          py={4}
                          px={6}
                        >
                          <HStack>
                            <Text fontSize="sm" fontWeight="semibold">نمره/{statistics?.maximum?.toFixed(1) || '0.0'}</Text>
                            {getSortIcon('total_score')}
                          </HStack>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader 
                          cursor="pointer" 
                          onClick={() => handleSort('is_graded')}
                          _hover={{ bg: hoverBg }}
                          userSelect="none"
                          py={4}
                          px={6}
                        >
                          <HStack>
                            <Text fontSize="sm" fontWeight="semibold">وضعیت نمره‌دهی</Text>
                            {getSortIcon('is_graded')}
                          </HStack>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader 
                          cursor="pointer" 
                          onClick={() => handleSort('is_viewed')}
                          _hover={{ bg: hoverBg }}
                          userSelect="none"
                          py={4}
                          px={6}
                        >
                          <HStack>
                            <Text fontSize="sm" fontWeight="semibold">مشاهده شده</Text>
                            {getSortIcon('is_viewed')}
                          </HStack>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader 
                          cursor="pointer" 
                          onClick={() => handleSort('graded_at')}
                          _hover={{ bg: hoverBg }}
                          userSelect="none"
                          py={4}
                          px={6}
                        >
                          <HStack>
                            <Text fontSize="sm" fontWeight="semibold">زمان نمره‌دهی</Text>
                            {getSortIcon('graded_at')}
                          </HStack>
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {filteredAndSortedGrades.length === 0 ? (
                        <Table.Row>
                          <Table.Cell colSpan={6} textAlign="center" py={8}>
                            <Text color={subtleText}>هیچ دانشجویی یافت نشد</Text>
                          </Table.Cell>
                        </Table.Row>
                      ) : (
                        filteredAndSortedGrades.map((grade) => (
                          <Table.Row 
                            key={grade.id} 
                            _hover={{ bg: tableRowHover }}
                            cursor="pointer"
                          >
                            <Table.Cell py={4} px={4}>
                              <Text 
                                fontWeight="medium" 
                                color={textColor}
                              >
                                {grade.student_name || '(بدون نام)'}
                              </Text>
                            </Table.Cell>
                            <Table.Cell py={4} px={4}>
                              <Text 
                                fontSize="sm" 
                                color={subtleText}
                              >
                                {grade.email || '--'}
                              </Text>
                            </Table.Cell>
                            <Table.Cell py={4} px={4}>
                              <Text 
                                fontWeight="bold" 
                                color={grade.total_score >= (grade.max_score * 0.8) ? "green.500" : grade.total_score >= (grade.max_score * 0.6) ? "orange.500" : "red.500"}
                              >
                                {grade.total_score?.toFixed(1) || '0.0'}
                              </Text>
                            </Table.Cell>
                            <Table.Cell py={4} px={4}>
                              {grade.is_graded ? (
                                <Badge colorScheme="green" variant="subtle" size="sm">
                                  <Icon as={FiCheck} mr={1} />
                                  نمره‌دهی شده
                                </Badge>
                              ) : (
                                <Badge colorScheme="red" variant="subtle" size="sm">
                                  <Icon as={FiX} mr={1} />
                                  نمره‌دهی نشده
                                </Badge>
                              )}
                            </Table.Cell>
                            <Table.Cell py={4} px={4}>
                              <Badge 
                                colorScheme={grade.is_viewed ? "blue" : "gray"}
                                variant="subtle"
                                size="sm"
                              >
                                {grade.is_viewed ? "مشاهده شده" : "مشاهده نشده"}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell py={4} px={4}>
                              <Text 
                                fontSize="sm" 
                                color={subtleText}
                              >
                                {grade.graded_at ? new Date(grade.graded_at).toLocaleDateString('fa-IR') : '--'}
                              </Text>
                            </Table.Cell>
                          </Table.Row>
                        ))
                      )}
                    </Table.Body>
                  </Table.Root>
                </Box>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </GridItem>
    </Grid>

    {/* Bottom Action Bar */}
    <Box
      position='fixed'
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
      <HStack justify="flex-end" mx="auto" px={{ base: 4, md: 6 }} gap={3}>
        <Button
          bg="#2E5BBA"
          color="white"
          size={{ base: "sm", md: "md" }}
          paddingLeft={2}
          _hover={{ bg: "#1E4A9A" }}
          fontSize={{ base: "xs", md: "sm" }}
        >
          <Icon as={FiDownload} mr={2} />
          دانلود نمرات
        </Button>
        
        <Button
          bg="#2E5BBA"
          color="white"
          size={{ base: "sm", md: "md" }}
          paddingRight={2}
          _hover={{ bg: "#1E4A9A" }}
          fontSize={{ base: "xs", md: "sm" }}
        >
          انتشار نمرات
          <Icon as={FiArrowUp} ml={2} />
        </Button>
      </HStack>
    </Box>
    </Fragment>
  );
};

export default ReviewGradesPage;
