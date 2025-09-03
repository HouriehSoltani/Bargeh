import { Box, VStack, Button, Icon, Text, Heading, HStack } from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { 
  FiGrid, 
  FiFileText, 
  FiUsers, 
  FiClock, 
  FiSettings, 
  FiUser, 
  FiLogOut 
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

const CourseSideBar = () => {
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const borderColor = useColorModeValue("gray.300", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const activeBgColor = useColorModeValue("blue.100", "blue.900");
  const activeTextColor = useColorModeValue("blue.700", "blue.200");
  const navigate = useNavigate();
  const location = useLocation();

  const courseNavItems = [
    { icon: FiGrid, label: "داشبورد", href: '/courses', path: '/courses' },
    { icon: FiFileText, label: "تمرین‌ها", href: '/courses/assignments', path: '/courses/assignments' },
    { icon: FiUsers, label: "لیست دانشجویان", href: '/courses/roster', path: '/courses/roster' },
    { icon: FiClock, label: "تمدیدها", href: '/courses/extensions', path: '/courses/extensions' },
    { icon: FiSettings, label: "تنظیمات درس", href: '/courses/settings', path: '/courses/settings' },
  ];

  const instructors = [
    "دکتر احمدی",
    "دکتر محمدی", 
    "دکتر رضایی"
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box
      bg={bgColor}
      borderLeft="1px solid"
      borderColor={borderColor}
      h="100vh"
      p={4}
      position="sticky"
      top={0}
    >
      <VStack gap={6} align="stretch">
        {/* Course Info */}
        <VStack align="stretch" gap={2}>
          <Heading size="sm" color={textColor}>آزمایشگاه ریز پردازنده_01_4032</Heading>
          <Text fontSize="sm" color={textColor} textAlign="center">
            آزمایشگاه ریز پردازنده - ترم بهار 1403/1404
          </Text>
        </VStack>

        {/* Course Navigation */}
        <VStack gap={2} align="stretch">
          {courseNavItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              justifyContent="flex-start"
              color={isActive(item.path) ? activeTextColor : textColor}
              bg={isActive(item.path) ? activeBgColor : "transparent"}
              _hover={{ 
                bg: isActive(item.path) ? activeBgColor : "#4A90E2", 
                color: isActive(item.path) ? activeTextColor : "white",
                transform: "translateX(-4px)"
              }}
              fontSize="sm"
              h="40px"
              transition="all 0.3s"
              onClick={() => navigate(item.href)}
            >
              <Icon as={item.icon} mr={2} />
              {item.label}
            </Button>
          ))}
        </VStack>

        {/* Instructors Section */}
        <VStack align="stretch" gap={2}>
          <Heading size="sm" color={textColor}>استادان</Heading>
          {instructors.map((instructor, index) => (
            <HStack key={index} gap={2}>
              <Icon as={FiUser} color={textColor} />
              <Text fontSize="sm" color={textColor}>{instructor}</Text>
            </HStack>
          ))}
        </VStack>

        {/* Course Actions */}
        <VStack align="stretch" gap={2}>
          <Heading size="sm" color={textColor}>عملیات درس</Heading>
          <Button
            variant="ghost"
            justifyContent="flex-start"
            color="red.500"
            _hover={{ 
              bg: "red.100", 
              color: "red.700",
              transform: "translateX(-4px)"
            }}
            fontSize="sm"
            h="40px"
            transition="all 0.3s"
          >
            <Icon as={FiLogOut} mr={2} />
            انصراف از درس
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};

export default CourseSideBar;
