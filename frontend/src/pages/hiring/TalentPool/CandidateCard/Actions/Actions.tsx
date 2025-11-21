import { Grid, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import ApplicationHistory from "./ApplicationHistory";
import AssignJob from "./AssignJob";
import Resume from "./Resume";

interface CandidateDetails {
  id: number;
  fullname: string;
  email: string;
  fileName: string;
  jobId: string;
}

type Props = {
  candidate?: Array<CandidateDetails>;
};

const Actions = ({ candidate }: Props) => {
  return (
    <Grid container gap={1} alignItems={"center"}>
      <Grid>
        <IconButton size="small">
          <Link to={`mailto:${candidate?.[0]?.email || ""}`}>
            <img src="/images/MailOutlined.svg" alt="Mail" />
          </Link>
        </IconButton>
      </Grid>
      <Resume
        candidateName={candidate?.[0]?.fullname || ""}
        resumeFileName={candidate?.[0]?.fileName || ""}
      />
      <ApplicationHistory
        candidateId={candidate?.[0]?.id.toString() || ""}
        candidateName={candidate?.[0]?.fullname || ""}
      />
      <AssignJob
        candidateId={candidate?.[0]?.id.toString() || ""}
        candidateName={candidate?.[0]?.fullname || ""}
        preJobs={candidate?.map((job) => Number(job.jobId)) || []}
      />
    </Grid>
  );
};

export default Actions;
