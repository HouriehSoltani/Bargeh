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
  Badge,
} from '@chakra-ui/react';
import { FiCheck, FiX } from 'react-icons/fi';
import { useColorModeValue } from '@/hooks/useColorMode';
import { useAssignment } from '@/hooks/useAssignment';
import DynamicSidebar from '@/components/DynamicSidebar';
import { questionService, type Question } from '@/services/questionService';
import { api } from '@/services/api';

interface QuestionSubmission {
  id: number;
  submission_id: number;
  row_number: number;
  student_name: string;
  graded_by: string | null;
  score: number | null;
  is_graded: boolean;
  graded_at: string | null;
}

const QuestionSubmissionsPage = () => {
  const { courseId, assignmentId, questionId } = useParams<{ 
    courseId: string;
    assignmentId: string; 
    questionId: string; 
  }>();
  const navigate = useNavigate();

  // Fetch assignment data
  const { assignment, isLoading: assignmentLoading, error: assignmentError } = useAssignment(assignmentId);

  // State
  const [question, setQuestion] = useState<Question | null>(null);
  const [submissions, setSubmissions] = useState<QuestionSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");
  const subtleText = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.800");
  const tableRowHover = useColorModeValue("gray.50", "gray.800");

  // Load question and submissions data
  useEffect(() => {
    const loadData = async () => {
      if (!assignmentId || !questionId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Load assignment questions to find the specific question
        const questions = await questionService.getQuestions(parseInt(assignmentId));
        const foundQuestion = questions.find(q => q.id?.toString() === questionId);
        
        if (!foundQuestion) {
          setError('سوال مورد نظر یافت نشد');
          return;
        }
        
        setQuestion(foundQuestion);

        // Load submissions for this question
        const response = await api.get(`/api/assignments/${assignmentId}/questions/${questionId}/submissions/`);
        console.log('Question submissions response:', response);
        
        setSubmissions((response as any).submissions || []);
      } catch (err: any) {
        console.error('Error loading question submissions:', err);
        setError('خطا در بارگذاری اطلاعات ارسال‌ها');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [assignmentId, questionId]);

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
                {question?.title}
              </Heading>
              <Box height="20px" width="1px" bg="gray.400" />
              <Text color="gray.600" fontSize="lg">
                {assignment?.title}
              </Text>
            </HStack>
            <Text color="subtleText" fontSize="sm">
              نمره: {question?.max_points}
            </Text>
          </Box>

            {/* Submissions Table */}
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
                        شماره 
                      </Box>
                      <Box as="th" p={3} textAlign="right" color={textColor} fontWeight="semibold">
                        نام دانشجو
                      </Box>
                      <Box as="th" p={3} textAlign="right" color={textColor} fontWeight="semibold">
                        نمره‌دهنده
                      </Box>
                      <Box as="th" p={3} textAlign="right" color={textColor} fontWeight="semibold">
                        نمره
                      </Box>
                      <Box as="th" p={3} textAlign="center" color={textColor} fontWeight="semibold">
                        نمره‌دهی شده
                      </Box>
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {isLoading ? (
                      <Box as="tr">
                        <Box as="td" p={6} textAlign="center" {...{ colSpan: 5 }}>
                          <VStack>
                            <Spinner size="md" color="blue.500" />
                            <Text color={textColor}>در حال بارگذاری ارسال‌ها...</Text>
                          </VStack>
                        </Box>
                      </Box>
                    ) : !submissions || submissions.length === 0 ? (
                      <Box as="tr">
                        <Box as="td" p={6} textAlign="center" {...{ colSpan: 5 }}>
                          <VStack>
                            <Text color={subtleText} fontSize="md">هیچ ارسالی یافت نشد.</Text>
                          </VStack>
                        </Box>
                      </Box>
                    ) : (
                      (submissions || []).map((submission) => (
                        <Box 
                          key={submission.id}
                          as="tr" 
                          borderBottom="1px" 
                          borderColor={borderColor}
                          _hover={{ bg: tableRowHover }}
                        >
                          <Box as="td" p={3} color={textColor} fontWeight="medium">
                            {submission.row_number}
                          </Box>
                          <Box as="td" p={3} color={textColor} fontWeight="medium">
                            <Text
                              as="button"
                              color="blue.500"
                              cursor="pointer"
                              textDecoration="underline"
                              _hover={{ 
                                color: "blue.700",
                                textDecoration: "underline"
                              }}
                              onClick={() => {
                                navigate(`/courses/${courseId}/assignments/${assignmentId}/questions/${questionId}/submissions/${submission.submission_id}/grade`);
                              }}
                            >
                              {submission.student_name}
                            </Text>
                          </Box>
                          <Box as="td" p={3} color={subtleText}>
                            {submission.graded_by || 'نامشخص'}
                          </Box>
                          <Box as="td" p={3} color={textColor} fontWeight="medium">
                            {submission.score !== null ? submission.score : '-'}
                          </Box>
                          <Box as="td" p={3} textAlign="center">
                            {submission.is_graded ? (
                              <Badge colorScheme="green" variant="solid">
                                <Icon as={FiCheck} mr={1} />
                                بله
                              </Badge>
                            ) : (
                              <Badge colorScheme="red" variant="solid">
                                <Icon as={FiX} mr={1} />
                                خیر
                              </Badge>
                            )}
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

export default QuestionSubmissionsPage;
