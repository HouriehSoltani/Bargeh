import { Box, Heading, VStack, HStack, Button, Icon } from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import CourseGrid from "./CourseGrid";
import { sampleCourses } from "@/data/courses";
import { FiFileText, FiPlus } from "react-icons/fi";

const CourseDashboard = () => {
  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");

  return (
    <Box bg={bgColor} minH="100vh" p={6} position="relative" pb={24} fontFamily="inherit">
      <VStack align="start" mb={8}>
        <Heading 
          size="xl" 
          color={textColor} 
          mb={4} 
          fontWeight="bold"
          fontFamily="inherit"
          fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
        >
          داشبورد دوره‌ها
        </Heading>
      </VStack>

      <CourseGrid courses={sampleCourses} />
      
      {/* Bottom Action Bar */}
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg="gray.100"
        borderTop="1px solid"
        borderColor="gray.300"
        p={{ base: 1, md: 2 }}
        zIndex={10}
        w="100%"
      >
        <HStack justify="flex-end" mx="auto" px={{ base: 4, md: 6 }}>
          <Button
            bg={bgColor}
            variant="outline"
            colorScheme="blue"
            size={{ base: "sm", md: "md" }}
            paddingLeft={2}
            borderColor="#4A90E2"
            color="#4A90E2"
            _hover={{ bg: "#4A90E2", color: "white" }}
            fontSize={{ base: "xs", md: "sm" }}
          >
            <Icon as={FiFileText} mr={2} />
            ثبت‌نام در دوره
          </Button>
          <Button
            bg="#2E5BBA"
            color="white"
            size={{ base: "sm", md: "md" }}
            paddingLeft={2}
            _hover={{ bg: "#1E4A9A" }}
            fontSize={{ base: "xs", md: "sm" }}
          >
            <Icon as={FiPlus} mr={2} />
            ایجاد دوره
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};

export default CourseDashboard;
