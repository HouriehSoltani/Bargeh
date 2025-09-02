import { Box, Grid, GridItem, Heading, VStack, Button, Icon } from "@chakra-ui/react";
import CourseCard from "./CourseCard";
import CreateCourseCard from "./CreateCourseCard";
import type { Course } from "./CourseCard";
import { FiChevronDown } from "react-icons/fi";

interface CourseGridProps {
  courses: Course[];
}

const CourseGrid = ({ courses }: CourseGridProps) => {
  // Group courses by term
  const coursesByTerm = courses.reduce((acc, course) => {
    if (!acc[course.term]) {
      acc[course.term] = [];
    }
    acc[course.term].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  const sortedTerms = Object.keys(coursesByTerm).sort((a, b) => {
    const termOrder = { "Fall 2024": 1, "Spring 2024": 2, "Winter 2024": 3 };
    return (termOrder[a as keyof typeof termOrder] || 999) - (termOrder[b as keyof typeof termOrder] || 999);
  });

  return (
    <VStack align="start" width="100%">
      {sortedTerms.map((term) => (
        <Box key={term} width="100%" mb={8}>
          <Heading size="lg" mb={4} color="gray.700">
            {term}
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
            {coursesByTerm[term].map((course) => (
              <GridItem key={course.id}>
                <CourseCard course={course} />
              </GridItem>
            ))}
            {term === "Fall 2024" && (
              <GridItem>
                <CreateCourseCard />
              </GridItem>
            )}
          </Grid>
        </Box>
      ))}
      
      <Box width="100%" textAlign="center" pt={4}>
        <Button
          variant="ghost"
          color="blue.600"
          fontSize="md"
          _hover={{ textDecoration: "underline" }}
        >
          <Icon as={FiChevronDown}  />
          دوره های قدیمی تر
        </Button>
      </Box>
    </VStack>
  );
};

export default CourseGrid;
