import DynamicSidebar from "@/components/DynamicSidebar";
import { Box, Grid, GridItem, Heading, VStack, Button, Input, HStack, Icon, Spinner, Text, createToaster } from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { FiSave } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { userService } from "@/services/userService";
import { getHomeNavigationConfig } from "@/config/navigation";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const toaster = createToaster({ placement: "top" });
  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    first_name: "",
    last_name: "",
    bio: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when user loads
  useEffect(() => {
    if (user) {
      console.log('ProfilePage - User data:', user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        bio: user.bio || ""
      });
    }
  }, [user]);

  // Load user profile data from API (bypassed in development)
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // In development mode with bypassed auth, use user data from useAuth
        if (user) {
          console.log('ProfilePage - Using user data from useAuth:', user);
          setFormData({
            name: user.name || "",
            email: user.email || "",
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            bio: user.bio || ""
          });
        } else {
          // Try to load from API if user is not available
          const profileData = await userService.getProfile();
          console.log('ProfilePage - Profile data from API:', profileData);
          setFormData({
            name: profileData.name || "",
            email: profileData.email || "",
            first_name: profileData.first_name || "",
            last_name: profileData.last_name || "",
            bio: profileData.bio || ""
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // If API fails, use user data from useAuth as fallback
        if (user) {
          setFormData({
            name: user.name || "",
            email: user.email || "",
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            bio: user.bio || ""
          });
        }
      }
    };
    
    loadProfile();
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Form handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancel = () => {
    navigate('/');
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push("نام کاربری الزامی است");
    }
    
    if (!formData.email.trim()) {
      errors.push("ایمیل الزامی است");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push("فرمت ایمیل صحیح نیست");
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      toaster.create({
        title: "خطا در اعتبارسنجی",
        description: errors.join("، "),
        type: "error",
        duration: 5000,
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Update profile using the useAuth hook
      console.log('ProfilePage - Updating profile:', formData);
      
      await updateProfile(formData);
      
      toaster.create({
        title: "تغییرات ذخیره شد",
        description: "اطلاعات پروفایل با موفقیت به‌روزرسانی شد",
        type: "success",
        duration: 3000,
      });
      
      // Auto-refresh the page after successful save
      setTimeout(() => {
        window.location.reload();
      }, 1500); // Wait 1.5 seconds to show the success message
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      let errorMessage = "خطایی در ذخیره تغییرات رخ داد";
      
      if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toaster.create({
        title: "خطا در ذخیره",
        description: errorMessage,
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (!user) {
    return (
      <Box bg={bgColor} minH="100vh" p={6} display="flex" alignItems="center" justifyContent="center">
        <VStack>
          <Spinner size="xl" color="blue.500" />
          <Text color={textColor}>در حال بارگذاری پروفایل...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Grid
      templateAreas={{ base: `"main"`, md: `"aside main"` }}
      templateColumns={{ base: "1fr", md: "300px 1fr" }}
      minH="100vh"
      gap={0}
    >
      <GridItem area="aside" display={{ base: "none", md: "block" }}>
        <DynamicSidebar config={getHomeNavigationConfig(user?.role)} />
      </GridItem>

      <GridItem area="main">
        <Box bg={bgColor} minH="100vh" p={{ base: 4, md: 6 }}>
          <VStack align="stretch" gap={6}>
            <Heading size="xl" color={textColor}>تنظیمات پروفایل</Heading>
            
            <Box
              width="50%"
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              p={8}
              bg={useColorModeValue("gray.50", "gray.800")}
              boxShadow="sm"
            >
              <VStack align="stretch" gap={8}>
                <Box>
                  <Box as="label" fontWeight="medium" color={textColor} display="block" mb={2}>
                    نام کاربری <Text as="span" color="red.500">*</Text>
                  </Box>
                  <Input 
                    paddingRight={2}
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    color={textColor}
                    placeholder="نام کاربری خود را وارد کنید"
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                    bg={useColorModeValue("white", "gray.700")}
                    borderColor={useColorModeValue("gray.300", "gray.600")}
                  />
                </Box>

                <Box>
                  <Box as="label" fontWeight="medium" color={textColor} display="block" mb={2}>
                    ایمیل <Text as="span" color="red.500">*</Text>
                  </Box>
                  <Input 
                    paddingRight={2}
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    color={textColor}
                    placeholder="ایمیل خود را وارد کنید"
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                    bg={useColorModeValue("white", "gray.700")}
                    borderColor={useColorModeValue("gray.300", "gray.600")}
                  />
                </Box>

                <HStack gap={4}>
                  <Box flex={1}>
                    <Box as="label" fontWeight="medium" color={textColor} display="block" mb={2}>
                      نام
                    </Box>
                    <Input 
                      paddingRight={2}
                      value={formData.first_name}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                      color={textColor}
                      placeholder="نام"
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                      bg={useColorModeValue("white", "gray.700")}
                      borderColor={useColorModeValue("gray.300", "gray.600")}
                    />
                  </Box>
                  
                  <Box flex={1}>
                    <Box as="label" fontWeight="medium" color={textColor} display="block" mb={2}>
                      نام خانوادگی
                    </Box>
                    <Input 
                      paddingRight={2}
                      value={formData.last_name}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                      color={textColor}
                      placeholder="نام خانوادگی"
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                      bg={useColorModeValue("white", "gray.700")}
                      borderColor={useColorModeValue("gray.300", "gray.600")}
                    />
                  </Box>
                </HStack>
                
                <HStack justify="space-between" gap={3}>
                  <Button p={2} variant="outline" onClick={handleCancel}>
                    انصراف
                  </Button>
                  
                  <Button 
                    paddingLeft={2}
                    colorScheme="teal" 
                    onClick={handleSubmit}
                    loading={isSubmitting}
                    loadingText="در حال ذخیره..."
                  >
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

export default ProfilePage;
