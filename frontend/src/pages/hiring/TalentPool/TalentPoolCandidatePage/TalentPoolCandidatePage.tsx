import { Avatar, Grid, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import talentPoolService from "../../../../services/hiring/talentPoolService";
import HiringLayout from "../../../../components/hiring/HiringLayout";
import HiringHeader from "../../../../components/hiring/HiringHeader/Header";
import AISuggestedCandidateInfo from "../../Candidate/AISuggestedCandidatePage/AISuggestedCandidateInfo";
import CandidateSubHeader from "../../Candidate/CandidatePage/CandidateSubHeader";
import JobBreadcrumbs from "../../JobRequest/JobBreadcrumbs";

const STORAGE_KEY = "talentPoolCandidatePageParams";

const TalentPoolCandidatePage = () => {
  const location = useLocation();
  const [params] = useSearchParams();
  const [persistedParams, setPersistedParams] = useState(() => {
    // Try to get from sessionStorage first
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {};
  });

  // Get params from URL or state or persisted storage
  const email =
    params.get("email") || location.state?.email || persistedParams.email;
  const jobId =
    params.get("jobId") || location.state?.jobId || persistedParams.jobId;

  // Store params in sessionStorage whenever they change
  useEffect(() => {
    const currentParams = {
      email: email || undefined,
      jobId: jobId || undefined,
      // Include any other state params you want to persist
      ...location.state,
    };

    // Only update if params have changed
    if (JSON.stringify(currentParams) !== JSON.stringify(persistedParams)) {
      setPersistedParams(currentParams);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(currentParams));
    }
  }, [email, jobId, location.state, persistedParams]);

  const [candidateData, setCandidateData] = useState<any>(null);

  useEffect(() => {
    if (!email) return;

    const fetchCandidateData = async () => {
      try {
        const data = await talentPoolService.getCandidateByEmail(email);
        setCandidateData(data);
      } catch (error) {
        console.error("Error fetching candidate data:", error);
      }
    };

    fetchCandidateData();
  }, [email]);

  // Refs for each jobId
  const jobRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll to the job div if jobId is present
  useEffect(() => {
    if (jobId && jobRefs.current[jobId]) {
      jobRefs.current[jobId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [jobId, candidateData?.data]);

  return (
    <HiringLayout
      header={
        <JobBreadcrumbs
          showBack={true}
          paths={[
            {
              label: "Talent Pool",
              to: `/talent-pool`,
            },
            {
              label: candidateData?.data?.[0]?.fullname || "Candidate",
              to: "/candidates/new",
            },
          ]}
        />
      }
      subHeader={
        <CandidateSubHeader
          candidate={candidateData?.data?.[0]}
          jobId={jobId || ""}
          showDownload={true}
          copyLink={`${window.location.origin}/talent-pool/candidate?email=${encodeURIComponent(email || "")}`}
        />
      }
      body={
        <Grid container direction={"column"} gap={2}>
          {/* Assigned Jobs Header */}
          {candidateData?.data && candidateData.data.length > 0 && (
            <Grid container alignItems="center" justifyContent="space-between">
              <Typography 
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                }}
              >
                Assigned Roles
              </Typography>
              <Grid
                container
                gap={1}
                width="auto"
                flexWrap="wrap"
                justifyContent="flex-end"
              >
                {candidateData.data.map((job, index) => (
                  <Avatar
                    key={job.jobId}
                    sx={{
                      bgcolor: "primary.main",
                      width: 32,
                      height: 32,
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    title={`Job ${job.jobId}`}
                    onClick={() => {
                      if (jobRefs.current[job.jobId.toString()]) {
                        jobRefs.current[job.jobId.toString()]?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }
                    }}
                  >
                    {(index + 1).toString()}
                  </Avatar>
                ))}
              </Grid>
            </Grid>
          )}

          {/* Job List */}
          <Grid container direction="column" gap={2}>
            {candidateData?.data &&
              candidateData.data.map((job) => (
                <div
                  key={job.jobId}
                  ref={(el) => (jobRefs.current[job.jobId.toString()] = el)}
                >
                  <AISuggestedCandidateInfo
                    candidate={job}
                    jobId={job.jobId.toString()}
                  />
                </div>
              ))}
          </Grid>
        </Grid>
      }
    ></HiringLayout>
  );
};

export default TalentPoolCandidatePage;
