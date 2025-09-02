import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Heading,
  Text,
  IconButton,
  Container,
  Link,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiEye, FiEyeOff, FiMail } from "react-icons/fi";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt:", { email, password });
  };

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      fontFamily="inherit"
    >
      <Container maxW="md">
        <Box
          bg="white"
          p={8}
          borderRadius="xl"
          boxShadow="xl"
          border="1px"
          borderColor="gray.200"
        >
          {/* Header */}
          <VStack gap={6} mb={8}>
            <Heading
              size="xl"
              color="gray.800"
              textAlign="center"
              fontFamily="inherit"
            >
              ورود به سیستم
            </Heading>
            <Text color="gray.600" textAlign="center" fontSize="sm">
              برای دسترسی به داشبورد دوره‌ها، لطفاً وارد شوید
            </Text>
          </VStack>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <VStack gap={6}>
              {/* Email Input */}
              <Box w="100%">
                <Text color="gray.600" fontSize="sm" fontWeight="medium" mb={2}>
                  ایمیل
                </Text>
                <Box position="relative">
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="lg"
                    borderColor="gray.200"
                    _focus={{
                      borderColor: "#4A90E2",
                      boxShadow: "0 0 0 1px #4A90E2",
                    }}
                    _hover={{ borderColor: "#4A90E2" }}
                    pr={12}
                  />
                  <Box
                    position="absolute"
                    right={3}
                    top="50%"
                    transform="translateY(-50%)"
                    pointerEvents="none"
                  >
                    <FiMail color="#4A90E2" />
                  </Box>
                </Box>
              </Box>

              {/* Password Input */}
              <Box w="100%">
                <Text color="gray.600" fontSize="sm" fontWeight="medium" mb={2}>
                  رمز عبور
                </Text>
                <Box position="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="رمز عبور خود را وارد کنید"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    size="lg"
                    borderColor="gray.200"
                    _focus={{
                      borderColor: "#4A90E2",
                      boxShadow: "0 0 0 1px #4A90E2",
                    }}
                    _hover={{ borderColor: "#4A90E2" }}
                    pr={12}
                  />
                  <Box
                    position="absolute"
                    right={3}
                    top="50%"
                    transform="translateY(-50%)"
                  >
                    <IconButton
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      color="gray.600"
                      _hover={{ color: "#4A90E2" }}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </IconButton>
                  </Box>
                </Box>
              </Box>

              {/* Forgot Password */}
              <HStack justify="flex-end" w="full">
                <Link
                  color="#4A90E2"
                  fontSize="sm"
                  _hover={{ textDecoration: "underline" }}
                >
                  فراموشی رمز عبور؟
                </Link>
              </HStack>

              {/* Login Button */}
              <Button
                type="submit"
                size="lg"
                w="full"
                bg="#2E5BBA"
                color="white"
                _hover={{ bg: "#1E4A9A" }}
                _active={{ bg: "#1E4A9A" }}
                fontFamily="inherit"
                fontSize="md"
                fontWeight="medium"
              >
                ورود
              </Button>
            </VStack>
          </form>

          {/* Divider */}
          <Box my={6} borderTop="1px" borderColor="gray.200" />

          {/* Additional Options */}
          <VStack gap={4}>
            <Text color="gray.600" fontSize="sm" textAlign="center">
              حساب کاربری ندارید؟
            </Text>
            <Button
              variant="outline"
              size="md"
              w="full"
              borderColor="#4A90E2"
              color="#4A90E2"
              _hover={{ bg: "#4A90E2", color: "white" }}
              fontFamily="inherit"
            >
              ثبت‌نام
            </Button>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
