import CourseSideBar from "@/components/CourseSideBar";
import { Box, Grid, GridItem, Heading, VStack, Button, Input, Textarea, HStack, Icon } from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { FiSave } from "react-icons/fi";

const SettingsPage = () => {
  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");

  return (
    <Grid
      templateAreas={{ base: `"main"`, md: `"aside main"` }}
      templateColumns={{ base: "1fr", md: "250px 1fr" }}
      minH="100vh"
      gap={0}
    >
      <GridItem area="aside" display={{ base: "none", md: "block" }}>
        <CourseSideBar />
      </GridItem>

      <GridItem area="main">
        <Box bg={bgColor} minH="100vh" p={{ base: 4, md: 6 }}>
          <VStack align="stretch" gap={6}>
            <Heading size="xl" color={textColor}>تنظیمات درس</Heading>
            
            <Box
              borderWidth="1px"
              borderColor={useColorModeValue("gray.200", "gray.700")}
              borderRadius="md"
              p={6}
            >
              <VStack align="stretch" gap={4}>
                <Box>
                  <Box as="label" fontWeight="medium" color={textColor} display="block" mb={2}>
                    نام درس
                  </Box>
                  <Input 
                    defaultValue="آزمایشگاه ریز پردازنده - ترم بهار 1403/1404"
                    color={textColor}
                  />
                </Box>
                
                <Box>
                  <Box as="label" fontWeight="medium" color={textColor} display="block" mb={2}>
                    توضیحات درس
                  </Box>
                  <Textarea 
                    placeholder="توضیحات درس خود را اینجا وارد کنید..."
                    color={textColor}
                    rows={4}
                  />
                </Box>
                
                <HStack justify="flex-end" gap={3}>
                  <Button variant="outline">انصراف</Button>
                  <Button colorScheme="teal">
                    <Icon as={FiSave} mr={2} />
                    ذخیره تغییرات
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </GridItem>
    </Grid>
  );
};

export default SettingsPage;
