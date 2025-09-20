import React, { useState, useCallback, useMemo } from 'react';
import { Box, VStack, HStack, Text, Button, Icon } from '@chakra-ui/react';
import { FiPlus, FiX, FiSave } from 'react-icons/fi';
import { PdfLoader, PdfHighlighter } from 'react-pdf-highlighter';
import type { IHighlight, NewHighlight } from 'react-pdf-highlighter';

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

interface PDFAnnotationViewerProps {
  pdfUrl: string;
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  onSaveOutline: () => void;
  onCancel: () => void;
}

const PDFAnnotationViewer: React.FC<PDFAnnotationViewerProps> = ({
  pdfUrl,
  questions,
  onQuestionsChange,
  onSaveOutline,
  onCancel,
}) => {
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionPoints, setNewQuestionPoints] = useState(10);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  // Convert questions to highlights for the PDF viewer
  const highlights = useMemo(() => {
    return questions
      .filter(q => q.position)
      .map((question) => ({
        id: question.id,
        content: {
          text: `${question.title} (${question.points} points)`,
        },
        position: {
          boundingRect: {
            x1: question.position!.x,
            y1: question.position!.y,
            x2: question.position!.x + question.position!.width,
            y2: question.position!.y + question.position!.height,
            width: question.position!.width,
            height: question.position!.height,
          },
          rects: [{
            x1: question.position!.x,
            y1: question.position!.y,
            x2: question.position!.x + question.position!.width,
            y2: question.position!.y + question.position!.height,
            width: question.position!.width,
            height: question.position!.height,
          }],
          pageNumber: question.position!.pageNumber,
        },
        comment: {
          text: question.title,
          emoji: '❓',
        },
      })) as IHighlight[];
  }, [questions]);

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

  const updateQuestionPosition = useCallback((questionId: string, highlight: IHighlight) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          position: {
            pageNumber: highlight.position.pageNumber,
            x: highlight.position.boundingRect.x1,
            y: highlight.position.boundingRect.y1,
            width: highlight.position.boundingRect.width,
            height: highlight.position.boundingRect.height,
          },
        };
      }
      return q;
    });
    onQuestionsChange(updatedQuestions);
  }, [questions, onQuestionsChange]);

  const handleHighlight = useCallback((highlight: NewHighlight) => {
    // Find the question that doesn't have a position yet
    const questionWithoutPosition = questions.find(q => !q.position);
    if (questionWithoutPosition) {
      // Convert NewHighlight to IHighlight by adding an id
      const highlightWithId: IHighlight = {
        ...highlight,
        id: `highlight-${Date.now()}`,
      };
      updateQuestionPosition(questionWithoutPosition.id, highlightWithId);
    }
  }, [questions, updateQuestionPosition]);

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <Box w="100%" h="100%" display="flex" gap={4}>
      {/* Question Management Panel */}
      <Box w="300px" bg="white" borderRadius="lg" p={4} boxShadow="sm">
        <VStack align="stretch" gap={4} h="100%">
          {/* Header */}
          <Text fontSize="lg" fontWeight="bold" color="gray.800">
            مدیریت سوالات
          </Text>

          {/* Total Points */}
          <Box bg="blue.50" p={3} borderRadius="md">
            <Text fontSize="sm" color="blue.600" fontWeight="medium">
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
      <Box flex="1" bg="white" borderRadius="lg" boxShadow="sm" overflow="hidden">
        <Box 
          h="100%" 
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
        >
          <PdfLoader 
            url={pdfUrl}
            beforeLoad={() => (
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="center" 
                h="100%"
                bg="gray.50"
              >
                <Text>Loading PDF...</Text>
              </Box>
            )}
            onError={(error: any) => (
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="center" 
                h="100%"
                bg="red.50"
                p={4}
              >
                <VStack>
                  <Text color="red.500">Error loading PDF</Text>
                  <Text fontSize="sm" color="red.400">{error.message}</Text>
                </VStack>
              </Box>
            )}
          >
            {(pdfDocument: any) => (
              <Box position="relative" h="100%" w="100%">
                <PdfHighlighter
                  pdfDocument={pdfDocument}
                  enableAreaSelection={(event: any) => event.altKey}
                  onScrollChange={() => {}}
                  scrollRef={(_scrollTo: any) => {}}
                  onSelectionFinished={(
                    position: any,
                    content: any,
                    hideTipAndSelection: any,
                    _transformSelection: any
                  ) => {
                    const highlight: NewHighlight = {
                      content,
                      position,
                      comment: {
                        text: '',
                        emoji: '',
                      },
                    };
                    handleHighlight(highlight);
                    hideTipAndSelection();
                  }}
                  highlightTransform={(
                    highlight: any,
                    index: any,
                    setTip: any,
                    _hideTip: any,
                    _viewportToScaled: any,
                    _screenshot: any,
                    _isScrolledTo: any
                  ) => {
                    const isTextHighlight = !Boolean(
                      highlight.content && highlight.content.image
                    );

                    const component = isTextHighlight ? (
                      <div
                        style={{
                          background: highlight.comment?.emoji === '❓' ? '#ffeb3b' : '#fff59d',
                          borderRadius: '3px',
                          padding: '2px 4px',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setTip(highlight, (highlight: any) => (
                            <div style={{ background: 'white', padding: '8px' }}>
                              <strong>{highlight.comment?.text}</strong>
                            </div>
                          ));
                        }}
                      >
                        {highlight.comment?.text}
                      </div>
                    ) : (
                      <div
                        style={{
                          background: 'rgba(255, 255, 0, 0.3)',
                          borderRadius: '3px',
                          padding: '2px 4px',
                        }}
                      >
                        {highlight.comment?.text}
                      </div>
                    );

                    return (
                      <div
                        key={index}
                        style={{
                          position: 'absolute',
                          left: `${highlight.position.boundingRect.left}%`,
                          top: `${highlight.position.boundingRect.top}%`,
                          width: `${highlight.position.boundingRect.width}%`,
                          height: `${highlight.position.boundingRect.height}%`,
                          zIndex: 1,
                        }}
                      >
                        {component}
                      </div>
                    );
                  }}
                  highlights={highlights}
                />
              </Box>
            )}
          </PdfLoader>
        </Box>
      </Box>
    </Box>
  );
};

export default PDFAnnotationViewer;
