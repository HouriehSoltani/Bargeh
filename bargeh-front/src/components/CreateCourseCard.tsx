import {
  Box,
  Text,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { FiPlus } from "react-icons/fi";

const CreateCourseCard = () => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Box
      bg={cardBg}
      border="2px dashed"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      cursor="pointer"
      height="280px"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      _hover={{ 
        borderColor: "blue.400",
        transform: "translateY(-2px)",
        shadow: "md"
      }}
      transition="all 0.3s"
    >
      <VStack align="center">
        <Icon as={FiPlus} boxSize={8} color={textColor} mb={2} />
        <Text color={textColor} fontSize="lg" fontWeight="medium" textAlign="center">
          ایجاد دوره جدید
        </Text>
      </VStack>
    </Box>
  );
};

export default CreateCourseCard;
