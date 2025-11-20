import { Grid, Typography } from "@mui/material";
import { TransitionGroup } from "react-transition-group";
import type { InterviewMeeting } from "../../../types/hiring";
import InterviewComponent from "./InterviewComponent";
const InterviewBody = ({
  filteredData,
}: {
  filteredData: Array<any>;
}) => {
  return (
    <Grid container direction={"column"} mb={4}>
      <Grid
        container
        sx={{
          bgcolor: "background.paper",
          boxShadow: 1,
          height: "54px",
          gap: 1,
          px: 6,
          py: 2,
          mb: 2,
        }}
      >
        <Grid size={{ xs: 2 }}>
          <Typography variant="h5">Date & Time</Typography>
        </Grid>
        <Grid size={{ xs: 2 }}>
          <Typography variant="h5">Job</Typography>
        </Grid>
        <Grid size={{ xs: 1.5 }}>
          <Typography variant="h5">Candidate name</Typography>
        </Grid>
        <Grid size={{ xs: 1.5 }}>
          <Typography variant="h5">Scheduled by</Typography>
        </Grid>
        <Grid size={{ xs: 1.5 }}>
          <Typography variant="h5">Attended by</Typography>
        </Grid>
      </Grid>

      {filteredData.length > 0 ? (
        <Grid container>
          <TransitionGroup
            style={{
              display: "flex",
              flexDirection: "column-reverse",
              flex: 1,
              gap: "16px",
            }}
          >
            {filteredData.map((interview) => (
              <InterviewComponent
                interview={interview}
                key={interview.id}
              ></InterviewComponent>
            ))}
          </TransitionGroup>
        </Grid>
      ) : (
        <Grid
          container
          justifyContent={"center"}
          alignItems={"center"}
          height={"100%"}
        >
          <Typography 
            variant="body1"
            sx={{
              color: "text.secondary",
              fontSize: 18,
            }}
          >
            No interviews scheduled.
          </Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default InterviewBody;
