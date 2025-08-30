import CourseDashboard from "@/components/CourseDashboard";
import SideBar from "@/components/SideBar";
import { Box, Grid, GridItem, Show } from "@chakra-ui/react";

const HomePage = () => {
  return (
    <Grid
      templateAreas={{ base: `"main"`, md: `"aside main"` }}
      templateColumns={{
        base: "1fr",
        md: "250px 1fr",
      }}
    >

      <Box display={{ base: "none", md: "block" }}>
        <GridItem area="aside" paddingX={5} bg="blue">
            <SideBar />
          </GridItem>
      </Box>

      <GridItem area="main" bg="red">
        <CourseDashboard />
      </GridItem>
    </Grid>
  );
};

export default HomePage;
