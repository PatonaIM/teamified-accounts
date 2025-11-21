import { Grid } from "@mui/material";
import AISearchBar from "./AISearchBar";
import TalentPoolList from "./TalentPoolList";

const TalentPoolBody = () => {
  return (
    <Grid container spacing={2} direction={"column"}>
      <Grid size={{ xs: 12 }}>
        <AISearchBar />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TalentPoolList />
      </Grid>
    </Grid>
  );
};

export default TalentPoolBody;
