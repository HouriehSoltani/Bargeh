import { Box, Grid, GridItem, Heading, VStack, Button, Icon } from "@chakra-ui/react";
import CourseCard from "./CourseCard";
import CreateCourseCard from "./CreateCourseCard";
import type { Course } from "./CourseCard";
import { FiChevronDown } from "react-icons/fi";
import { groupCoursesByPersianTerm, getSortedPersianTerms } from "@/utils/persianDate";

interface CourseGridProps {
  courses: Course[];
  onCreateCourse?: () => void;
}

const CourseGrid = ({ courses, onCreateCourse }: CourseGridProps) => {
  // Group courses by Persian season-year
  const coursesByPersianTerm = groupCoursesByPersianTerm(courses);
  const sortedPersianTerms = getSortedPersianTerms(coursesByPersianTerm);

  return (
    <VStack align="start" width="100%">
      {sortedPersianTerms.map((persianTerm) => (
        <Box key={persianTerm} width="100%" mb={8}>
          <Heading size="lg" mb={4} color="gray.700" fontFamily="inherit">
            {persianTerm}
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
            {coursesByPersianTerm[persianTerm].map((course) => (
              <GridItem key={course.id}>
                <CourseCard course={course} />
              </GridItem>
            ))}
            {/* Show create course card in the most recent term */}
            {persianTerm === sortedPersianTerms[0] && (
              <GridItem>
                <CreateCourseCard onClick={onCreateCourse} />
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
