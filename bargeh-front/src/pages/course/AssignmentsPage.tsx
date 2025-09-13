import DynamicSidebar from "@/components/DynamicSidebar";
import { Box, Grid, GridItem, Heading, Text, VStack, Button, Icon } from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { FiPlus } from "react-icons/fi";
import { useParams } from "react-router-dom";

const AssignmentsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");
  const subtleText = useColorModeValue("gray.600", "gray.300");

  return (
    <Grid
      templateAreas={{ base: `"main"`, md: `"aside main"` }}
      templateColumns={{ base: "1fr", md: "250px 1fr" }}
      minH="100vh"
      gap={0}
    >
      <GridItem area="aside" display={{ base: "none", md: "block" }}>
        <DynamicSidebar />
      </GridItem>

      <GridItem area="main">
        <Box bg={bgColor} minH="100vh" p={{ base: 4, md: 6 }}>
          <VStack align="stretch" gap={6}>
            <Heading size="xl" color={textColor}>
              تمرین‌ها {courseId && `- دوره ${courseId}`}
            </Heading>
            
            <Box
              borderWidth="1px"
              borderColor={useColorModeValue("gray.200", "gray.700")}
              borderRadius="md"
              py={16}
              textAlign="center"
              color={subtleText}
            >
              <Text fontSize="lg" mb={4}>هنوز هیچ تمرینی ایجاد نشده است</Text>
              <Button colorScheme="teal">
                <Icon as={FiPlus} mr={2} />
                ایجاد تمرین جدید
              </Button>
            </Box>
          </VStack>
        </Box>
      </GridItem>
    </Grid>
  );
};

export default AssignmentsPage;
