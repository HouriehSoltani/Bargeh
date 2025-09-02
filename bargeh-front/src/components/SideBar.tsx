import { Box, VStack, Button, Icon } from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { FiHome, FiBook, FiCalendar, FiSettings, FiLogIn } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const SideBar = () => {
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const navigate = useNavigate();

  const menuItems = [
    { icon: FiHome, label: "میز کار", href: '/' },
    { icon: FiBook, label: "داشبورد دوره‌ها", href: '/courses' },
    { icon: FiCalendar, label: "پاییز ۱۴۰۳", href: '/fall-2024' },
    { icon: FiSettings, label: "تنظیمات", href: '/settings' },
  ];

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Box
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      h="100vh"
      p={4}
      position="sticky"
      top={0}
    >
      <VStack gap={6} align="stretch">
        {/* Navigation Menu */}
        <VStack gap={2} align="stretch">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              justifyContent="flex-start"
              color={textColor}
              _hover={{ 
                bg: "#4A90E2", 
                color: "white",
                transform: "translateX(-4px)"
              }}
              fontSize="sm"
              h="40px"
              transition="all 0.3s"
            >
              <Icon as={item.icon} mr={2} />
              {item.label}
            </Button>
          ))}
        </VStack>

        {/* Login Button */}
        <Button
          variant="outline"
          justifyContent="flex-start"
          color="#4A90E2"
          borderColor="#4A90E2"
          _hover={{ 
            bg: "#4A90E2", 
            color: "white",
            transform: "translateX(-4px)"
          }}
          fontSize="sm"
          h="40px"
          transition="all 0.3s"
          onClick={handleLogin}
        >
          <Icon as={FiLogIn} mr={2} />
          ورود
        </Button>
      </VStack>
    </Box>
  );
};

export default SideBar;
