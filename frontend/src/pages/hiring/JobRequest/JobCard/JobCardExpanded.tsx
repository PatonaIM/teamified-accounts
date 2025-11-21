import { memo, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { ACTIVE_VIEW, type JobRequest } from "../../../../types/hiring";
import JobDetails from "../JobDetails";
import DeleteJobRequestPage from "./DeleteJobRequestPage";
import JobTimeline from "./JobTimeline";

type Props = {
  jobRequest: JobRequest;
  view: ACTIVE_VIEW | string;
  setSelectedStage: (view: string) => void;
};

const JobCardExpanded = ({ view, jobRequest, setSelectedStage }: Props) => {
  const openTimeline = useCallback(() => {
    setSelectedStage(ACTIVE_VIEW.timeline);
  }, []);
  const handleClose = useCallback(() => {
    setSelectedStage("");
  }, [setSelectedStage]);
  switch (view) {
    case ACTIVE_VIEW.view: {
      return <Navigate to={`/job-request/${jobRequest.jobRequestId}`} />;
    }
    case ACTIVE_VIEW.details: {
      return <JobDetails request={jobRequest} openTimeline={openTimeline} />;
    }
    case ACTIVE_VIEW.timeline: {
      return <JobTimeline cancel={handleClose} request={jobRequest} />;
    }
    case ACTIVE_VIEW.clone: {
      return <Navigate to={`/job-request/${jobRequest.jobRequestId}/clone`} />;
    }
    case ACTIVE_VIEW.edit: {
      return (
        <Navigate to={`/job-request/${jobRequest.jobRequestId}/details`} />
      );
    }
    case ACTIVE_VIEW.delete: {
      return (
        <DeleteJobRequestPage
          requestId={jobRequest.jobRequestId}
          cancel={handleClose}
        />
      );
    }
    default:
      return null;
  }
};

export default memo(JobCardExpanded, (prevProps, nextProps) => {
  return (
    prevProps.jobRequest.jobRequestId === nextProps.jobRequest.jobRequestId &&
    prevProps.view === nextProps.view
  );
});
