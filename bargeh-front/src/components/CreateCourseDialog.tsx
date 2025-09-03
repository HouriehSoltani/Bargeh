import { Box, Button, Heading, Input, Textarea, VStack, HStack, Dialog } from "@chakra-ui/react";
import { useMemo, useState } from "react";

interface CreateCourseDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onClose?: () => void;
  onSubmit?: (values: {
    courseNumber: string;
    courseName: string;
    description?: string;
    term: string;
    year: string;
    department?: string;
    allowEntryCode: boolean;
  }) => void;
}

const CreateCourseDialog = ({ open, setOpen, onClose, onSubmit }: CreateCourseDialogProps) => {
  const [courseNumber, setCourseNumber] = useState("");
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [term, setTerm] = useState("fall");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [department] = useState("");
  const [allowEntryCode, setAllowEntryCode] = useState(false);
  const [errors, setErrors] = useState<{ courseNumber?: string; courseName?: string } | null>(null);

  const handleClose = () => {
    onClose?.();
    setOpen(false);
  };

  const years = useMemo(() => Array.from({ length: 6 }).map((_, i) => (new Date().getFullYear() + i).toString()), []);

  const handleSubmit = () => {
    const nextErrors: { courseNumber?: string; courseName?: string } = {};
    if (!courseNumber.trim()) nextErrors.courseNumber = "شماره درس الزامی است";
    if (!courseName.trim()) nextErrors.courseName = "نام درس الزامی است";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors(null);
    onSubmit?.({
      courseNumber: courseNumber.trim(),
      courseName: courseName.trim(),
      description: description.trim() || undefined,
      term,
      year,
      department: department.trim() || undefined,
      allowEntryCode,
    });
    handleClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="720px">
          <Box p={4} borderBottom="1px" borderColor="gray.200" bg="blue.50">
            <Heading size="md">ایجاد درس جدید</Heading>
          </Box>
          <Box p={6}>
            <VStack align="stretch" gap={4}>
              <VStack align="stretch" gap={2}>
                <Box as="label" fontWeight="medium">شماره درس</Box>
                <Input value={courseNumber} onChange={(e) => setCourseNumber(e.target.value)} placeholder="مثلاً: اقتصاد ۱۰۱" />
                {errors?.courseNumber && <Box color="red.500" fontSize="sm">{errors.courseNumber}</Box>}
              </VStack>
              <VStack align="stretch" gap={2}>
                <Box as="label" fontWeight="medium">نام درس</Box>
                <Input value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="مثلاً: مقدمه‌ای بر اقتصاد کلان" />
                {errors?.courseName && <Box color="red.500" fontSize="sm">{errors.courseName}</Box>}
              </VStack>
              <VStack align="stretch" gap={2}>
                <Box as="label" fontWeight="medium">توضیحات درس</Box>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="توضیحات کوتاه درباره درس" />
              </VStack>
              <HStack gap={4}>
                <VStack flex={1} align="stretch" gap={2}>
                  <Box as="label" fontWeight="medium">نیم‌سال</Box>
                  <select 
                    value={term} 
                    onChange={(e) => setTerm(e.target.value)}
                    style={{
                      borderWidth: "1px",
                      borderRadius: "0.375rem",
                      padding: "0.5rem 0.75rem",
                      width: "100%"
                    }}
                  >
                    <option value="fall">پاییز</option>
                    <option value="spring">بهار</option>
                    <option value="summer">تابستان</option>
                    <option value="winter">زمستان</option>
                  </select>
                </VStack>
                <VStack flex={1} align="stretch" gap={2}>
                  <Box as="label" fontWeight="medium">سال</Box>
                  <select 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)}
                    style={{
                      borderWidth: "1px",
                      borderRadius: "0.375rem",
                      padding: "0.5rem 0.75rem",
                      width: "100%"
                    }}
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </VStack>
              </HStack>
              <VStack align="start" gap={2}>
                <HStack>
                  <input type="checkbox" checked={allowEntryCode} onChange={(e) => setAllowEntryCode(e.target.checked)} />
                  <Box as="label">اجازه ثبت‌نام با کُد ورود</Box>
                </HStack>
              </VStack>
              <HStack justify="flex-end" gap={3} pt={2}>
                <Button variant="outline" onClick={handleClose}>انصراف</Button>
                <Button colorScheme="teal" onClick={handleSubmit}>ایجاد درس</Button>
              </HStack>
            </VStack>
          </Box>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default CreateCourseDialog;


