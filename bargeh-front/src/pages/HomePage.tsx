import CourseDashboard from "@/components/CourseDashboard";
import SideBar from "@/components/SideBar";
import { Grid, GridItem } from "@chakra-ui/react";

const HomePage = () => {
  return (
    <Grid
      templateAreas={{ base: `"main"`, md: `"aside main"` }}
      templateColumns={{
        base: "1fr",
        md: "250px 1fr",
      }}
      minH="100vh"
      gap={0}
    >
      {/* Sidebar */}
      <GridItem area="aside" display={{ base: "none", md: "block" }}>
        <SideBar />
      </GridItem>

      {/* Main Content Area */}
      <GridItem area="main">
        <CourseDashboard />
      </GridItem>
    </Grid>
  );
};

export default HomePage;
