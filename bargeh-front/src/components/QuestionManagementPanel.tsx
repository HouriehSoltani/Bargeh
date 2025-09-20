import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { useColorModeValue } from '@/hooks/useColorMode';
import { FiPlus, FiX, FiSave } from 'react-icons/fi';

interface Question {
  id: string;
  title: string;
  points: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface QuestionManagementPanelProps {
  questions: Question[];
  newQuestionTitle: string;
  newQuestionPoints: number;
  onQuestionTitleChange: (title: string) => void;
  onQuestionPointsChange: (points: number) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (questionId: string) => void;
  onSaveOutline: () => void;
  onCancel: () => void;
}

const QuestionManagementPanel: React.FC<QuestionManagementPanelProps> = ({
  questions,
  newQuestionTitle,
  newQuestionPoints,
  onQuestionTitleChange,
  onQuestionPointsChange,
  onAddQuestion,
  onRemoveQuestion,
  onSaveOutline,
  onCancel,
}) => {
  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");
  const subtleText = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const cardBg = useColorModeValue("white", "gray.700");

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <VStack align="stretch" gap={4} h="100vh" p={4} bg={bgColor} borderLeft="1px" borderColor={borderColor}>
      {/* Total Points */}
      <Box p={3} bg={cardBg} borderRadius="md" border="1px" borderColor={borderColor}>
        <Text fontSize="sm" color={subtleText}>
          مجموع امتیازات
        </Text>
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          {totalPoints} امتیاز
        </Text>
      </Box>

      {/* Add Question Form */}
      <Box p={3} bg={cardBg} borderRadius="md" border="1px" borderColor={borderColor}>
        <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={3}>
          افزودن سوال جدید
        </Text>
        <VStack align="stretch" gap={3}>
          <Input
            placeholder="عنوان سوال"
            value={newQuestionTitle}
            onChange={(e) => onQuestionTitleChange(e.target.value)}
            size="sm"
            bg={bgColor}
            borderColor={borderColor}
          />
          <HStack>
            <Text fontSize="sm" color={subtleText} minW="fit-content">
              امتیاز:
            </Text>
            <Input
              type="number"
              value={newQuestionPoints}
              onChange={(e) => onQuestionPointsChange(parseInt(e.target.value) || 1)}
              size="sm"
              w="80px"
              bg={bgColor}
              borderColor={borderColor}
              min={1}
            />
          </HStack>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={onAddQuestion}
            disabled={!newQuestionTitle.trim()}
          >
            <Icon as={FiPlus} mr={2} />
            افزودن سوال
          </Button>
        </VStack>
      </Box>

      {/* Questions List */}
      <Box flex={1} overflowY="auto">
        <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={3}>
          سوالات ({questions.length})
        </Text>
        <VStack align="stretch" gap={2}>
          {questions.map((question, index) => (
            <Box
              key={question.id}
              p={3}
              bg={cardBg}
              borderRadius="md"
              border="1px"
              borderColor={borderColor}
              _hover={{ borderColor: "#4A90E2" }}
            >
              <HStack justify="space-between" mb={2}>
                <HStack>
                  <Badge colorScheme="blue" size="sm">
                    {index + 1}
                  </Badge>
                  <Text fontSize="sm" fontWeight="medium" color={textColor}>
                    {question.title}
                  </Text>
                </HStack>
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => onRemoveQuestion(question.id)}
                >
                  <Icon as={FiX} />
                </Button>
              </HStack>
              <Text fontSize="xs" color={subtleText}>
                {question.points} امتیاز
              </Text>
            </Box>
          ))}
          {questions.length === 0 && (
            <Text fontSize="sm" color={subtleText} textAlign="center" py={4}>
              هیچ سوالی اضافه نشده است
            </Text>
          )}
        </VStack>
      </Box>

      {/* Action Buttons */}
      <VStack align="stretch" gap={2} mt={4}>
        <Button
          colorScheme="blue"
          onClick={onSaveOutline}
          disabled={questions.length === 0}
        >
          <Icon as={FiSave} mr={2} />
          ذخیره طرح کلی
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
        >
          انصراف
        </Button>
      </VStack>
    </VStack>
  );
};

export default QuestionManagementPanel;
