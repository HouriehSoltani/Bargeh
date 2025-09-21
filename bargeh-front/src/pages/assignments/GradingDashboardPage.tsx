import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  GridItem,
  VStack,
  HStack,
  Text,
  Icon,
  Heading,
  Spinner,
} from '@chakra-ui/react';
import { FiChevronUp } from 'react-icons/fi';
import { useColorModeValue } from '@/hooks/useColorMode';
import { useAssignment } from '@/hooks/useAssignment';
import DynamicSidebar from '@/components/DynamicSidebar';
import { questionService } from '@/services/questionService';
import { api } from '@/services/api';

interface GradingStats {
  question_id: number;
  question_title: string;
  points: number;
  total_submissions: number;
  graded_submissions: number;
  progress_percentage: number;
  graded_by: string;
}

const GradingDashboardPage = () => {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>();
  const navigate = useNavigate();

  // Fetch assignment data
  const { assignment, isLoading: assignmentLoading, error: assignmentError } = useAssignment(assignmentId);

  // State
  const [gradingStats, setGradingStats] = useState<GradingStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");
  const subtleText = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.800");
  const tableRowHover = useColorModeValue("gray.50", "gray.800");
  const progressBg = useColorModeValue("gray.200", "gray.600");

  // Load grading data
  useEffect(() => {
    const loadGradingData = async () => {
      if (!assignmentId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Load assignment questions
        const questions = await questionService.getQuestions(parseInt(assignmentId));
        console.log('Questions loaded:', questions);

        // Load grading statistics for each question
        const statsPromises = questions
          .filter(q => q.id !== undefined)
          .map(async (question) => {
            try {
              const response = await api.get(`/api/assignments/${assignmentId}/questions/${question.id}/grading-stats/`);
              return {
                question_id: question.id!,
                question_title: question.title || `سوال ${question.id}`,
                points: question.max_points || 0,
                total_submissions: (response as any).total_submissions || 0,
                graded_submissions: (response as any).graded_submissions || 0,
                progress_percentage: (response as any).progress_percentage || 0,
                graded_by: (response as any).graded_by || 'نامشخص'
              };
            } catch (err) {
              console.warn(`Could not load stats for question ${question.id}:`, err);
              return {
                question_id: question.id!,
                question_title: question.title || `سوال ${question.id}`,
                points: question.max_points || 0,
                total_submissions: 0,
                graded_submissions: 0,
                progress_percentage: 0,
                graded_by: 'نامشخص'
              };
            }
          });

        const stats = await Promise.all(statsPromises);
        setGradingStats(stats);
      } catch (err: any) {
        console.error('Error loading grading data:', err);
        setError('خطا در بارگذاری اطلاعات نمره‌دهی');
      } finally {
        setIsLoading(false);
      }
    };

    loadGradingData();
  }, [assignmentId]);

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
          <VStack>
            <Spinner size="xl" />
            <Text color={textColor}>در حال بارگذاری...</Text>
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
        <VStack align="stretch" h="100vh" p={4}>
          {/* Header */}
          <Box mb={4}>
            <HStack align='center' gap={3} mb={2}>
              <Heading size="xl" color={textColor} fontWeight="bold">
                داشبورد نمره‌دهی
              </Heading>
              <Box height="20px" width="1px" bg="gray.400" />
              <Text color="gray.600" fontSize="lg">
                {assignment?.title}
              </Text>
            </HStack>
          </Box>

            {/* Grading Stats Table */}
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
                        سوال
                      </Box>
                      <Box as="th" p={3} textAlign="right" color={textColor} fontWeight="semibold">
                        نمره
                      </Box>
                      <Box as="th" p={3} textAlign="right" color={textColor} fontWeight="semibold">
                        <HStack gap={1}>
                          <Text>پیشرفت</Text>
                          <Icon as={FiChevronUp} boxSize={3} />
                        </HStack>
                      </Box>
                      <Box as="th" p={3} textAlign="right" color={textColor} fontWeight="semibold">
                        نمره‌دهنده
                      </Box>
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {isLoading ? (
                      <Box as="tr">
                        <Box as="td" p={6} textAlign="center" {...{ colSpan: 4 }}>
                          <VStack>
                            <Spinner size="md" color="blue.500" />
                            <Text color={textColor}>در حال بارگذاری آمار نمره‌دهی...</Text>
                          </VStack>
                        </Box>
                      </Box>
                    ) : !gradingStats || gradingStats.length === 0 ? (
                      <Box as="tr">
                        <Box as="td" p={6} textAlign="center" {...{ colSpan: 4 }}>
                          <VStack>
                            <Text color={subtleText} fontSize="md">هیچ سوالی یافت نشد.</Text>
                          </VStack>
                        </Box>
                      </Box>
                    ) : (
                      (gradingStats || []).map((stat) => (
                        <Box 
                          key={stat.question_id}
                          as="tr" 
                          borderBottom="1px" 
                          borderColor={borderColor}
                          _hover={{ bg: tableRowHover }}
                        >
                          <Box as="td" p={3}>
                            <Text
                              as="button"
                              color="blue.500"
                              fontWeight="medium"
                              textAlign="right"
                              cursor="pointer"
                              textDecoration="underline"
                              _hover={{ 
                                color: "blue.700",
                                textDecoration: "underline"
                              }}
                              onClick={() => {
                                navigate(`/courses/${courseId}/assignments/${assignmentId}/questions/${stat.question_id}/submissions`);
                              }}
                            >
                              {stat.question_title}
                            </Text>
                          </Box>
                          <Box as="td" p={3} color={textColor} fontWeight="medium">
                            {stat.points}
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
                                  width={`${stat.progress_percentage}%`}
                                  height="100%"
                                  bg={stat.progress_percentage === 100 ? "green.500" : "blue.500"}
                                  borderRadius="md"
                                />
                              </Box>
                              <Text fontSize="xs" color={subtleText}>
                                {stat.graded_submissions} / {stat.total_submissions} ({stat.progress_percentage}%)
                              </Text>
                            </VStack>
                          </Box>
                          <Box as="td" p={3} color={subtleText}>
                            {stat.graded_by}
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>
              </Box>
            </VStack>

        </VStack>
      </GridItem>
    </Grid>
  );
};

export default GradingDashboardPage;
