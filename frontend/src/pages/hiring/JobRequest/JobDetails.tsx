import { Button, Grid, Typography } from "@mui/material";
import { Country } from "country-state-city";
import moment from "moment";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { JobRequest } from "../../../types/hiring";
import { useJobRequest } from "../../../hooks/hiring/useJobRequests";

type Props = {
  request: JobRequest;
  openTimeline?: () => void;
};

const JobDetails = ({ request, openTimeline }: Props) => {
  const navigate = useNavigate();
  const { data: jobReqData, loading } = useJobRequest((request as any).jobRequestId?.toString() || "0");
  
  const jobData = jobReqData || request;
  const details = [
    {
      key: "Employment type",
      value: (jobData as any)?.employeeType || jobData?.employmentType,
    },
    {
      key: "Recruiter",
      value: (jobData as any)?.recruiter || jobData?.recruiterName || "Not Assigned",
    },
    {
      key: "Expected Joining date",
      value: (jobData as any)?.expectedJoiningDate 
        ? moment((jobData as any).expectedJoiningDate).format("Do MMMM, yyyy")
        : "N/A",
    },
    {
      key: "Client",
      value: (jobData as any).client || jobData.clientName,
    },
    {
      key: "Interview Time",
      value: (jobData as any)?.interviewTimes || "N/A",
    },
    {
      key: "Recruitment Location",
      value: (jobData as any)?.location
        ? Country.getCountryByCode((jobData as any).location)?.name
        : jobData.location || "",
    },
    {
      key: "Created Date",
      value: jobData.createdDate ? moment(jobData.createdDate).format("Do MMMM, yyyy") : "N/A",
    },
    {
      key: "Assessment",
      value: "No",
    },
    {
      key: "Salary Range",
      value: (jobData as any)?.expectedSalary || jobData.salaryRange,
    },
  ];
  const navigateToEdit = useCallback(() => {
    navigate(`/job-request/${(request as any).jobRequestId}/details`);
  }, [navigate, request]);
  return (
    <Grid 
      container 
      p={2} 
      direction={"column"}
      sx={{
        bgcolor: "background.default",
        borderRadius: 2,
      }}
    >
      <Grid container spacing={2}>
        {details.map((detail) => (
          <Grid
            container
            size={{ xs: 12, sm: 6, md: 4 }}
            key={detail.key}
            justifyContent={"space-between"}
            alignContent={"flex-start"}
          >
            <Grid size={{ xs: 6 }}>
              <Typography 
                variant="body2"
                sx={{
                  color: "text.secondary",
                }}
              >
                {detail.key}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                }}
              >
                {detail.value}
              </Typography>
            </Grid>
          </Grid>
        ))}
      </Grid>
      <Grid
        container
        justifyContent={"flex-end"}
        alignItems={"center"}
        spacing={2}
        mt={1}
      >
        <Grid size={{ xs: "auto" }}>
          <Button variant="outlined" onClick={openTimeline}>
            View Timeline
          </Button>
        </Grid>
        <Grid size={{ xs: "auto" }}>
          <Button variant="outlined" onClick={navigateToEdit}>
            Edit Request
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default JobDetails;
