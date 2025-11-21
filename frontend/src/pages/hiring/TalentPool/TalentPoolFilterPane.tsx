import { Grid } from "@mui/material";
import { GenericFilter, RangeFilter } from "./FilterPane";
import { useTalentPool } from "./TalentPoolContext";

const TITLE_MAP = {
  location: "Location",
  jobTitle: "Job Title",
  stages: "Stages",
  clients: "Clients",
  yearsOfExperience: "Years of Experience",
  type: "Type",
};

const TalentPoolFilterPane = () => {
  const {
    state: { filtersMeta },
  } = useTalentPool();
  if (!filtersMeta) return null;
  return (
    <Grid
      container
      sx={{
        bgcolor: "background.paper",
        borderRadius: "10px",
      }}
    >
      <Grid size={{ xs: 12 }}>
        <RangeFilter
          title="Years of Experience"
          filterKey="yearsOfExperience"
          min={0}
          max={15}
          step={1}
          unit=" years"
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <GenericFilter
          title="Levels"
          options={["Junior Level", "Mid Level", "Senior Level", "Lead"]}
          filterKey="levels"
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <GenericFilter
          title="Location"
          options={filtersMeta.location}
          filterKey="location"
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <GenericFilter
          title="Job Title"
          options={filtersMeta.jobTitle}
          filterKey="jobTitle"
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <GenericFilter
          title="Stages"
          options={filtersMeta.stages}
          filterKey="stages"
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <GenericFilter
          title="Clients"
          options={filtersMeta.clients}
          filterKey="clients"
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <GenericFilter
          title="Type"
          multiSelect={false}
          options={["Active", "Disqualified"]}
          filterKey="type"
        />
      </Grid>
    </Grid>
  );
};

export default TalentPoolFilterPane;
