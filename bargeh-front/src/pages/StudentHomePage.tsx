import CourseDashboard from "@/components/CourseDashboard";
import DynamicSidebar from "@/components/DynamicSidebar";
import { getHomeNavigationConfig } from "@/config/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Grid, GridItem } from "@chakra-ui/react";

const StudentHomePage = () => {
  const { user } = useAuth();
  
  return (
    <Grid
      templateAreas={{ base: `"main"`, md: `"aside main"` }}
      templateColumns={{
        base: "1fr",
        md: "300px 1fr",
      }}
      minH="100vh"
      gap={0}
    >
      {/* Sidebar */}
      <GridItem area="aside" display={{ base: "none", md: "block" }}>
        <DynamicSidebar config={getHomeNavigationConfig(user?.role)} />
      </GridItem>

      {/* Main Content Area */}
      <GridItem area="main">
        <CourseDashboard />
      </GridItem>
    </Grid>
  );
};

export default StudentHomePage;
