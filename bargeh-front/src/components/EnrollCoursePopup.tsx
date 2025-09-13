import { Box, Button, Heading, Input, VStack, HStack } from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { useState, useEffect } from "react";

interface EnrollCoursePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (values: { entryCode: string }) => void;
}

const EnrollCoursePopup = ({ isOpen, onClose, onSubmit }: EnrollCoursePopupProps) => {
  const [entryCode, setEntryCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.800", "white");
  const overlayBg = useColorModeValue("rgba(0, 0, 0, 0.4)", "rgba(0, 0, 0, 0.6)");

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleClose = () => {
    // Reset form
    setEntryCode("");
    setError(null);
    onClose();
  };

  const handleSubmit = () => {
    if (!entryCode.trim()) {
      setError("وارد کردن کُد ورود الزامی است");
      return;
    }
    if (entryCode.trim().length < 6) {
      setError("کُد باید حداقل ۶ کاراکتر باشد");
      return;
    }
    setError(null);
    onSubmit?.({ entryCode: entryCode.trim() });
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg={overlayBg}
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      onClick={handleClose}
    >
      <Box
        bg={bgColor}
        borderRadius="lg"
        boxShadow="2xl"
        maxW="600px"
        w="100%"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Box p={4} borderBottom="1px" borderColor={borderColor} bg="blue.50">
          <Heading size="md" color={textColor}>افزودن درس با کُد ورود</Heading>
        </Box>
        
        {/* Form Content */}
        <Box p={6}>
          <VStack align="stretch" gap={4}>
            <VStack align="stretch" gap={2}>
              <Box as="label" fontWeight="medium" color={textColor}>کُد ورود درس</Box>
              <Input
                value={entryCode}
                onChange={(e) => setEntryCode(e.target.value)}
                placeholder="کُد شش‌رقمی درس را وارد کنید"
                color={textColor}
                textAlign="center"
                fontSize="lg"
                letterSpacing="0.1em"
              />
              {error && (
                <Box color="red.500" fontSize="sm" textAlign="center">{error}</Box>
              )}
            </VStack>
            
            <HStack justify="flex-end" gap={3} pt={2}>
              <Button paddingX={2} variant="outline" onClick={handleClose} color={textColor}>
                انصراف
              </Button>
              <Button paddingX={2} colorScheme="teal" onClick={handleSubmit}>
                افزودن درس
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default EnrollCoursePopup;
