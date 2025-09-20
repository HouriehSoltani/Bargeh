import DynamicSidebar from "@/components/DynamicSidebar";
import { 
  Box, 
  Grid, 
  GridItem, 
  Heading, 
  Text, 
  VStack, 
  Button, 
  Icon, 
  Spinner, 
  HStack,
  Badge,
  IconButton,
  Flex,
  Input
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react";
import { useColorModeValue } from "@/hooks/useColorMode";
import { FiUserPlus, FiChevronUp, FiChevronDown, FiTrash2, FiArrowUp, FiMail, FiUsers, FiSearch } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { useCourse } from "@/hooks/useCourse";
import { useRoster } from "@/hooks/useRoster";
import { convertEnglishTermToPersian } from "@/utils/persianDate";
import { useState } from "react";
import { courseService } from "@/services/courseService";
import type { CourseMembership } from "@/services/courseService";

type SortField = 'name' | 'email' | 'role' | 'submissions';
type SortDirection = 'asc' | 'desc';

const RosterPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { course, isLoading: courseLoading, error: courseError } = useCourse(courseId);
  const { roster, isLoading: rosterLoading, error: rosterError, refetch } = useRoster(courseId);
  
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{ id: number; name: string; email: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addStudentError, setAddStudentError] = useState('');

  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");
  const subtleText = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBg = useColorModeValue("gray.50", "gray.800");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  // Get full name from user data
  const getFullName = (membership: CourseMembership) => {
    const { user } = membership;
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.name || user.email;
  };

  // Get role display name
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'instructor': return 'استاد';
      case 'ta': return 'دستیار آموزشی';
      case 'student': return 'دانشجو';
      default: return role;
    }
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'instructor': return 'blue';
      case 'ta': return 'green';
      case 'student': return 'gray';
      default: return 'gray';
    }
  };

  // Sort and filter roster
  const sortedAndFilteredRoster = (Array.isArray(roster) ? roster : [])
    .filter(membership => {
      // Role filter
      const roleMatch = filterRole === 'all' || membership.role === filterRole;
      
      // Search filter
      const searchMatch = searchTerm === '' || 
        getFullName(membership).toLowerCase().includes(searchTerm.toLowerCase()) ||
        membership.user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      return roleMatch && searchMatch;
    })
    .sort((a, b) => {
      // First, sort by role (instructors first)
      const roleOrder = { 'instructor': 0, 'ta': 1, 'student': 2 };
      const aRoleOrder = roleOrder[a.role as keyof typeof roleOrder] ?? 3;
      const bRoleOrder = roleOrder[b.role as keyof typeof roleOrder] ?? 3;
      
      if (aRoleOrder !== bRoleOrder) {
        return aRoleOrder - bRoleOrder;
      }
      
      // If roles are the same, sort by the selected field
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'name':
          aValue = getFullName(a);
          bValue = getFullName(b);
          break;
        case 'email':
          aValue = a.user.email;
          bValue = b.user.email;
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'submissions':
          // For now, we'll use a placeholder value
          aValue = 0;
          bValue = 0;
          break;
        default:
          aValue = getFullName(a);
          bValue = getFullName(b);
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const result = aValue.localeCompare(bValue, 'fa');
        return sortDirection === 'asc' ? result : -result;
      } else {
        const result = (aValue as number) - (bValue as number);
        return sortDirection === 'asc' ? result : -result;
      }
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <Icon as={FiArrowUp} />;
    }
    return sortDirection === 'asc' ? <Icon as={FiChevronUp} /> : <Icon as={FiChevronDown} />;
  };

  const handleRemoveStudent = (membership: CourseMembership) => {
    const studentName = getFullName(membership);
    setStudentToDelete({
      id: membership.id,
      name: studentName,
      email: membership.user.email
    });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete || !courseId) return;
    
    setIsDeleting(true);
    try {
      await courseService.removeStudent(parseInt(courseId), studentToDelete.id);
      // Refresh the roster
      refetch();
      setShowDeleteModal(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error('Error removing student:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendEnrollmentNotification = () => {
    // TODO: Implement send enrollment notification functionality
    console.log('Send enrollment notification');
    // This could open a modal to compose and send emails to students
  };

  const handleAddStudentsOrStaff = () => {
    setShowAddStudentModal(true);
    setStudentEmail('');
    setAddStudentError('');
  };

  const handleConfirmAddStudent = async () => {
    if (!studentEmail.trim() || !courseId) return;
    
    setIsAdding(true);
    setAddStudentError('');
    try {
      await courseService.addUser(parseInt(courseId), studentEmail.trim());
      // Refresh the roster
      refetch();
      setShowAddStudentModal(false);
      setStudentEmail('');
      setAddStudentError('');
    } catch (error: any) {
      console.error('Error adding student:', error);
      // Show error message from API response
      const errorMessage = error?.response?.data?.detail || 'خطایی در اضافه کردن کاربر رخ داد';
      setAddStudentError(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  // Show loading state
  if (courseLoading || rosterLoading) {
    return (
      <Box bg={bgColor} minH="100vh" p={6} display="flex" alignItems="center" justifyContent="center">
        <VStack>
          <Spinner size="xl" color="blue.500" />
          <Text color={textColor}>در حال بارگذاری...</Text>
        </VStack>
      </Box>
    );
  }

  // Show error state
  if (courseError || !course) {
    return (
      <Box bg={bgColor} minH="100vh" p={6} display="flex" alignItems="center" justifyContent="center">
        <VStack>
          <Text color="red.500" fontSize="lg">خطا در بارگذاری درس</Text>
          <Text color={subtleText}>{courseError || 'درس یافت نشد'}</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <>
    <Grid
      templateAreas={{ base: `"main"`, md: `"aside main"` }}
      templateColumns={{ base: "1fr", md: "250px 1fr" }}
      minH="100vh"
      gap={0}
    >
      <GridItem area="aside" display={{ base: "none", md: "block" }}>
        <DynamicSidebar 
          courseTitle={course.title}
          courseSubtitle={`${convertEnglishTermToPersian(course.term)} ${course.year}`}
          courseCode={course.courseCode}
          instructor={course.instructor}
          courseId={courseId}
        />
      </GridItem>

      <GridItem area="main">
        <Box bg={bgColor} minH="100vh" p={{ base: 4, md: 6 }}>
          <VStack align="stretch" gap={6}>
            {/* Course Header */}
            <Box>
              <HStack align='center' gap={3} mb={2}>
                <Heading size="xl" color={textColor} fontWeight="bold">
                  {course.title}
                </Heading>
                <Box height="20px" width="1px" bg={subtleText} />
                <Text color={subtleText} fontSize="lg">
                  {convertEnglishTermToPersian(course.term)} {course.year}
                </Text>
              </HStack>
              <Text color={subtleText} fontSize="sm">
                شماره درس: {course.courseCode}
              </Text>
            </Box>
            
            {/* Roster Header */}
            <Flex justify="space-between" align="center">
              <Heading size="lg" color={textColor}>لیست افراد</Heading>
              <HStack gap={4}>
                <Box as="select" 
                     defaultValue={filterRole} 
                     onChange={(e) => setFilterRole((e.target as HTMLSelectElement).value)}
                     p={2}
                     borderWidth="1px"
                     borderRadius="md"
                     bg={bgColor}
                     color={textColor}
                     borderColor={borderColor}
                     fontSize="sm"
                >
                  <option value="all">همه نقش‌ها</option>
                  <option value="instructor">استاد</option>
                  <option value="ta">دستیار آموزشی</option>
                  <option value="student">دانشجو</option>
                </Box>
                <Box position="relative" maxW="300px">
                  <Icon 
                    as={FiSearch} 
                    color="gray.400" 
                    position="absolute"
                    left="12px"
                    top="50%"
                    transform="translateY(-50%)"
                    zIndex={1}
                    pointerEvents="none"
                  />
                    <Input
                      paddingRight={2}
                    placeholder="جستجو نام یا ایمیل..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg={bgColor}
                    borderColor={borderColor}
                    _hover={{ borderColor: "#4A90E2" }}
                    _focus={{ borderColor: "#2E5BBA", boxShadow: "0 0 0 1px #2E5BBA" }}
                    fontSize="sm"
                    pl="40px"
                  />
                </Box>
              </HStack>
            </Flex>

            {/* Roster Table */}
            {rosterError ? (
              <Box
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="md"
                py={16}
                textAlign="center"
                color="red.500"
              >
                <Text fontSize="lg" mb={4}>خطا در بارگذاری لیست افراد</Text>
                <Text color={subtleText} mb={4}>{rosterError}</Text>
                <Button onClick={refetch} colorScheme="blue">
                  تلاش مجدد
                </Button>
              </Box>
            ) : sortedAndFilteredRoster.length === 0 ? (
              <Box
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="md"
                py={16}
                textAlign="center"
                color={subtleText}
              >
                <Text fontSize="lg" mb={4}>هنوز هیچ دانشجویی ثبت‌نام نشده است.</Text>
                <Button paddingLeft={2} colorScheme="blue">
                  <Icon as={FiUserPlus} mr={2} />
                  افزودن دانشجو
                </Button>
              </Box>
            ) : (
              <Box
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="md"
                overflow="hidden"
              >
                <Table.Root>
                  <Table.Header bg={headerBg}>
                    <Table.Row>
                      <Table.ColumnHeader 
                        cursor="pointer" 
                        onClick={() => handleSort('name')}
                        _hover={{ bg: hoverBg }}
                        userSelect="none"
                        py={4}
                        px={6}
                      >
                        <HStack>
                          <Text fontSize="sm" fontWeight="semibold">نام و نام خانوادگی</Text>
                          {getSortIcon('name')}
                        </HStack>
                      </Table.ColumnHeader>
                      <Table.ColumnHeader 
                        cursor="pointer" 
                        onClick={() => handleSort('email')}
                        _hover={{ bg: hoverBg }}
                        userSelect="none"
                        py={4}
                        px={6}
                      >
                        <HStack>
                          <Text fontSize="sm" fontWeight="semibold">ایمیل</Text>
                          {getSortIcon('email')}
                        </HStack>
                      </Table.ColumnHeader>
                      <Table.ColumnHeader 
                        cursor="pointer" 
                        onClick={() => handleSort('role')}
                        _hover={{ bg: hoverBg }}
                        userSelect="none"
                        py={4}
                        px={6}
                      >
                        <HStack>
                          <Text fontSize="sm" fontWeight="semibold">نقش</Text>
                          {getSortIcon('role')}
                        </HStack>
                      </Table.ColumnHeader>
                      <Table.ColumnHeader 
                        cursor="pointer" 
                        onClick={() => handleSort('submissions')}
                        _hover={{ bg: hoverBg }}
                        userSelect="none"
                        py={4}
                        px={6}
                      >
                        <HStack>
                          <Text fontSize="sm" fontWeight="semibold">تکالیف ارسالی</Text>
                          {getSortIcon('submissions')}
                        </HStack>
                      </Table.ColumnHeader>
                      <Table.ColumnHeader py={4} px={6}>
                        <Text fontSize="sm" fontWeight="semibold">حذف</Text>
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {sortedAndFilteredRoster.map((membership) => (
                      <Table.Row 
                        key={membership.id} 
                        _hover={membership.role === 'instructor' ? {} : { bg: hoverBg }}
                        opacity={membership.role === 'instructor' ? 0.6 : 1}
                        cursor={membership.role === 'instructor' ? 'default' : 'pointer'}
                      >
                        <Table.Cell py={4} px={4}>
                          <Text 
                            fontWeight="medium" 
                            fontSize="sm"
                            color={membership.role === 'instructor' ? subtleText : textColor}
                          >
                            {getFullName(membership)}
                          </Text>
                        </Table.Cell>
                        <Table.Cell py={4} px={6}>
                          <Text 
                            color={membership.role === 'instructor' ? subtleText : subtleText} 
                            fontSize="sm"
                          >
                            {membership.user.email}
                          </Text>
                        </Table.Cell>
                        <Table.Cell py={4} px={6}>
                          <Badge 
                            colorScheme={getRoleColor(membership.role)} 
                            size="sm" 
                            padding={2} 
                            borderRadius="lg"
                            opacity={membership.role === 'instructor' ? 0.7 : 1}
                          >
                            {getRoleDisplay(membership.role)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell py={4} px={6}>
                          <Text 
                            fontSize="sm"
                            color={membership.role === 'instructor' ? subtleText : textColor}
                          >
                            0
                          </Text>
                        </Table.Cell>
                        <Table.Cell py={4} px={6}>
                          {membership.role === 'instructor' ? (
                              <Icon marginRight={3} as={FiTrash2} />

                          ) : (
                            <Tooltip.Root>
                              <Tooltip.Trigger asChild>
                                <IconButton
                                  aria-label="حذف دانشجو"
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleRemoveStudent(membership)}
                                >
                                  <Icon as={FiTrash2} />
                                </IconButton>
                              </Tooltip.Trigger>
                              <Tooltip.Content>
                                <Tooltip.Arrow />
                                حذف از درس
                              </Tooltip.Content>
                            </Tooltip.Root>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            )}
          </VStack>
        </Box>
      </GridItem>
    </Grid>

    {/* Bottom Action Bar */}
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="gray.100"
      borderTop="1px solid"
      borderColor="gray.300"
      p={{ base: 1, md: 2 }}
      zIndex={10}
      w="100%"
    >
      <HStack justify="space-between" mx="auto" px={{ base: 4, md: 6 }}>
        {/* Count Display */}
        <HStack gap={4}>
          <Text fontSize={{ base: "sm", md: "md" }} color={textColor}>
            {sortedAndFilteredRoster.filter(m => m.role === 'student').length} دانشجو
          </Text>
          <Text fontSize={{ base: "sm", md: "md" }} color={textColor}>
            {sortedAndFilteredRoster.filter(m => m.role === 'instructor').length} استاد
          </Text>
        </HStack>

        {/* Action Buttons */}
        <HStack gap={2}>
          <Button
            bg={bgColor}
            variant="outline"
            colorScheme="blue"
            size={{ base: "sm", md: "md" }}
            paddingLeft={2}
            borderColor="#4A90E2"
            color="#4A90E2"
            _hover={{ bg: "#4A90E2", color: "white" }}
            fontSize={{ base: "xs", md: "sm" }}
            onClick={() => handleSendEnrollmentNotification()}
          >
            <Icon as={FiMail} mr={2} />
            ارسال اطلاعیه ثبت‌نام
          </Button>
          <Button
            bg="#2E5BBA"
            color="white"
            size={{ base: "sm", md: "md" }}
            paddingLeft={2}
            _hover={{ bg: "#1E4A9A" }}
            fontSize={{ base: "xs", md: "sm" }}
            onClick={() => handleAddStudentsOrStaff()}
          >
            <Icon as={FiUsers} mr={2} />
            افزودن دانشجو  
          </Button>
        </HStack>
      </HStack>
    </Box>

    {/* Delete Confirmation Modal */}
    {showDeleteModal && studentToDelete && (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.600"
        zIndex={1000}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box
          bg={bgColor}
          borderRadius="lg"
          p={6}
          maxW="400px"
          w="90%"
          boxShadow="xl"
        >
          <VStack align="stretch" gap={4}>
            <Text fontSize="lg" fontWeight="bold" color={textColor} textAlign="center">
              حذف دانشجو از درس
            </Text>
            <Text fontSize="sm" color="red.500" textAlign="center">
              آیا مطمئن هستید که می‌خواهید "{studentToDelete.name}" را از درس حذف کنید؟
            </Text>
            <Text fontSize="xs" color={subtleText} textAlign="center">
              ایمیل: {studentToDelete.email}
            </Text>
            <HStack justify="center" gap={3} mt={4}>
              <Button
                paddingX={2}
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setStudentToDelete(null);
                }}
                disabled={isDeleting}
              >
                انصراف
              </Button>
              <Button
                paddingX={2}
                colorScheme="red"
                onClick={handleConfirmDelete}
                loading={isDeleting}
                loadingText="در حال حذف..."
              >
                حذف
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    )}

    {/* Add Student Modal */}
    {showAddStudentModal && (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.600"
        zIndex={1000}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box
          bg={bgColor}
          borderRadius="lg"
          p={6}
          maxW="400px"
          w="90%"
          boxShadow="xl"
        >
          <VStack align="stretch" gap={4}>
            <Text fontSize="lg" fontWeight="bold" color={textColor} textAlign="center">
              افزودن کاربر به درس
            </Text>
            <Text fontSize="sm" color={subtleText} textAlign="center">
              ایمیل کاربری که می‌خواهید به درس اضافه کنید را وارد کنید
            </Text>
            <Input
              placeholder="ایمیل کاربر"
              value={studentEmail}
              onChange={(e) => {
                setStudentEmail(e.target.value);
                if (addStudentError) setAddStudentError('');
              }}
              bg={bgColor}
              borderColor={addStudentError ? "red.500" : borderColor}
              _hover={{ borderColor: addStudentError ? "red.500" : "#4A90E2" }}
              _focus={{ 
                borderColor: addStudentError ? "red.500" : "#2E5BBA", 
                boxShadow: addStudentError ? "0 0 0 1px red.500" : "0 0 0 1px #2E5BBA" 
              }}
              fontSize="sm"
              type="email"
            />
            {addStudentError && (
              <Text fontSize="xs" color="red.500" textAlign="center">
                {addStudentError}
              </Text>
            )}
            <HStack justify="center" gap={3} mt={4}>
              <Button
                paddingX={2}
                variant="outline"
                onClick={() => {
                  setShowAddStudentModal(false);
                  setStudentEmail('');
                  setAddStudentError('');
                }}
                disabled={isAdding}
              >
                انصراف
              </Button>
              <Button
                paddingX={2}
                colorScheme="blue"
                onClick={handleConfirmAddStudent}
                loading={isAdding}
                loadingText="در حال اضافه کردن..."
                disabled={!studentEmail.trim()}
              >
                افزودن
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    )}
  </>
  );
};

export default RosterPage;
