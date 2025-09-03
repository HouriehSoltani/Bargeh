import CourseSideBar from "@/components/CourseSideBar";
import { Box, Grid, GridItem, Heading, HStack, Icon, Text, VStack, Button } from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { FiBookOpen, FiPlus } from "react-icons/fi";

const CoursePage = () => {
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
        <CourseSideBar />
      </GridItem>

      <GridItem area="main">
        <Box bg={bgColor} minH="100vh" p={{ base: 4, md: 6 }}>
          {/* Course Header */}
          <HStack justify="space-between" mb={6}>
            <VStack align="start" gap={0}>
              <HStack>
                <Heading size="lg" color={textColor}>آزمایشگاه ریز پردازنده_01_4032</Heading>
                <Text color={subtleText}>|</Text>
                <Text color={subtleText}>ترم بهار 1403/1404</Text>
              </HStack>
              <Text color={subtleText} fontSize="sm">شناسه درس: 4032</Text>
            </VStack>
            <Button colorScheme="teal" variant="solid">
              <Icon as={FiPlus} mr={2} />
              ایجاد تمرین
            </Button>
          </HStack>

          {/* Description and todo */}
          <Box borderBottom="1px" borderColor={useColorModeValue("gray.200", "gray.700")} pb={4} mb={4}>
            <Heading size="sm" color={subtleText} mb={2}>توضیحات</Heading>
            <Text color={subtleText} fontSize="sm">
              توضیح درس خود را در صفحه تنظیمات درس ویرایش کنید.
            </Text>
          </Box>

          {/* Dashboard Table placeholder */}
          <VStack align="stretch" gap={4}>
            <HStack color={subtleText} fontSize="sm" justify="space-between">
              <Text>تمرین‌های فعال</Text>
              <HStack gap={8}>
                <Text>منتشر شده</Text>
                <Text>موعد</Text>
                <Text>ارسال‌ها</Text>
                <Text>% تصحیح‌شده</Text>
                <Text>انتشار</Text>
                <Text>بازبینی</Text>
              </HStack>
            </HStack>
            <Box
              borderWidth="1px"
              borderColor={useColorModeValue("gray.200", "gray.700")}
              borderRadius="md"
              py={16}
              textAlign="center"
              color={subtleText}
            >
              <Icon as={FiBookOpen} mr={2} />
              در حال حاضر هیچ تمرینی وجود ندارد.
            </Box>
            <HStack justify="center">
              <Button variant="outline" colorScheme="teal">
                <Icon as={FiPlus} mr={2} />
                ایجاد تمرین
              </Button>
            </HStack>
          </VStack>
        </Box>
      </GridItem>
    </Grid>
  );
};

export default CoursePage;
