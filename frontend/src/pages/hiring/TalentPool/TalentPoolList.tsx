import { Grid } from "@mui/material";
import TalentPoolCandidatesList from "./TalentPoolCandidatesList";
import TalentPoolFilterPane from "./TalentPoolFilterPane";

const TalentPoolList = () => {
  return (
    <Grid
      container
      gap={2}
      wrap="nowrap"
      sx={{
        height: "calc(100vh - 266px)",
        maxHeight: "100vh",
        overflow: "hidden",
      }}
    >
      <Grid size={{ xs: 12, md: 3 }} sx={{ height: "100%", overflow: "auto" }}>
        <TalentPoolFilterPane />
      </Grid>
      <Grid size={{ xs: 12, md: 9 }} sx={{ height: "100%", overflow: "auto" }}>
        <TalentPoolCandidatesList />
      </Grid>
    </Grid>
  );
};

export default TalentPoolList;
