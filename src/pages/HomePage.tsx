import CourseDashboard from "@/components/CourseDashboard";
import SideBar from "@/components/SideBar";
import { Grid, GridItem, Show } from "@chakra-ui/react";

const HomePage = () => {
  return (
    <Grid
      templateAreas={{ base: `"main"`, md: `"aside main"` }}
      templateColumns={{
        base: "1fr",
        md: "250px 1fr",
      }}
    >
      <Show when={{ md: true }}>
        <GridItem area="aside" paddingX={5} bg="blue">
          <SideBar />
        </GridItem>
      </Show>

      <GridItem area="main" bg="red">
        <CourseDashboard />
      </GridItem>
    </Grid>
  );
};

export default HomePage;
