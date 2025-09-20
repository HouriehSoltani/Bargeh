import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Box, VStack, HStack, Text, Button, Icon, Spinner } from '@chakra-ui/react';
import { FiPlus, FiX, FiSave, FiZoomIn, FiZoomOut, FiRotateCw, FiMove, FiEdit3, FiSquare, FiType } from 'react-icons/fi';
import { Document, Page, pdfjs } from 'react-pdf';
import * as fabric from 'fabric';

// Set up PDF.js worker - use local file from public directory
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

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

// interface Annotation {
//   id: string;
//   type: 'text' | 'pen' | 'rectangle' | 'highlight';
//   pageNumber: number;
//   x: number;
//   y: number;
//   width?: number;
//   height?: number;
//   content?: string;
//   color: string;
//   linkedQuestionId?: string;
// }

interface RubricItem {
  id: string;
  title: string;
  points: number;
  description?: string;
  applied: boolean;
}

interface GradescopePDFViewerProps {
  pdfUrl: string;
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  onSaveOutline: () => void;
  onCancel: () => void;
}

type Tool = 'select' | 'text' | 'pen' | 'rectangle' | 'highlight';

const GradescopePDFViewer: React.FC<GradescopePDFViewerProps> = ({
  pdfUrl,
  questions,
  onQuestionsChange,
  onSaveOutline,
  onCancel,
}) => {
  // PDF state
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  // Annotation state
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [penColor] = useState<string>('#2E5BBA');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Debug: Log PDF URL
  React.useEffect(() => {
    console.log('GradescopePDFViewer - PDF URL:', pdfUrl);
  }, [pdfUrl]);

  // Fetch PDF with proper credentials
  useEffect(() => {
    if (!pdfUrl) {
      setError('No PDF URL provided');
      setLoading(false);
      return;
    }

    // Clean up previous blob URL when PDF URL changes
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }

    let aborted = false;
    const fetchPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching PDF from:', pdfUrl);
        
        const response = await fetch(pdfUrl, {
          credentials: 'include', // Send cookies/session
          headers: {
            'Accept': 'application/pdf',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/pdf')) {
          throw new Error(`Invalid content type: ${contentType}. Expected application/pdf`);
        }

        const arrayBuffer = await response.arrayBuffer();
        if (aborted) return;

        // Create a Blob URL to avoid ArrayBuffer transfer issues
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        
        setPdfBlobUrl(blobUrl);
        setLoading(false);
        console.log('PDF fetched successfully, size:', arrayBuffer.byteLength, 'bytes');
        console.log('PDF blob URL created:', blobUrl);
      } catch (err: any) {
        if (aborted) return;
        console.error('PDF fetch error:', err);
        setError(`Failed to load PDF: ${err.message}`);
        setLoading(false);
      }
    };

    fetchPdf();
    return () => { 
      aborted = true; 
    };
  }, [pdfUrl]); // Only depend on pdfUrl, not pdfBlobUrl

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  // Question management
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionPoints, setNewQuestionPoints] = useState(10);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  // Rubric items (hardcoded for now)
  const [rubricItems] = useState<RubricItem[]>([
    { id: '1', title: 'Correct answer', points: 10, description: 'Full points for correct solution', applied: false },
    { id: '2', title: 'Partial credit', points: 5, description: 'Some correct steps shown', applied: false },
    { id: '3', title: 'Missing units', points: -1, description: 'Answer missing proper units', applied: false },
    { id: '4', title: 'Calculation error', points: -2, description: 'Mathematical error in calculation', applied: false },
  ]);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (canvasRef.current && pageRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: pageRef.current.offsetWidth,
        height: pageRef.current.offsetHeight,
        backgroundColor: 'transparent',
        selection: false,
      });

      fabricCanvasRef.current = canvas;

      // Set up drawing events
      canvas.on('mouse:down', handleCanvasMouseDown);
      canvas.on('mouse:move', handleCanvasMouseMove);
      canvas.on('mouse:up', handleCanvasMouseUp);

      // Render existing question positions
      renderQuestionPositions();

      return () => {
        canvas.dispose();
      };
    }
  }, [pageNumber, scale, questions]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully:', numPages, 'pages');
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error);
    console.error('PDF URL:', pdfUrl);
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  }, [pdfUrl]);

  const renderQuestionPositions = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    // Clear existing question rectangles
    const objects = fabricCanvasRef.current.getObjects();
    objects.forEach(obj => {
      if ((obj as any).name === 'question-rect') {
        fabricCanvasRef.current?.remove(obj);
      }
    });
    
    // Render question positions for current page
    questions.forEach(question => {
      if (question.position && question.position.pageNumber === pageNumber) {
        const rect = new fabric.Rect({
          left: question.position.x,
          top: question.position.y,
          width: question.position.width,
          height: question.position.height,
          fill: 'rgba(46, 91, 186, 0.1)',
          stroke: '#2E5BBA',
          strokeWidth: 2,
          selectable: false,
        });
        
        // Add custom properties
        (rect as any).name = 'question-rect';
        (rect as any).data = { questionId: question.id };
        
        fabricCanvasRef.current?.add(rect);
      }
    });
    
    fabricCanvasRef.current?.renderAll();
  }, [questions, pageNumber]);

  const handleCanvasMouseDown = useCallback((options: any) => {
    if (activeTool === 'pen') {
      setIsDrawing(true);
      const pointer = fabricCanvasRef.current?.getPointer(options.e);
      if (pointer) {
        const path = new fabric.Path(`M ${pointer.x} ${pointer.y}`, {
          stroke: penColor,
          strokeWidth: 2,
          fill: '',
          selectable: false,
        });
        fabricCanvasRef.current?.add(path);
        fabricCanvasRef.current?.setActiveObject(path);
      }
    } else if (activeTool === 'rectangle') {
      const pointer = fabricCanvasRef.current?.getPointer(options.e);
      if (pointer) {
        const rect = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: 'transparent',
          stroke: penColor,
          strokeWidth: 2,
          selectable: false,
        });
        fabricCanvasRef.current?.add(rect);
        fabricCanvasRef.current?.setActiveObject(rect);
      }
    }
  }, [activeTool, penColor]);

  const handleCanvasMouseMove = useCallback((options: any) => {
    if (activeTool === 'pen' && isDrawing) {
      const pointer = fabricCanvasRef.current?.getPointer(options.e);
      if (pointer) {
        const activeObject = fabricCanvasRef.current?.getActiveObject() as fabric.Path;
        if (activeObject) {
          const pathData = activeObject.path;
          if (pathData && pathData.length > 0) {
            pathData.push(['L', pointer.x, pointer.y]);
            activeObject.set('path', pathData);
            fabricCanvasRef.current?.renderAll();
          }
        }
      }
    } else if (activeTool === 'rectangle') {
      const pointer = fabricCanvasRef.current?.getPointer(options.e);
      if (pointer) {
        const activeObject = fabricCanvasRef.current?.getActiveObject() as fabric.Rect;
        if (activeObject) {
          const startX = activeObject.left || 0;
          const startY = activeObject.top || 0;
          const width = pointer.x - startX;
          const height = pointer.y - startY;
          
          activeObject.set({
            width: Math.abs(width),
            height: Math.abs(height),
            left: width < 0 ? pointer.x : startX,
            top: height < 0 ? pointer.y : startY,
          });
          fabricCanvasRef.current?.renderAll();
        }
      }
    }
  }, [activeTool, isDrawing]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsDrawing(false);
    
    // If we're positioning a question and have an active rectangle
    if (activeTool === 'rectangle' && currentQuestionId && fabricCanvasRef.current) {
      const activeObject = fabricCanvasRef.current.getActiveObject() as fabric.Rect;
      if (activeObject) {
        // Get the rectangle dimensions and position
        const rect = activeObject;
        const position = {
          pageNumber: pageNumber,
          x: rect.left || 0,
          y: rect.top || 0,
          width: rect.width || 0,
          height: rect.height || 0,
        };
        
        // Update the question with the position
        const updatedQuestions = questions.map(q => 
          q.id === currentQuestionId 
            ? { ...q, position }
            : q
        );
        
        onQuestionsChange(updatedQuestions);
        
        // Reset the tool and clear the current question
        setActiveTool('select');
        setCurrentQuestionId(null);
        
        // Remove the rectangle from canvas
        fabricCanvasRef.current.remove(rect);
        fabricCanvasRef.current.renderAll();
        
        console.log('Question positioned:', currentQuestionId, position);
      }
    }
  }, [activeTool, currentQuestionId, pageNumber, questions, onQuestionsChange]);

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

  const selectQuestionRegion = useCallback((questionId: string) => {
    setActiveTool('rectangle');
    // Store the question ID for positioning
    setCurrentQuestionId(questionId);
    console.log('Selecting region for question:', questionId);
  }, []);

  const applyRubricItem = useCallback((rubricItemId: string) => {
    // TODO: Implement rubric application
    console.log('Applying rubric item:', rubricItemId);
  }, []);

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const appliedRubricPoints = rubricItems
    .filter(item => item.applied)
    .reduce((sum, item) => sum + item.points, 0);

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="100%">
        <VStack>
          <Spinner size="lg" color="blue.500" />
          <Text>Loading PDF...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="100%">
        <VStack>
          <Text color="red.500">{error}</Text>
          <Text color="gray.500" fontSize="sm">PDF URL: {pdfUrl}</Text>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box w="100%" h="100%" display="flex" gap={4}>
      {/* Left Panel - Question Management */}
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
            <Text fontSize="xs" color="blue.500">
              نمرات اعمال شده: {appliedRubricPoints}
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
                  ) : currentQuestionId === question.id ? (
                    <Text fontSize="xs" color="blue.600" fontWeight="medium">
                      🔄 در حال تعیین موقعیت...
                    </Text>
                  ) : (
                    <Button
                      size="xs"
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => selectQuestionRegion(question.id)}
                    >
                      انتخاب موقعیت
                    </Button>
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

      {/* Middle Panel - PDF Viewer */}
      <Box flex="1" bg="white" borderRadius="lg" boxShadow="sm" overflow="hidden" position="relative">
        {/* Toolbar */}
        <Box p={2} bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
          <HStack gap={2} justify="space-between">
            {/* Left tools */}
            <HStack gap={1}>
              <Button
                size="sm"
                variant={activeTool === 'select' ? 'solid' : 'outline'}
                colorScheme={activeTool === 'select' ? 'blue' : 'gray'}
                onClick={() => setActiveTool('select')}
                title="انتخاب (V)"
              >
                <Icon as={FiMove} />
              </Button>
              <Button
                size="sm"
                variant={activeTool === 'text' ? 'solid' : 'outline'}
                colorScheme={activeTool === 'text' ? 'blue' : 'gray'}
                onClick={() => setActiveTool('text')}
                title="متن (T)"
              >
                <Icon as={FiType} />
              </Button>
              <Button
                size="sm"
                variant={activeTool === 'pen' ? 'solid' : 'outline'}
                colorScheme={activeTool === 'pen' ? 'blue' : 'gray'}
                onClick={() => setActiveTool('pen')}
                title="قلم (P)"
              >
                <Icon as={FiEdit3} />
              </Button>
              <Button
                size="sm"
                variant={activeTool === 'rectangle' ? 'solid' : 'outline'}
                colorScheme={activeTool === 'rectangle' ? 'blue' : 'gray'}
                onClick={() => setActiveTool('rectangle')}
                title="مستطیل (R)"
              >
                <Icon as={FiSquare} />
              </Button>
            </HStack>

            {/* Center controls */}
            <HStack gap={1}>
              <Button size="sm" variant="outline" onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}>
                قبلی
              </Button>
              <Text fontSize="sm" minW="80px" textAlign="center">
                {pageNumber} / {numPages}
              </Text>
              <Button size="sm" variant="outline" onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}>
                بعدی
              </Button>
            </HStack>

            {/* Right controls */}
            <HStack gap={1}>
              <Button size="sm" variant="outline" onClick={() => setScale(Math.max(0.5, scale - 0.25))}>
                <Icon as={FiZoomOut} />
              </Button>
              <Text fontSize="sm" minW="60px" textAlign="center">
                {Math.round(scale * 100)}%
              </Text>
              <Button size="sm" variant="outline" onClick={() => setScale(Math.min(3, scale + 0.25))}>
                <Icon as={FiZoomIn} />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setRotation((rotation + 90) % 360)}>
                <Icon as={FiRotateCw} />
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* PDF Viewer */}
        <Box position="relative" h="calc(100% - 60px)" overflow="auto">
          <Box ref={pageRef} position="relative" display="inline-block">
            {(() => {
              console.log('Rendering PDF viewer, pdfBlobUrl:', pdfBlobUrl ? 'exists' : 'null', 'loading:', loading);
              return null;
            })()}
            {pdfBlobUrl ? (
              <Document
                key={`pdf-${pdfUrl}-${pdfBlobUrl}`} // Force re-render with unique key
                file={pdfBlobUrl} // Use blob URL instead of data
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<div>Rendering PDF...</div>}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" h="400px">
                <VStack>
                  <Spinner size="lg" color="blue.500" />
                  <Text>Loading PDF...</Text>
                </VStack>
              </Box>
            )}
            
            {/* Annotation Canvas Overlay */}
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: activeTool === 'select' ? 'none' : 'auto',
                zIndex: 10,
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Right Panel - Rubric */}
      <Box w="300px" bg="white" borderRadius="lg" p={4} boxShadow="sm">
        <VStack align="stretch" gap={4} h="100%">
          <Text fontSize="lg" fontWeight="bold" color="gray.800">
            روبریک
          </Text>

          <VStack align="stretch" gap={2} flex="1" overflowY="auto">
            {rubricItems.map((item, index) => (
              <Box
                key={item.id}
                p={3}
                bg={item.applied ? "green.50" : "gray.50"}
                borderRadius="md"
                border="1px solid"
                borderColor={item.applied ? "green.200" : "gray.200"}
                cursor="pointer"
                onClick={() => applyRubricItem(item.id)}
                _hover={{ bg: item.applied ? "green.100" : "gray.100" }}
              >
                <VStack align="stretch" gap={1}>
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="medium" color="gray.800">
                      {item.title}
                    </Text>
                    <Text fontSize="sm" color={item.points >= 0 ? "green.600" : "red.600"} fontWeight="bold">
                      {item.points > 0 ? '+' : ''}{item.points}
                    </Text>
                  </HStack>
                  {item.description && (
                    <Text fontSize="xs" color="gray.600">
                      {item.description}
                    </Text>
                  )}
                  <Text fontSize="xs" color="blue.500">
                    کلید: {index + 1}
                  </Text>
                </VStack>
              </Box>
            ))}
          </VStack>

          <Box bg="green.50" p={3} borderRadius="md">
            <Text fontSize="sm" color="green.600" fontWeight="medium">
              نمره کل: {appliedRubricPoints}
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default GradescopePDFViewer;
