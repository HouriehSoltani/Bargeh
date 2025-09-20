import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  Heading,
  Alert,
} from '@chakra-ui/react';
import { useColorModeValue } from '@/hooks/useColorMode';
import { useAuth } from '@/hooks/useAuth';
import { type StudentSignupRequest } from '@/services/authService';

const StudentSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { studentSignup, login, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState<StudentSignupRequest>({
    email: '',
    name: '',
    password: '',
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleInputChange = (field: keyof StudentSignupRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First, create the user account
      await studentSignup(formData);
      
      // Then automatically log them in
      await login({
        email: formData.email,
        password: formData.password
      });
      
      // Redirect to home page after successful signup and login
      navigate('/');
    } catch (err) {
      // Error is handled by the hook
      console.error('Signup error:', err);
    }
  };

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')} display="flex" alignItems="center" justifyContent="center">
      <Box
        bg={bgColor}
        p={8}
        borderRadius="lg"
        boxShadow="xl"
        w="full"
        maxW="400px"
        border="1px solid"
        borderColor={borderColor}
      >
        <VStack gap={6} align="stretch">
          {/* Header */}
          <VStack gap={2}>
            <Heading size="lg" color={textColor} textAlign="center">
              ثبت‌نام دانشجو
            </Heading>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              فقط دانشجویان می‌توانند ثبت‌نام کنند
            </Text>
          </VStack>

          {/* Error Alert */}
          {error && (
            <Alert.Root status="error" borderRadius="md">
              <Alert.Indicator />
              <Alert.Content>
                {error}
              </Alert.Content>
            </Alert.Root>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit}>
            <VStack gap={4} align="stretch">
              {/* Name Field */}
              <VStack align="stretch" gap={2}>
                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                  نام کامل *
                </Text>
                <Input
                  paddingRight={2}
                  type="text"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                  placeholder="نام کامل خود را وارد کنید"
                  dir="rtl"
                  required
                />
              </VStack>

              {/* Email Field */}
              <VStack align="stretch" gap={2}>
                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                  ایمیل *
                </Text>
                <Input
                  paddingLeft={2}
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                  placeholder="example@email.com"
                  dir="ltr"
                  required
                />
              </VStack>

              {/* Password Field */}
              <VStack align="stretch" gap={2}>
                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                  رمز عبور *
                </Text>
                <Input
                  paddingRight={2}
                  type="password"
                  value={formData.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
                  placeholder="رمز عبور خود را وارد کنید"
                  minLength={8}
                  required
                />
              </VStack>

              {/* Submit Button */}
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                loading={isLoading}
                loadingText="در حال ثبت‌نام..."
                w="full"
              >
                ثبت‌نام
              </Button>
            </VStack>
          </form>

          {/* Login Link */}
          <Text fontSize="sm" color="gray.500" textAlign="center">
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <Link to="/login" style={{ color: '#3182ce', textDecoration: 'underline' }}>
              وارد شوید
            </Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default StudentSignupPage;
