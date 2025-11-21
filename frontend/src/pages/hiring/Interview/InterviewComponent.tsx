import { Button, Grid, Skeleton, Tooltip, Typography } from "@mui/material";
import moment from "moment";
import { memo, useCallback, useState } from "react";
import { useJobRequest } from "../../../hooks/hiring/useJobRequests";
import RescheduleErrorBook from "./RescheduleErrorBook";
import RescheduleModal from "./RescheduleModal";

const InterviewComponent = ({ interview }: { interview: any }) => {
  const { data, loading: isFetching } = useJobRequest(interview.jobId?.toString() || "0");

  const [showError, setShowError] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const openReschedule = useCallback(() => {
    setShowReschedule(true);
  }, []);
  const closeReschedule = useCallback(() => {
    setShowReschedule(false);
  }, []);

  const showErrorModal = useCallback(() => {
    closeReschedule();
    setShowError(true);
  }, []);
  const closeErrorModal = useCallback(() => {
    setShowError(false);
  }, []);
  return (
    <Grid
      container
      sx={{
        bgcolor: "background.paper",
        boxShadow: 1,
        gap: 1,
        px: 6,
        py: 2,
      }}
    >
      <RescheduleModal
        interviewerEmail={interview.interviewerEmail}
        interviewerName={interview.interviewerName}
        interviewId={interview.id}
        open={showReschedule}
        closeModal={closeReschedule}
        showError={showErrorModal}
      ></RescheduleModal>
      <RescheduleErrorBook closeModal={closeErrorModal} open={showError} />
      <Grid size={{ xs: 2 }}>
        <Typography variant="body1">
          {moment(interview.meetingStartedOn).format("MM-DD-yyyy (dddd)")}
        </Typography>
        <Typography variant="body1">
          {moment.utc(interview.meetingStartedOn).local().format("hh:mm")} to{" "}
          {moment.utc(interview.meetingEndedOn).local().format("hh:mm")} (
          {Intl.DateTimeFormat().resolvedOptions().timeZone})
        </Typography>
      </Grid>
      <Grid size={{ xs: 2 }}>
        {isFetching ? (
          <Skeleton width={"30px"}></Skeleton>
        ) : (
          <Typography variant="body1">{(data as any)?.title || data?.jobTitle}</Typography>
        )}
      </Grid>
      <Grid size={{ xs: 1.5 }}>
        <Tooltip title={interview.candidateName}>
          <Typography
            variant="body1"
            overflow={"hidden"}
            textOverflow={"ellipsis"}
          >
            {interview.candidateName}
          </Typography>
        </Tooltip>
      </Grid>
      <Grid size={{ xs: 1.5 }}>
        <Tooltip title={interview.interviewerName}>
          <Typography
            variant="body1"
            overflow={"hidden"}
            textOverflow={"ellipsis"}
          >
            {interview.interviewerName}
          </Typography>
        </Tooltip>
      </Grid>
      <Grid size={{ xs: 1.5 }}>
        <Tooltip title={interview.attendeesEmail.split(",").join("\n")}>
          <Typography variant="body1">
            {interview.attendeesEmail.split(",").length} people
          </Typography>
        </Tooltip>
      </Grid>
      <Grid size={{ xs: 1.5 }}>
        <Button
          variant="contained"
          disabled={moment().isAfter(moment(interview.meetingEndedOn))}
          onClick={() => {
            window.open(interview.link, "_blank");
          }}
        >
          Google Meet
        </Button>
      </Grid>
      {moment().isBefore(moment(interview.meetingEndedOn)) && (
        <Grid size={{ xs: 1 }}>
          <Button variant="text" onClick={openReschedule}>
            Reschedule
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export default memo(InterviewComponent);
