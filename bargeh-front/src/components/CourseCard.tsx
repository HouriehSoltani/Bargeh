import {
  Box,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { FiBook, FiClock, FiFileText } from "react-icons/fi";

export interface Course {
  id: number;
  title: string;
  courseCode: string;
  description: string;
  instructor: string;
  duration: string;
  students: number;
  rating: number;
  progress: number;
  category: string;
  level: string;
  image: string;
  enrolled: boolean;
  assignments: number;
  term: string;
}

interface CourseCardProps {
  course: Course;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const cardBg = useColorModeValue("gray.100", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");


  // Persian term mapping
  const getPersianTerm = (term: string): string => {
    const termMap: Record<string, string> = {
      'Fall 2024': 'پاییز ۱۴۰۳',
      'Spring 2024': 'بهار ۱۴۰۴',
      'Winter 2024': 'زمستان ۱۴۰۳',
    };
    return termMap[term] || term;
  };

  return (
    <Box
      bg={cardBg}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      _hover={{ transform: "translateY(-4px)", shadow: "lg" }}
      transition="all 0.3s"
      cursor="pointer"
      height={{ base: "260px", md: "280px" }}
      display="flex"
      flexDirection="column"
      fontFamily="inherit"
    >
      <Box p={{ base: 3, md: 4 }} flex="1">
        <VStack align="start" mb={4} gap={{ base: 2, md: 3 }}>
          <Heading 
            size="md" 
            fontSize={{ base: "sm", md: "lg" }} 
            fontWeight="bold" 
            mb={{ base: 2, md: 3 }}
            fontFamily="inherit"
          >
            {course.courseCode}
          </Heading>
          <Text 
            color={textColor} 
            fontSize={{ base: "xs", md: "sm" }}
            fontFamily="inherit"
            lineHeight="1.4"
          >
            {course.title}
          </Text>
        </VStack>

        <VStack align="start" mb={4} gap={{ base: 1, md: 2 }}>
          <HStack color={textColor} fontSize={{ base: "xs", md: "sm" }} mb={2}>
            <Icon as={FiBook} />
            <Text fontFamily="inherit">{course.instructor}</Text>
          </HStack>
          <HStack color={textColor} fontSize={{ base: "xs", md: "sm" }}>
            <Icon as={FiClock} />
            <Text fontFamily="inherit">{getPersianTerm(course.term)}</Text>
          </HStack>
        </VStack>
      </Box>

      <Box
        bg="#2E5BBA"
        color="white"
        p={{ base: 2, md: 3 }}
        textAlign="center"
        fontWeight="medium"
        _hover={{ bg: "#1E4A9A" }}
        fontFamily="inherit"
      >
        <HStack justify="center" gap={{ base: 1, md: 2 }}>
          <Icon as={FiFileText} mr={{ base: 1, md: 2 }} />
          <Text 
            fontSize={{ base: "xs", md: "sm" }}
            fontFamily="inherit"
          >
            {course.assignments} تکلیف
          </Text>
        </HStack>
      </Box>
    </Box>
  );
};

export default CourseCard;
