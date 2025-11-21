import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import Job from "./Job";

interface CandidateDetails {
  id: number;
  fullname: string;
  email: string;
  fileName: string;
  jobId: string;
  jobTitle: string;
  jobDepartment: string;
}

type Props = {
  candidate: Array<CandidateDetails>;
};

// Generate avatar text from job title or client name
const getAvatarText = (job: string) => {
  return (job || "J").charAt(0).toUpperCase();
};

// Generate avatar colors based on job title using theme palette
const getAvatarColorFromTheme = (job: string, index: number, theme: any) => {
  const themeColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.success.main,
    theme.palette.info.main,
  ];
  const text = job || "";
  const colorIndex = (text.length + index) % themeColors.length;
  return themeColors[colorIndex];
};

const JobList = ({ candidate }: Props) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const handleExpandClick = () => {
    setExpanded((prev) => !prev);
    setShowAll(false);
  };

  const handleViewAll = () => {
    setShowAll(true);
  };

  const jobsToShow = showAll ? candidate : candidate.slice(0, 3);

  const maxAvatarsToShow = 3;
  const remainingCount =
    candidate.length > maxAvatarsToShow
      ? candidate.length - maxAvatarsToShow
      : 0;

  return (
    <Grid container direction="column">
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        onClick={handleExpandClick}
        sx={{ cursor: "pointer" }}
      >
        <Grid>
          <Grid container alignItems="center" spacing={1}>
            <Grid>
              <Typography 
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                }}
              >
                Assigned To Jobs
              </Typography>
            </Grid>
            {candidate.length > 0 && (
              <Grid>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {candidate.slice(0, maxAvatarsToShow).map((job, index) => (
                    <Avatar
                      key={job.jobId || index}
                      sx={{
                        width: 24,
                        height: 24,
                        fontSize: 10,
                        fontWeight: 600,
                        bgcolor: getAvatarColorFromTheme(
                          job.jobTitle || job.jobDepartment,
                          index,
                          theme,
                        ),
                        color: "primary.contrastText",
                        marginLeft: index > 0 ? "-8px" : "0px",
                        border: "2px solid",
                        borderColor: "background.paper",
                        zIndex: maxAvatarsToShow - index,
                      }}
                    >
                      {getAvatarText(job.jobDepartment)}
                    </Avatar>
                  ))}
                  {remainingCount > 0 && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: "primary.main",
                        ml: 1,
                      }}
                      align={"center"}
                    >
                      +{remainingCount}
                    </Typography>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid>
          <Grid container alignItems="center" spacing={0.5}>
            <Grid>
              <Typography 
                variant="caption"
                sx={{
                  color: "text.secondary",
                }}
              >
                Expand Details
              </Typography>
            </Grid>
            <Grid>
              <IconButton size="small">
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Grid container direction="column" spacing={1} mt={1}>
            {jobsToShow.map((job, idx) => (
              <Job key={job.jobId || idx} candidate={job} />
            ))}
          </Grid>
          {candidate.length > 3 && !showAll && (
            <Grid container justifyContent="center" mt={1}>
              <Grid>
                <Button size="small" onClick={handleViewAll} variant="text">
                  View All
                </Button>
              </Grid>
            </Grid>
          )}
        </Collapse>
      </Grid>
    </Grid>
  );
};

export default JobList;
