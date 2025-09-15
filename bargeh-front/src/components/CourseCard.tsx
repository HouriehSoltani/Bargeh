import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { FiBook, FiFileText, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export interface Course {
  id: number;
  title: string;
  courseCode: string;
  description: string;
  instructor: string;
  students: number;
  enrolled: boolean;
  assignments: number;
  term: string;
  year: number;
}

interface CourseCardProps {
  course: Course;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const cardBg = useColorModeValue("gray.100", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const navigate = useNavigate();

  const handleCourseClick = () => {
    navigate(`/courses/${course.id}`);
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
      height={{ base: "200px", md: "220px" }}
      display="flex"
      flexDirection="column"
      fontFamily="inherit"
      onClick={handleCourseClick}
    >
      <Box p={{ base: 3, md: 4 }} flex="1">
        <VStack align="start" mb={3} gap={2}>
          <Heading 
            size="md" 
            fontSize={{ base: "sm", md: "md" }} 
            fontWeight="bold" 
            fontFamily="inherit"
            lineHeight="1.3"
          >
            {course.title}
          </Heading>
          <Text 
            color={textColor} 
            fontSize={{ base: "xs", md: "sm" }}
            fontFamily="inherit"
            lineHeight="1.4"
          >
            {course.courseCode}
          </Text>
        </VStack>

        <VStack align="start" gap={1}>
          <HStack color={textColor} fontSize={{ base: "xs", md: "sm" }}>
            <Icon as={FiBook} />
            <Text fontFamily="inherit">{course.instructor}</Text>
          </HStack>
          <HStack color={textColor} fontSize={{ base: "xs", md: "sm" }}>
            <Icon as={FiUsers} />
            <Text fontFamily="inherit">{course.students} دانشجو</Text>
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
