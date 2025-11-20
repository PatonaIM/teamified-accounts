import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import {
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import talentPoolService from "../../../../services/hiring/talentPoolService";

interface CandidateDetails {
  id: number;
  fullname: string;
  email: string;
  fileName: string;
  jobId: string;
  jobDepartment: string;
  stage?: string;
  disqualified?: boolean;
  disqualificationReason?: string;
}

type Props = {
  candidate: CandidateDetails;
};

const getClientAvatarText = (clientName: string) => {
  return (clientName || "C").charAt(0).toUpperCase();
};

// Generate avatar color based on client name using theme palette
const getClientAvatarColorFromTheme = (clientName: string, theme: any) => {
  const themeColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.success.main,
    theme.palette.info.main,
  ];
  const text = clientName || "";
  const colorIndex = text.length % themeColors.length;
  return themeColors[colorIndex];
};

const Job = ({ candidate }: Props) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDeleteClick = useCallback(() => {
    setConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    setConfirmOpen(false);
    if (candidate.jobId) {
      try {
        setIsLoading(true);
        await talentPoolService.removeCandidateFromJob(
          candidate.id.toString(),
          candidate.jobId.toString(),
          "Removed by user"
        );
      } catch (error) {
        console.error("Error removing candidate:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [candidate.jobId, candidate.id]);

  const handleCancelDelete = useCallback(() => {
    setConfirmOpen(false);
  }, []);
  // Convert camelCase to normal case with proper capitalization
  const convertCamelCaseToNormalCase = (text: string) => {
    return text
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim(); // Remove any leading/trailing spaces
  };

  return (
    <Grid key={candidate.jobId}>
      <Grid
        container
        px={1}
        py={0.5}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
        }}
      >
        <Grid size={{ xs: 12 }}>
          <Grid container alignItems="center" spacing={1}>
            <Grid>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: 12,
                  fontWeight: 600,
                  bgcolor: getClientAvatarColorFromTheme(
                    candidate.jobDepartment,
                    theme,
                  ),
                  color: "primary.contrastText",
                }}
              >
                {getClientAvatarText(candidate.jobDepartment)}
              </Avatar>
            </Grid>
            <Grid sx={{ flexGrow: 1 }}>
              <Grid container direction="column">
                <Grid>
                  <Link
                    to={`/job-request/${candidate.jobId}?stage=${candidate.stage}`}
                  >
                    <Typography fontWeight={600} fontSize={13}>
                      {candidate.jobDepartment || "Job"}
                    </Typography>
                  </Link>
                </Grid>
                <Grid>
                  <Typography 
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    {candidate.jobDepartment || null}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            {candidate.disqualified && (
              <Grid>
                <Tooltip
                  title={
                    candidate.disqualificationReason || "No reason provided"
                  }
                  arrow
                  placement="top"
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 500,
                      color: "error.main",
                      bgcolor: "error.light",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "error.light",
                      cursor: "help",
                    }}
                  >
                    Disqualified
                  </Typography>
                </Tooltip>
              </Grid>
            )}
            {candidate.stage && (
              <Grid>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 500,
                    color: "text.secondary",
                    bgcolor: "action.hover",
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {convertCamelCaseToNormalCase(candidate.stage)}
                </Typography>
              </Grid>
            )}
            {candidate.stage === "screeningByTalentTeam" && (
              <Grid>
                <IconButton
                  size="small"
                  sx={{
                    width: 24,
                    height: 24,
                    color: "error.main",
                    "&:hover": {
                      bgcolor: "error.light",
                    },
                  }}
                  disabled={isLoading}
                  onClick={handleDeleteClick}
                >
                  {isLoading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <DeleteOutlined sx={{ fontSize: 16 }} />
                  )}
                </IconButton>
                {/* Confirmation Dialog */}
                <Dialog open={confirmOpen} onClose={handleCancelDelete}>
                  <DialogTitle
                    sx={{
                      textAlign: "center",
                      fontSize: "24px",
                      lineHeight: "32px",
                      color: "text.primary",
                    }}
                  >
                    Are you sure you want to remove the candidate from assigned
                    job?
                  </DialogTitle>
                  <DialogContent>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.primary",
                        textAlign: "center",
                      }}
                    >
                      Please note that if the candidate is removed from the job,
                      they will no longer appear in the list of candidates.
                    </Typography>
                    <Grid container justifyContent="center" spacing={2} mt={2}>
                      <Grid>
                        <Button
                          onClick={handleCancelDelete}
                          color="primary"
                          variant="outlined"
                          size="small"
                        >
                          Cancel
                        </Button>
                      </Grid>
                      <Grid>
                        <Button
                          onClick={handleConfirmDelete}
                          color="primary"
                          variant="contained"
                          size="small"
                        >
                          Remove Candidate{" "}
                        </Button>
                      </Grid>
                    </Grid>
                  </DialogContent>
                </Dialog>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Job;
