import CourseDashboard from "@/components/CourseDashboard";
import DynamicSidebar from "@/components/DynamicSidebar";
import { homeNavigationConfig } from "@/config/navigation";
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
        <DynamicSidebar config={homeNavigationConfig} />
      </GridItem>

      {/* Main Content Area */}
      <GridItem area="main">
        <CourseDashboard />
      </GridItem>
    </Grid>
  );
};

export default HomePage;
