import { Box, Grid, GridItem, Heading, VStack, HStack, Button, Icon } from "@chakra-ui/react";
import CourseCard from "./CourseCard";
import CreateCourseCard from "./CreateCourseCard";
import type { Course } from "./CourseCard";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { groupCoursesByTermYear, getSortedTermYearGroups, filterCoursesByYear } from "@/utils/persianDate";
import { useState } from "react";

interface CourseGridProps {
  courses: Course[];
  onCreateCourse?: () => void;
}

const CourseGrid = ({ courses, onCreateCourse }: CourseGridProps) => {
  const [showOlderCourses, setShowOlderCourses] = useState(false);
  
  // Filter courses: show only 1404+ by default, or all if showOlderCourses is true
  const filteredCourses = showOlderCourses ? courses : filterCoursesByYear(courses, 1404);
  
  // Group courses by term and year
  const coursesByTermYear = groupCoursesByTermYear(filteredCourses);
  const sortedTermYearGroups = getSortedTermYearGroups(coursesByTermYear);
  
  // Check if there are older courses (before 1404) to show the toggle
  const hasOlderCourses = courses.some(course => (course.year || 0) < 1404);

  return (
    <VStack align="start" width="100%">
      {sortedTermYearGroups.map((termYear) => (
        <Box key={termYear} width="100%" mb={8}>
          <Heading size="lg" mb={4} color="gray.700" fontFamily="inherit">
            {termYear}
          </Heading>
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
              xl: "repeat(4, 1fr)",
            }}
            gap={6}
          >
            {coursesByTermYear[termYear].map((course) => (
              <GridItem key={course.id}>
                <CourseCard course={course} />
              </GridItem>
            ))}
            {/* Show create course card in the most recent term */}
            {termYear === sortedTermYearGroups[0] && (
              <GridItem>
                <CreateCourseCard onClick={onCreateCourse} />
              </GridItem>
            )}
          </Grid>
        </Box>
      ))}
      
      {/* Show toggle button only if there are older courses */}
      {hasOlderCourses && (
        <Box width="100%" textAlign="center" pt={4}>
          <Button
            variant="ghost"
            color="blue.600"
            fontSize="md"
            _hover={{ textDecoration: "underline" }}
            onClick={() => setShowOlderCourses(!showOlderCourses)}
          >
            <HStack>
              <Icon as={showOlderCourses ? FiChevronUp : FiChevronDown} />
              <span>{showOlderCourses ? 'مخفی کردن دوره‌های قدیمی‌تر' : 'نمایش دوره‌های قدیمی‌تر'}</span>
            </HStack>
          </Button>
        </Box>
      )}
    </VStack>
  );
};

export default CourseGrid;
