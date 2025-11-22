import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { Country } from "country-state-city";
import { memo, useCallback, useMemo, useState, useEffect } from "react";
import talentPoolService from "../../../../../services/hiring/talentPoolService";
import jobRequestService from "../../../../../services/hiring/jobRequestService";
import { useAuth } from "../../../../../hooks/useAuth";

interface JobRequest {
  jobRequestId: number;
  title: string;
  workableInternalCode: string;
  client: string;
  location: string;
}

interface JobOptionProps {
  props: any;
  option: JobRequest;
  isAlreadyAdded: boolean;
}

const JobOption = memo(({ props, option, isAlreadyAdded }: JobOptionProps) => {
  return (
    <MenuItem
      {...props}
      key={option.jobRequestId}
      disabled={isAlreadyAdded}
      sx={{
        opacity: isAlreadyAdded ? 0.6 : 1,
        cursor: isAlreadyAdded ? "not-allowed" : "pointer",
        alignItems: "flex-start",
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 0.5,
          }}
        >
          {option.title && (
            <Typography variant="body2" fontWeight="medium">
              {option.title} ({option.workableInternalCode})
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
            {option.client}
          </Typography>
        </Box>
        {option.location && (
          <Typography variant="caption" color="text.secondary">
            {Country.getCountryByCode(option.location)?.name || option.location}
          </Typography>
        )}
      </Box>
      {isAlreadyAdded && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontStyle: "italic",
            marginLeft: 2,
            minWidth: "fit-content",
          }}
        >
          Already Added
        </Typography>
      )}
    </MenuItem>
  );
});

JobOption.displayName = "JobOption";

type Props = {
  candidateIds: string[];
  close?: () => void;
  preJobs?: number[];
};

const AssignJobDialog = ({ candidateIds, close, preJobs }: Props) => {
  const [data, setData] = useState<JobRequest[]>([]);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJobs, setSelectedJobs] = useState<JobRequest[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const response = await jobRequestService.getAllJobRequests();
        setData(response.data.jobRequests || []);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Sort jobs alphabetically by title and filter jobs with titles
  const sortedJobs = useMemo(() => {
    const jobRequests = [...data].filter(
      (job) => job.title && job.title.trim() !== "",
    ); // Filter out jobs with no title
    jobRequests.sort((a, b) => a.title.localeCompare(b.title));
    return jobRequests;
  }, [data]);

  const handleJobSelect = (event: any, newValue: JobRequest[]) => {
    // Filter out jobs that are already in preJobs list
    const filteredJobs = newValue.filter(
      (job) => !preJobs?.includes(job.jobRequestId),
    );
    setSelectedJobs(filteredJobs);
  };

  const isJobAlreadyAdded = useCallback(
    (jobId: number) => {
      return preJobs?.includes(jobId) || false;
    },
    [preJobs],
  );

  const renderJobOption = useCallback(
    (props: any, option: JobRequest) => {
      const isAlreadyAdded = isJobAlreadyAdded(option.jobRequestId);
      return (
        <JobOption
          props={props}
          option={option}
          isAlreadyAdded={isAlreadyAdded}
        />
      );
    },
    [isJobAlreadyAdded],
  );

  const handleRemoveJob = (jobToRemove: JobRequest) => {
    setSelectedJobs(
      selectedJobs.filter(
        (job) => job.jobRequestId !== jobToRemove.jobRequestId,
      ),
    );
  };

  const handleConfirmAssignment = useCallback(async () => {
    try {
      setIsAssigning(true);
      await talentPoolService.assignCandidateToJob(
        candidateIds,
        selectedJobs.map((job) => job.jobRequestId.toString()),
        "screeningByTalentTeam"
      );
      setShowConfirmation(false);
      close?.();
    } catch (error) {
      console.error("Assignment failed:", error);
      setShowConfirmation(false);
    } finally {
      setIsAssigning(false);
    }
  }, [
    candidateIds,
    selectedJobs,
    close,
  ]);

  const handleDone = useCallback(() => {
    if (candidateIds.length > 1) {
      setShowConfirmation(true);
    } else {
      handleConfirmAssignment();
    }
  }, [candidateIds.length, handleConfirmAssignment]);

  const handleCancelConfirmation = useCallback(() => {
    setShowConfirmation(false);
  }, []);

  if (isLoading) {
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ minHeight: 200 }}
      >
        <CircularProgress />
      </Grid>
    );
  }

  if (error) {
    return <Typography color="error">Error loading jobs</Typography>;
  }

  return (
    <Box sx={{ p: 3, minWidth: 500 }}>
      <Typography fontSize={"14px"} lineHeight={"20px"}>
        Select Open Jobs
      </Typography>

      {/* Multiselect for Jobs */}
      <FormControl fullWidth sx={{ mb: 2, mt: 0.5 }}>
        <Autocomplete
          multiple
          id="job-select"
          options={sortedJobs}
          value={selectedJobs}
          onChange={handleJobSelect}
          getOptionLabel={(option) => option.title}
          getOptionDisabled={(option) => isJobAlreadyAdded(option.jobRequestId)}
          renderOption={renderJobOption}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select one or multiple jobs"
              variant="outlined"
              InputProps={{
                sx: {
                  fontSize: "16px",
                  lineHeight: "24px",
                },
                ...params.InputProps,
              }}
            />
          )}
          renderTags={() => null} // We'll render chips separately below
          isOptionEqualToValue={(option, value) =>
            option.jobRequestId === value.jobRequestId
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              minHeight: "56px",
            },
          }}
        />
      </FormControl>

      {/* Selected Jobs as Chips */}
      {selectedJobs.length > 0 && (
        <Box>
          <Grid container spacing={1}>
            {selectedJobs.map((job) => (
              <Grid key={job.jobRequestId}>
                <Chip
                  label={
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 500,
                          color: "text.primary",
                        }}
                      >
                        {job.title} ({job.workableInternalCode})
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 500,
                          color: "text.secondary",
                        }}
                      >
                        {job.client} -{" "}
                        {Country.getCountryByCode(job.location)?.name ||
                          job.location}
                      </Typography>
                    </Box>
                  }
                  onDelete={() => handleRemoveJob(job)}
                  sx={{
                    height: "auto",
                    padding: "8px",
                    bgcolor: "action.hover",
                    borderRadius: "4px",
                    border: "none",
                    "& .MuiChip-label": {
                      display: "block",
                      whiteSpace: "normal",
                    },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Empty state */}
      {selectedJobs.length === 0 && (
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No jobs selected. Use the dropdown above to select jobs.
          </Typography>
        </Box>
      )}

      {/* Dialog Actions */}
      <DialogActions sx={{ px: 0, pt: 3, justifyItems: "center" }}>
        <Button onClick={close} color="inherit" variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleDone}
          color="primary"
          variant="contained"
          disabled={selectedJobs.length === 0 || isAssigning}
        >
          {isAssigning ? <CircularProgress size={24} /> : "Done"}
        </Button>
      </DialogActions>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmation}
        onClose={handleCancelConfirmation}
        aria-labelledby="confirmation-dialog-title"
      >
        <DialogTitle
          id="confirmation-dialog-title"
          align="center"
          fontSize={"24px"}
          lineHeight={"32px"}
        >
          Bulk Assign Jobs Confirmation
        </DialogTitle>
        <DialogContent>
          <Typography
            align="center"
            variant="body2"
            sx={{
              color: "text.primary",
            }}
          >
            Are you sure you want to assign {candidateIds.length} candidates to{" "}
            the following open role{selectedJobs.length === 1 ? "" : "s"}?
          </Typography>
          {selectedJobs.length > 0 && (
            <Box sx={{ mt: 2 }}>
              {selectedJobs.map((job) => (
                <Typography
                  key={job.jobRequestId}
                  align="center"
                  variant="body2"
                  sx={{
                    color: "text.primary",
                  }}
                >
                  - {job.workableInternalCode} ({job.client})
                </Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelConfirmation} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAssignment}
            color="primary"
            variant="contained"
            disabled={isAssigning}
          >
            {isAssigning ? (
              <CircularProgress size={20} />
            ) : (
              "Confirm Assignment"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignJobDialog;
