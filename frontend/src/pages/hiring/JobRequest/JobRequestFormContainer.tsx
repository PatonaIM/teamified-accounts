import { useNavigate, useParams } from "react-router-dom";
import { useJobRequest } from "../../../hooks/hiring/useJobRequests";
import Layout from "../../../components/hiring/HiringLayout";
// TODO: Phase 2B - Replace with portal theme styling
// import "../HireV3/index.scss";
import NewJobForm from "../HireV3/JobRequestTable/JobRequestForm";
import JobBreadcrumbs from "./JobBreadcrumbs";

type Props = {
  addNew?: boolean;
};

const JobRequestFormContainer = ({ addNew = true }: Props) => {
  const { id } = useParams();
  const { data, loading } = useJobRequest(id || "0");

  const navigate = useNavigate();
  const setShowNewJobRequest = (show: boolean) => {
    if (!show) {
      navigate(-1);
    }
  };
  return (
    <Layout
      body={
        <NewJobForm
          addNew={addNew}
          setShowNewJobRequest={setShowNewJobRequest}
          jobId={Number(id) || 0}
        />
      }
      header={
        <JobBreadcrumbs
          paths={
            addNew
              ? [{ label: "New Job Request", to: "/job-request/new" }]
              : [
                  {
                    label: (data as any)?.title || "Job Request",
                    to: `/job-request/${id}`,
                  },
                  {
                    label: "Edit Job Request",
                    to: `/job-request/${id}/details`,
                  },
                ]
          }
        />
      }
    ></Layout>
  );
};

export default JobRequestFormContainer;
