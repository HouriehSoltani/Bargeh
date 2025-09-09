import {
  Box,
  VStack,
  Input,
  Button,
  Heading,
  Text,
  IconButton,
  Container,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiEye, FiEyeOff, FiMail, FiUser } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !password) return;

    try {
      setIsSubmitting(true);
      clearError();
      await register({ email, name, password });
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
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
              ثبت‌نام در سیستم
            </Heading>
            <Text color="gray.600" textAlign="center" fontSize="sm">
              برای دسترسی به داشبورد دوره‌ها، لطفاً ثبت‌نام کنید
            </Text>
          </VStack>

          {/* Error Alert */}
          {error && (
            <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md" p={4} mb={4}>
              <Text color="red.600" fontWeight="medium">{error}</Text>
            </Box>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            <VStack gap={6}>
              {/* Name Input */}
              <Box w="100%">
                <Text color="gray.600" fontSize="sm" fontWeight="medium" mb={2}>
                  نام و نام خانوادگی
                </Text>
                <Box position="relative">
                  <Input
                    type="text"
                    placeholder="نام و نام خانوادگی خود را وارد کنید"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    <FiUser color="#4A90E2" />
                  </Box>
                </Box>
              </Box>

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

              {/* Register Button */}
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
                loading={isSubmitting}
                loadingText="در حال ثبت‌نام..."
                disabled={!email || !name || !password}
              >
                ثبت‌نام
              </Button>
            </VStack>
          </form>

          {/* Divider */}
          <Box my={6} borderTop="1px" borderColor="gray.200" />

          {/* Login Link */}
          <VStack gap={4}>
            <Text color="gray.600" fontSize="sm" textAlign="center">
              قبلاً ثبت‌نام کرده‌اید؟
            </Text>
            <Button
              variant="outline"
              size="md"
              w="full"
              borderColor="#4A90E2"
              color="#4A90E2"
              _hover={{ bg: "#4A90E2", color: "white" }}
              fontFamily="inherit"
              onClick={() => navigate('/login')}
            >
              ورود
            </Button>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default RegisterPage;
