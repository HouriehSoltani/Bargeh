import React, { useState, useCallback, useRef } from 'react';
import { Box, VStack, HStack, Text, Button, Icon } from '@chakra-ui/react';
import { FiPlus, FiX, FiSave } from 'react-icons/fi';

interface Question {
  id: string;
  title: string;
  points: number;
  position?: {
    pageNumber: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface SimplePDFAnnotationViewerProps {
  pdfUrl: string;
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  onSaveOutline: () => void;
  onCancel: () => void;
}

const SimplePDFAnnotationViewer: React.FC<SimplePDFAnnotationViewerProps> = ({
  pdfUrl,
  questions,
  onQuestionsChange,
  onSaveOutline,
  onCancel,
}) => {
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionPoints, setNewQuestionPoints] = useState(10);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const addQuestion = useCallback(() => {
    if (!newQuestionTitle.trim()) return;

    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      title: newQuestionTitle,
      points: newQuestionPoints,
    };

    onQuestionsChange([...questions, newQuestion]);
    setNewQuestionTitle('');
    setNewQuestionPoints(10);
    setIsAddingQuestion(false);
  }, [newQuestionTitle, newQuestionPoints, questions, onQuestionsChange]);

  const removeQuestion = useCallback((questionId: string) => {
    onQuestionsChange(questions.filter(q => q.id !== questionId));
  }, [questions, onQuestionsChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isSelecting) return;
    
    const rect = pdfContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelectionStart({ x, y });
    setSelectionEnd({ x, y });
  }, [isSelecting]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !selectionStart) return;
    
    const rect = pdfContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelectionEnd({ x, y });
  }, [isSelecting, selectionStart]);

  const handleMouseUp = useCallback(() => {
    if (!isSelecting || !selectionStart || !selectionEnd) return;

    // Find the question that doesn't have a position yet
    const questionWithoutPosition = questions.find(q => !q.position);
    if (questionWithoutPosition && pdfContainerRef.current) {
      
      const x = Math.min(selectionStart.x, selectionEnd.x);
      const y = Math.min(selectionStart.y, selectionEnd.y);
      const width = Math.abs(selectionEnd.x - selectionStart.x);
      const height = Math.abs(selectionEnd.y - selectionStart.y);

      // Update the question with position
      const updatedQuestions = questions.map(q => {
        if (q.id === questionWithoutPosition.id) {
          return {
            ...q,
            position: {
              pageNumber: 1, // For now, assume single page
              x,
              y,
              width,
              height,
            },
          };
        }
        return q;
      });
      
      onQuestionsChange(updatedQuestions);
    }

    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [isSelecting, selectionStart, selectionEnd, questions, onQuestionsChange]);

  const startSelection = useCallback(() => {
    setIsSelecting(true);
  }, []);

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  const getSelectionStyle = () => {
    if (!selectionStart || !selectionEnd) return {};
    
    const x = Math.min(selectionStart.x, selectionEnd.x);
    const y = Math.min(selectionStart.y, selectionEnd.y);
    const width = Math.abs(selectionEnd.x - selectionStart.x);
    const height = Math.abs(selectionEnd.y - selectionStart.y);

    return {
      position: 'absolute' as const,
      left: x,
      top: y,
      width,
      height,
      border: '2px dashed #2E5BBA',
      backgroundColor: 'rgba(46, 91, 186, 0.1)',
      pointerEvents: 'none' as const,
      zIndex: 10,
    };
  };

  return (
    <Box w="100%" h="100%" display="flex" gap={4}>
      {/* Question Management Panel */}
      <Box w="300px" bg="white" borderRadius="lg" p={4} boxShadow="sm">
        <VStack align="stretch" gap={4} h="100%">
          {/* Header */}
          <Text fontSize="lg" fontWeight="bold" color="gray.800">
            مدیریت سوالات
          </Text>

          {/* Selection Instructions */}
          <Box bg="blue.50" p={3} borderRadius="md">
            <Text fontSize="sm" color="blue.600" fontWeight="medium" mb={2}>
              نحوه استفاده:
            </Text>
            <Text fontSize="xs" color="blue.500">
              1. سوال اضافه کنید
            </Text>
            <Text fontSize="xs" color="blue.500">
              2. روی "انتخاب موقعیت" کلیک کنید
            </Text>
            <Text fontSize="xs" color="blue.500">
              3. روی PDF بکشید تا موقعیت را مشخص کنید
            </Text>
          </Box>

          {/* Total Points */}
          <Box bg="green.50" p={3} borderRadius="md">
            <Text fontSize="sm" color="green.600" fontWeight="medium">
              مجموع نمرات: {totalPoints}
            </Text>
          </Box>

          {/* Add Question Form */}
          {isAddingQuestion ? (
            <VStack align="stretch" gap={3} p={3} bg="gray.50" borderRadius="md">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                افزودن سوال جدید
              </Text>
              <input
                type="text"
                placeholder="عنوان سوال"
                value={newQuestionTitle}
                onChange={(e) => setNewQuestionTitle(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
              <input
                type="number"
                placeholder="نمره"
                value={newQuestionPoints}
                onChange={(e) => setNewQuestionPoints(Number(e.target.value))}
                min="1"
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
              <HStack gap={2}>
                <Button size="sm" colorScheme="blue" onClick={addQuestion}>
                  <Icon as={FiPlus} mr={1} />
                  افزودن
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsAddingQuestion(false)}>
                  <Icon as={FiX} mr={1} />
                  انصراف
                </Button>
              </HStack>
            </VStack>
          ) : (
            <Button
              colorScheme="blue"
              variant="outline"
              onClick={() => setIsAddingQuestion(true)}
            >
              <Icon as={FiPlus} mr={2} />
              افزودن سوال
            </Button>
          )}

          {/* Selection Button */}
          <Button
            colorScheme={isSelecting ? "red" : "green"}
            variant={isSelecting ? "solid" : "outline"}
            onClick={isSelecting ? () => setIsSelecting(false) : startSelection}
          >
            {isSelecting ? "لغو انتخاب" : "انتخاب موقعیت"}
          </Button>

          {/* Questions List */}
          <VStack align="stretch" gap={2} flex="1" overflowY="auto">
            {questions.map((question, index) => (
              <Box
                key={question.id}
                p={3}
                bg={question.position ? "green.50" : "yellow.50"}
                borderRadius="md"
                border="1px solid"
                borderColor={question.position ? "green.200" : "yellow.200"}
              >
                <VStack align="stretch" gap={2}>
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="medium" color="gray.800">
                      سوال {index + 1}
                    </Text>
                    <Button
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <Icon as={FiX} />
                    </Button>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    {question.title}
                  </Text>
                  <Text fontSize="xs" color="blue.600" fontWeight="medium">
                    {question.points} نمره
                  </Text>
                  {question.position ? (
                    <Text fontSize="xs" color="green.600">
                      ✓ موقعیت مشخص شده
                    </Text>
                  ) : (
                    <Text fontSize="xs" color="orange.600">
                      ⚠ نیاز به انتخاب موقعیت
                    </Text>
                  )}
                </VStack>
              </Box>
            ))}
          </VStack>

          {/* Action Buttons */}
          <VStack gap={2}>
            <Button
              colorScheme="blue"
              w="100%"
              onClick={onSaveOutline}
            >
              <Icon as={FiSave} mr={2} />
              ذخیره طرح کلی
            </Button>
            <Button
              variant="outline"
              w="100%"
              onClick={onCancel}
            >
              انصراف
            </Button>
          </VStack>
        </VStack>
      </Box>

      {/* PDF Viewer */}
      <Box flex="1" bg="white" borderRadius="lg" boxShadow="sm" overflow="hidden" position="relative">
        <Box
          ref={pdfContainerRef}
          h="100%"
          position="relative"
          cursor={isSelecting ? "crosshair" : "default"}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* PDF iframe */}
          <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title="Assignment PDF"
          />
          
          {/* Selection overlay */}
          {isSelecting && selectionStart && selectionEnd && (
            <div style={getSelectionStyle()} />
          )}
          
          {/* Question annotations */}
          {questions.map((question, index) => {
            if (!question.position) return null;
            
            return (
              <Box
                key={question.id}
                position="absolute"
                left={`${question.position.x}px`}
                top={`${question.position.y}px`}
                width={`${question.position.width}px`}
                height={`${question.position.height}px`}
                bg="rgba(46, 91, 186, 0.1)"
                border="2px solid"
                borderColor="#2E5BBA"
                borderRadius="md"
                _hover={{ bg: "rgba(46, 91, 186, 0.2)" }}
                zIndex={5}
              >
                {/* Question Header */}
                <Box
                  bg="#2E5BBA"
                  color="white"
                  p={2}
                  borderRadius="md md 0 0"
                  fontSize="xs"
                  fontWeight="semibold"
                >
                  {index + 1}: {question.title} ({question.points} امتیاز)
                </Box>
                
                {/* Question Content */}
                <Box p={2} h="calc(100% - 32px)" overflow="hidden">
                  <Text fontSize="xs" color="gray.700">
                    {question.title}
                  </Text>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default SimplePDFAnnotationViewer;
