import { Box, VStack, Button, Icon, Text, HStack } from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { FiHome, FiBook, FiCalendar, FiSettings, FiLogIn, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const SideBar = () => {
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const borderColor = useColorModeValue("gray.300", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const menuItems = [
    { icon: FiHome, label: "میز کار", href: '/' },
    { icon: FiBook, label: "داشبورد دوره‌ها", href: '/courses' },
    { icon: FiCalendar, label: "پاییز ۱۴۰۳", href: '/fall-2024' },
    { icon: FiSettings, label: "تنظیمات", href: '/settings' },
  ];

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
        {/* User Info (if authenticated) */}
        {isAuthenticated && user && (
          <Box p={3} bg="white" borderRadius="md" border="1px solid" borderColor={borderColor}>
            <HStack gap={3}>
              <Box 
                w="32px" 
                h="32px" 
                borderRadius="full" 
                bg="blue.500" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                color="white"
                fontSize="sm"
                fontWeight="bold"
              >
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </Box>
              <VStack align="start" gap={0} flex={1}>
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  {user.name || user.email}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {user.email}
                </Text>
              </VStack>
            </HStack>
          </Box>
        )}

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
              onClick={() => navigate(item.href)}
            >
              <Icon as={item.icon} mr={2} />
              {item.label}
            </Button>
          ))}
        </VStack>

        {/* Authentication Button */}
        {isAuthenticated ? (
          <Button
            variant="outline"
            justifyContent="flex-start"
            color="#e53e3e"
            borderColor="#e53e3e"
            _hover={{ 
              bg: "#e53e3e", 
              color: "white",
              transform: "translateX(-4px)"
            }}
            fontSize="sm"
            h="40px"
            transition="all 0.3s"
            onClick={handleLogout}
          >
            <Icon as={FiLogOut} mr={2} />
            خروج
          </Button>
        ) : (
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
        )}
      </VStack>
    </Box>
  );
};

export default SideBar;
