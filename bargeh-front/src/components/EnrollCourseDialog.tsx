import { Box, Button, Heading, Input, VStack, HStack, Dialog } from "@chakra-ui/react";
import { useState } from "react";

interface EnrollCourseDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onClose?: () => void;
  onSubmit?: (values: { entryCode: string }) => void;
}

const EnrollCourseDialog = ({ open, setOpen, onClose, onSubmit }: EnrollCourseDialogProps) => {
  const [entryCode, setEntryCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    onClose?.();
    setOpen(false);
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

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="600px">
          <Box p={4} borderBottom="1px" borderColor="gray.200" bg="blue.50">
            <Heading size="md">افزودن درس با کُد ورود</Heading>
          </Box>
          <Box p={6}>
            <VStack align="stretch" gap={4}>
              <VStack align="stretch" gap={2}>
                <Box as="label" fontWeight="medium">کُد ورود درس</Box>
                <Input
                  value={entryCode}
                  onChange={(e) => setEntryCode(e.target.value)}
                  placeholder="کُد شش‌رقمی درس را وارد کنید"
                />
                {error && (
                  <Box color="red.500" fontSize="sm">{error}</Box>
                )}
              </VStack>
              <HStack justify="flex-end" gap={3} pt={2}>
                <Button variant="outline" onClick={handleClose}>انصراف</Button>
                <Button colorScheme="teal" onClick={handleSubmit}>افزودن درس</Button>
              </HStack>
            </VStack>
          </Box>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default EnrollCourseDialog;


